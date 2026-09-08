/**
 * دروازهٔ قابلیت — تنها مسیر رسیدن به اپ‌ها.
 * کاتالوگ قابلیت‌ها را نگه می‌دارد، مجوز داده را اعمال می‌کند، سلامت را می‌سنجد، و فقط خواندن و ساختن قرارداد را منتشر می‌کند.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { q, json } from '../db.js';
import { now, id } from '../util/ids.js';
import { AppRow, getApp, upsert } from './registry.js';
import { ledgerAppend } from '../ledger.js';

export interface ToolInfo { name: string; title?: string; description?: string; inputSchema: any; kind: 'read' | 'build' | 'fulfil' | 'write'; exposed: boolean; reason?: string }
export interface VistaManifest {
  vista: '1'; id: string; name: string; description?: string; long_description?: string; company?: { name: string; registration?: string } | string;
  public_key: string; appearance?: { color?: string; logo?: string };
  permissions?: { key: string; label: string; description?: string }[];
  financial_permissions?: { key: string; label: string; cap_default?: number; period?: string; description?: string }[];
  data_permissions?: string[];
  tools?: { read?: string[]; build?: string[]; fulfil?: string };
  mini_app_url?: string; category?: string;
  templates?: { ref: string; title: string; min_rung?: number; settlement?: 'immediate' | 'on_delivery'; description?: string }[];
}

const READ_RE = /^(get|list|search|read|fetch|find|query|lookup|describe|show|check|browse|ask|view|count|look|explain|resolve|whoami|status|info|details|summar)/i;
const WRITE_RE = /^(create|add|update|delete|remove|set|post|push|merge|write|send|edit|assign|close|open|reopen|submit|fork|star|unstar|run|trigger|cancel|dismiss|request|resolve_|approve|comment|reply|upload|rerun|enable|disable|subscribe|unsubscribe)/i;

/** Which tools reach the assistant. Vista apps: manifest decides. Others: read-only by annotation or name; everything effectful is hidden. */
export function classifyTools(tools: any[], manifest: VistaManifest | null): ToolInfo[] {
  return tools.map((t) => {
    const base = { name: t.name, title: t.title ?? t.annotations?.title, description: t.description, inputSchema: t.inputSchema };
    if (manifest?.tools) {
      if (manifest.tools.fulfil === t.name) return { ...base, kind: 'fulfil', exposed: false, reason: 'ابزار تحویل؛ فقط پردازشگر صدایش می‌زند' };
      if (manifest.tools.build?.includes(t.name)) return { ...base, kind: 'build', exposed: true };
      if (manifest.tools.read?.includes(t.name)) return { ...base, kind: 'read', exposed: true };
      return { ...base, kind: 'write', exposed: false, reason: 'در مانیفست اعلام نشده' };
    }
    const ann = t.annotations ?? {};
    if (ann.readOnlyHint === true) return { ...base, kind: 'read', exposed: true };
    if (ann.readOnlyHint === false || ann.destructiveHint === true) return { ...base, kind: 'write', exposed: false, reason: 'اثر دارد — در ویستا نوشتن قرارداد است' };
    if (WRITE_RE.test(t.name)) return { ...base, kind: 'write', exposed: false, reason: 'اثر دارد — در ویستا نوشتن قرارداد است' };
    if (READ_RE.test(t.name)) return { ...base, kind: 'read', exposed: true };
    return { ...base, kind: 'write', exposed: false, reason: 'نامعلوم؛ برای احتیاط پنهان شد' };
  });
}

interface Conn { client: Client; transport: any; at: number; key: string }
const conns = new Map<string, Conn>();
const CONN_TTL = 5 * 60_000;

function headersFor(app: AppRow, credential?: string | null): Record<string, string> {
  const h: Record<string, string> = { 'user-agent': 'vista-gateway/0.1' };
  const auth = json.parse<any>(app.auth_json, null);
  if (credential) h[auth?.header ?? 'authorization'] = auth?.prefix === '' ? credential : `Bearer ${credential}`;
  return h;
}
async function open(app: AppRow, credential?: string | null): Promise<Client> {
  if (!app.url) throw new Error('اپ آدرس MCP ندارد');
  const key = `${app.id}|${credential ? credential.slice(-6) : ''}`;
  const cached = conns.get(key);
  if (cached && Date.now() - cached.at < CONN_TTL) return cached.client;
  if (cached) { try { await cached.client.close(); } catch { /* ignore */ } conns.delete(key); }
  const headers = headersFor(app, credential);
  const client = new Client({ name: 'vista', version: '0.1.0' });
  const url = new URL(app.url);
  try {
    const transport = new StreamableHTTPClientTransport(url, { requestInit: { headers } });
    await client.connect(transport);
    conns.set(key, { client, transport, at: Date.now(), key });
    return client;
  } catch (e1: any) {
    try {
      const transport = new SSEClientTransport(url, { requestInit: { headers }, eventSourceInit: { fetch: (u: any, init: any) => fetch(u, { ...init, headers: { ...(init?.headers ?? {}), ...headers } }) } as any });
      const c2 = new Client({ name: 'vista', version: '0.1.0' });
      await c2.connect(transport);
      conns.set(key, { client: c2, transport, at: Date.now(), key });
      return c2;
    } catch (e2: any) {
      throw new Error(e1?.message?.includes('401') || e2?.message?.includes('401') ? 'اپ توکن معتبر می‌خواهد (401)' : `اتصال برقرار نشد: ${(e1?.message ?? e1).toString().slice(0, 120)}`);
    }
  }
}
export async function closeAll() { for (const c of conns.values()) { try { await c.client.close(); } catch { /* ignore */ } } conns.clear(); }

/** Connect, read tools and (if present) the Vista manifest. Updates the registry. */
export async function probe(app: AppRow, credential?: string | null): Promise<{ manifest: VistaManifest | null; tools: ToolInfo[] }> {
  try {
    const client = await open(app, credential);
    const tl = await client.listTools();
    let manifest: VistaManifest | null = null;
    try {
      const caps = client.getServerCapabilities();
      if (caps?.resources) {
        const r = await client.readResource({ uri: 'vista://manifest' });
        const text = (r.contents?.[0] as any)?.text;
        if (text) manifest = JSON.parse(text);
      }
    } catch { manifest = null; }
    const tools = classifyTools(tl.tools ?? [], manifest);
    const patch: Partial<AppRow> = { id: app.id, tools_json: JSON.stringify(tools) };
    if (manifest?.vista === '1') {
      const company = typeof manifest.company === 'string' ? manifest.company : manifest.company?.name;
      Object.assign(patch, {
        kind: 'vista', name: manifest.name, description: manifest.description ?? app.description, long_description: manifest.long_description ?? app.long_description,
        public_key: manifest.public_key, color: manifest.appearance?.color ?? app.color, logo: manifest.appearance?.logo ?? app.logo, company: company ?? app.company,
        permissions_json: JSON.stringify(manifest.permissions ?? []), financial_permissions_json: JSON.stringify(manifest.financial_permissions ?? []),
        data_permissions_json: JSON.stringify(manifest.data_permissions ?? []), fulfillment_tool: manifest.tools?.fulfil ?? null, mini_app_url: manifest.mini_app_url ?? app.mini_app_url,
        category: manifest.category ?? app.category, manifest_json: JSON.stringify(manifest),
      });
    }
    await upsert({ ...app, ...patch, verified: app.verified, in_catalog: app.in_catalog, health: 'up' });
    await q.run("UPDATE apps SET health='up', health_checked_at=?, last_error=NULL WHERE id=?", now(), app.id);
    return { manifest, tools };
  } catch (e: any) {
    await q.run("UPDATE apps SET health='down', health_checked_at=?, last_error=? WHERE id=?", now(), String(e?.message ?? e).slice(0, 200), app.id);
    throw e;
  }
}

/** Data permission filter: only what the app declared reaches it. */
export function contextFor(app: AppRow, user: { id: string; phone: string; first_name: string | null; last_name: string | null }, granted: string[]) {
  const data: string[] = json.parse(app.data_permissions_json, []);
  const ctx: Record<string, unknown> = { user_ref: `u_${user.id.slice(-10)}`, app_id: app.id };
  if (data.includes('profile.phone') && granted.includes('profile.read')) ctx.phone = user.phone;
  if (data.includes('profile.name') && granted.includes('profile.read')) ctx.name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  ctx.user_id = `user:${user.id}`;
  return ctx;
}

export interface CallResult { content: any[]; structured?: any; isError?: boolean }
/** Call an exposed tool for a user. Hidden tools are refused here, not just from the model. */
export async function callTool(app: AppRow, toolName: string, args: Record<string, unknown>, opts: { credential?: string | null; meta?: Record<string, unknown>; allowHidden?: boolean }): Promise<CallResult> {
  const tools = json.parse<ToolInfo[]>(app.tools_json, []);
  const t = tools.find((x) => x.name === toolName);
  if (!t) throw new Error(`قابلیت ${toolName} در این اپ نیست`);
  if (!t.exposed && !opts.allowHidden) throw new Error(`قابلیت ${toolName} در ویستا منتشر نشده است (${t.reason ?? 'اثر دارد'})`);
  const client = await open(app, opts.credential);
  const res: any = await client.callTool({ name: toolName, arguments: args, _meta: opts.meta ? { vista: opts.meta } : undefined });
  if (opts.meta && (opts.meta as any).sensitive) await ledgerAppend('disclosure', { appId: app.id, tool: toolName, fields: Object.keys(opts.meta) }, { appId: app.id, userId: String((opts.meta as any).user_id ?? '').replace('user:', '') });
  return { content: res.content ?? [], structured: res.structuredContent, isError: !!res.isError };
}

/** Periodic health — the list greys out apps that are down. */
export async function healthSweep() {
  const apps = await q.all<AppRow>("SELECT * FROM apps WHERE kind IN ('vista','mcp') AND url IS NOT NULL");
  for (const a of apps) {
    const auth = json.parse<any>(a.auth_json, null);
    if (auth?.required && !a.tools_json.includes('"name"')) {
      // cannot probe without a credential; mark unknown rather than down
      await q.run("UPDATE apps SET health=CASE WHEN health='up' THEN 'up' ELSE 'unknown' END, health_checked_at=? WHERE id=?", now(), a.id);
      continue;
    }
    try { await probe(a); } catch { /* recorded in probe */ }
  }
}
export function toolText(r: CallResult): string {
  if (r.structured) return JSON.stringify(r.structured);
  return r.content.map((c) => (c.type === 'text' ? c.text : c.type === 'resource' ? c.resource?.text ?? '' : `[${c.type}]`)).join('\n');
}
export { getApp, id };
