import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { z } from 'zod';
import { config } from '../config.js';
import { q, json } from '../db.js';
import { id, now, plusMinutes } from '../util/ids.js';
import { normalizePhone, toman } from '../util/persian.js';
import { formatJalaliDateTime, isoToJalali } from '../util/jalali.js';
import { ledgerVerify } from '../ledger.js';
import * as auth from '../auth/service.js';
import type { User } from '../auth/service.js';
import * as chats from '../chats/service.js';
import { wallet, getWallet, available } from '../wallet/service.js';
import * as engine from '../contracts/engine.js';
import * as sys from '../contracts/system.js';
import * as dlg from '../contracts/delegation.js';
import { platformPublicKey, platformSign } from '../contracts/keys.js';
import * as reg from '../gateway/registry.js';
import * as mcp from '../gateway/mcp.js';
import { runAssistant, assistantAvailable, providerFor } from '../assistant/agent.js';
import { simulateExhaustion, APP_ID as SAMPLE_APP } from '../sample-app/index.js';

type Env = { Variables: { user: User; token: string } };
export const api = new Hono<Env>();

const err = (c: any, e: any) => {
  const status = e?.status ?? (e instanceof engine.ContractError || e instanceof auth.AuthError ? 400 : 500);
  if (status >= 500) console.error(e);
  return c.json({ error: e?.code ?? 'error', message: e?.message ?? String(e) }, status);
};
const body = async <T>(c: any, schema: z.ZodType<T>): Promise<T> => {
  const b = await c.req.json().catch(() => ({}));
  const r = schema.safeParse(b);
  if (!r.success) throw Object.assign(new Error(r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('؛ ')), { status: 400, code: 'bad_request' });
  return r.data;
};
const device = (c: any) => (c.req.header('user-agent') ?? '').slice(0, 120);

// ───────────────────────── public ─────────────────────────
api.get('/platform', (c) => c.json({ name: 'ویستا', version: '0.1.0', public_key: platformPublicKey(), assistant_configured: !!(config.ai.baseUrl && config.ai.apiKey && config.ai.model), sms_provider: config.sms.provider, otp_accept_any: config.sms.otpAcceptAny, gateway: config.payment.gateway, ceilings: config.ceilings }));

api.post('/auth/otp', async (c) => {
  try {
    const { phone } = await body(c, z.object({ phone: z.string() }));
    const p = normalizePhone(phone);
    if (!p) return c.json({ error: 'phone', message: 'شمارهٔ موبایل معتبر نیست (نمونه: ۰۹۱۲۱۲۳۴۵۶۷).' }, 400);
    const r = await auth.requestOtp(p, 'login');
    return c.json({ otp_id: r.otpId, phone: p, sent: r.sms.ok, provider: r.sms.provider, dev_code: r.devCode, accept_any: config.sms.otpAcceptAny });
  } catch (e) { return err(c, e); }
});
api.post('/auth/verify', async (c) => {
  try {
    const { otp_id, phone, code } = await body(c, z.object({ otp_id: z.string(), phone: z.string(), code: z.string() }));
    const p = normalizePhone(phone)!;
    auth.verifyOtp(otp_id, p, code, 'login');
    const u = auth.getOrCreateUser(p);
    const token = auth.createSession(u.id, device(c));
    return c.json({ token, user: auth.publicUser(u) });
  } catch (e) { return err(c, e); }
});

// ───────────────────────── auth middleware ─────────────────────────
api.use('*', async (c, next) => {
  const h = c.req.header('authorization') ?? '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : c.req.query('token') ?? undefined;
  const s = auth.sessionUser(token);
  if (!s) return c.json({ error: 'unauthorized', message: 'وارد نشده‌اید.' }, 401);
  c.set('user', s.user); c.set('token', s.token);
  await next();
});
api.get('/me', (c) => {
  const u = c.get('user');
  return c.json({ user: auth.publicUser(u), assistant_available: assistantAvailable(u), provider: providerFor(u)?.source ?? null, wallet: getWallet(u.id), pending: q.get<{ n: number }>("SELECT COUNT(*) n FROM contracts WHERE user_id=? AND status='awaiting'", u.id)?.n ?? 0 });
});
api.post('/auth/logout', (c) => { auth.logout(c.get('token')); return c.json({ ok: true }); });

// ───────────────────────── onboarding ─────────────────────────
api.post('/kyc/identity', async (c) => {
  try { const { national_id, birth_date } = await body(c, z.object({ national_id: z.string(), birth_date: z.string() })); return c.json(auth.submitIdentity(c.get('user'), national_id, birth_date)); } catch (e) { return err(c, e); }
});
api.get('/kyc/name-lookup', (c) => c.json(auth.nameLookup(c.get('user').phone)));
api.post('/kyc/name', async (c) => {
  try { const { first_name, last_name } = await body(c, z.object({ first_name: z.string(), last_name: z.string() })); auth.submitName(c.get('user'), first_name, last_name); return c.json({ ok: true }); } catch (e) { return err(c, e); }
});
api.post('/onboarding/genesis', (c) => {
  try {
    const u = c.get('user');
    if (!u.national_id || !u.first_name) return c.json({ error: 'kyc', message: 'ابتدا احراز هویت را کامل کنید.' }, 400);
    const existing = q.get<engine.ContractRow>("SELECT * FROM contracts WHERE user_id=? AND type='genesis' AND status='awaiting'", u.id);
    const row = existing ?? sys.buildGenesis(u);
    return c.json({ contract: engine.projection(row, `user:${u.id}`) });
  } catch (e) { return err(c, e); }
});

// ───────────────────────── app list (messenger-like) ─────────────────────────
api.get('/apps', (c) => {
  const u = c.get('user');
  const rows = q.all<any>(`SELECT a.*, i.permissions_json AS granted_json, i.muted, i.credential, i.installed_at, cv.last_message_at, cv.last_preview, cv.unread
    FROM installs i JOIN apps a ON a.id=i.app_id LEFT JOIN conversations cv ON cv.user_id=i.user_id AND cv.app_id=i.app_id
    WHERE i.user_id=? AND i.removed_at IS NULL AND a.id != 'vista'`, u.id);
  const order = ['assistant', 'showcase', 'wallet', 'contracts', 'support', 'settings'];
  const list = rows.map((a) => ({
    ...reg.publicApp(a, { permissions_json: a.granted_json, muted: a.muted, credential: a.credential, removed_at: null }),
    last_message_at: a.last_message_at, last_preview: a.last_preview ?? '', unread: a.unread ?? 0,
    pending: q.get<{ n: number }>("SELECT COUNT(*) n FROM contracts WHERE user_id=? AND app_id=? AND status='awaiting'", u.id, a.id)?.n ?? 0,
    health: a.id === 'assistant' ? (assistantAvailable(u) ? 'up' : 'down') : a.health,
  }));
  list.sort((x, y) => {
    const sx = order.indexOf(x.id), sy = order.indexOf(y.id);
    if (sx >= 0 || sy >= 0) return (sx >= 0 ? sx : 99) - (sy >= 0 ? sy : 99);
    return (y.last_message_at ?? '').localeCompare(x.last_message_at ?? '');
  });
  return c.json({ apps: list });
});
api.get('/apps/:id', (c) => {
  const u = c.get('user'); const a = reg.getApp(c.req.param('id'));
  if (!a) return c.json({ error: 'not_found', message: 'اپ یافت نشد' }, 404);
  const inst = q.get<any>('SELECT * FROM installs WHERE user_id=? AND app_id=?', u.id, a.id);
  const contracts = engine.listContracts(u.id, a.id).map((r) => brief(r));
  const delegations = dlg.listDelegations(u.id).filter((d) => d.app_id === a.id);
  return c.json({ app: reg.publicApp(a, inst), contracts, delegations, mini_token: a.mini_app_url ? miniToken(u) : null });
});
function miniToken(u: User) {
  const b64 = Buffer.from(JSON.stringify({ user_id: u.id, user_ref: `u_${u.id.slice(-10)}`, exp: Date.now() + 15 * 60_000 })).toString('base64url');
  return `${b64}.${platformSign(b64)}`;
}
api.post('/apps/:id/mute', async (c) => { const u = c.get('user'); const { muted } = await body(c, z.object({ muted: z.boolean() })); q.run('UPDATE installs SET muted=? WHERE user_id=? AND app_id=?', muted ? 1 : 0, u.id, c.req.param('id')); return c.json({ ok: true }); });
api.delete('/apps/:id', (c) => { try { sys.removeApp(c.get('user'), c.req.param('id')); return c.json({ ok: true }); } catch (e) { return err(c, e); } });
api.post('/apps/:id/permissions/revoke', async (c) => { try { const { key } = await body(c, z.object({ key: z.string() })); sys.revokePermission(c.get('user'), c.req.param('id'), key); return c.json({ ok: true }); } catch (e) { return err(c, e); } });
api.post('/apps/:id/permissions/grant', async (c) => { try { const { permissions } = await body(c, z.object({ permissions: z.array(z.string()) })); const row = sys.buildPermissionGrant(c.get('user'), c.req.param('id'), permissions); return c.json({ contract: engine.projection(row, `user:${c.get('user').id}`) }); } catch (e) { return err(c, e); } });
api.post('/apps/:id/credential', async (c) => {
  try {
    const u = c.get('user'); const a = reg.getApp(c.req.param('id')); if (!a) return c.json({ error: 'not_found' }, 404);
    const { credential } = await body(c, z.object({ credential: z.string() }));
    q.run('UPDATE installs SET credential=? WHERE user_id=? AND app_id=?', credential || null, u.id, a.id);
    let probeError: string | null = null;
    try { await mcp.probe(a, credential || null); } catch (e: any) { probeError = e?.message ?? String(e); }
    return c.json({ ok: true, app: reg.publicApp(reg.getApp(a.id)!, q.get('SELECT * FROM installs WHERE user_id=? AND app_id=?', u.id, a.id)), probe_error: probeError });
  } catch (e) { return err(c, e); }
});
api.post('/apps/:id/probe', async (c) => {
  const u = c.get('user'); const a = reg.getApp(c.req.param('id')); if (!a) return c.json({ error: 'not_found' }, 404);
  const inst = q.get<any>('SELECT * FROM installs WHERE user_id=? AND app_id=?', u.id, a.id);
  let error: string | null = null;
  try { await mcp.probe(a, inst?.credential); } catch (e: any) { error = e?.message ?? String(e); }
  return c.json({ app: reg.publicApp(reg.getApp(a.id)!, inst), error });
});
/** سطح ساختاریافته: صدا زدن مستقیم قابلیت‌های منتشرشدهٔ اپ (خواندن یا ساختن قرارداد) بدون دستیار. */
api.get('/apps/:id/tools', async (c) => {
  const u = c.get('user'); const a = reg.getApp(c.req.param('id')); if (!a) return c.json({ error: 'not_found' }, 404);
  const inst = q.get<any>('SELECT * FROM installs WHERE user_id=? AND app_id=? AND removed_at IS NULL', u.id, a.id);
  if (a.tools_json === '[]' && a.url) { try { await mcp.probe(a, inst?.credential); } catch { /* recorded */ } }
  const tools = json.parse<mcp.ToolInfo[]>(reg.getApp(a.id)!.tools_json, []);
  return c.json({ tools: tools.map((t) => ({ name: t.name, title: t.title, description: t.description, kind: t.kind, exposed: t.exposed, reason: t.reason, input_schema: t.inputSchema })) });
});
api.post('/apps/:id/tools/:tool', async (c) => {
  try {
    const u = c.get('user'); const a = reg.getApp(c.req.param('id')); if (!a) return c.json({ error: 'not_found', message: 'اپ یافت نشد' }, 404);
    const inst = q.get<any>('SELECT * FROM installs WHERE user_id=? AND app_id=? AND removed_at IS NULL', u.id, a.id);
    if (!inst) return c.json({ error: 'not_installed', message: 'این اپ نصب نیست.' }, 400);
    const { args } = await body(c, z.object({ args: z.record(z.unknown()).default({}) }));
    const tools = json.parse<mcp.ToolInfo[]>(a.tools_json, []);
    const t = tools.find((x) => x.name === c.req.param('tool'));
    if (!t || !t.exposed) return c.json({ error: 'hidden', message: 'این قابلیت در ویستا منتشر نشده است.' }, 400);
    const granted: string[] = json.parse(inst.permissions_json, []);
    const res = await mcp.callTool(a, t.name, args ?? {}, { credential: inst.credential, meta: mcp.contextFor(a, u, granted) });
    const txt = mcp.toolText(res);
    if (t.kind === 'build' && !res.isError) {
      let parsed: any = null; try { parsed = res.structured ?? JSON.parse(txt); } catch { parsed = null; }
      if (parsed?.contract) { const row = engine.createContract(u.id, parsed.contract, parsed.app_signature, { origin: 'app' }); return c.json({ contract: engine.projection(row, `user:${u.id}`) }); }
    }
    if (res.isError) return c.json({ error: 'tool', message: txt }, 400);
    let structured: any = res.structured ?? null; if (!structured) { try { structured = JSON.parse(txt); } catch { structured = null; } }
    const m = chats.post(u.id, a.id, 'app', txt.length > 1500 ? txt.slice(0, 1500) + '…' : txt, { unread: false, meta: { tool: t.name } });
    return c.json({ text: txt, structured, message: { id: m.id, kind: m.kind, text: m.text, created_at: m.created_at } });
  } catch (e) { return err(c, e); }
});
api.post('/apps/:id/simulate-exhaust', (c) => {
  try { if (c.req.param('id') !== SAMPLE_APP) return c.json({ error: 'nope' }, 400); const r = simulateExhaustion(c.get('user').id); return c.json({ contract: brief(r.contract), delegation: r.delegation }); } catch (e) { return err(c, e); }
});

// ───────────────────────── showcase ─────────────────────────
api.get('/showcase', (c) => {
  const u = c.get('user');
  const qs = (c.req.query('q') ?? '').toLowerCase();
  const items = reg.catalog().filter((a) => !qs || [a.name, a.description, a.category, a.company, a.tags_json].join(' ').toLowerCase().includes(qs))
    .map((a) => reg.publicApp(a, q.get('SELECT * FROM installs WHERE user_id=? AND app_id=?', u.id, a.id)));
  return c.json({ apps: items });
});
api.post('/showcase/add', async (c) => {
  try {
    const u = c.get('user');
    const { url, credential } = await body(c, z.object({ url: z.string().url(), credential: z.string().optional() }));
    let a = reg.findByUrl(url);
    if (!a) {
      const host = new URL(url).hostname.replace(/^www\./, '');
      const aid = (host.split('.')[0] + '-' + id('', 4)).toLowerCase();
      reg.upsert({ id: aid, kind: 'mcp', name: host, description: `اپی که با آدرس اضافه شد: ${url}`, url, color: '#6B7B96', logo: host.slice(0, 1).toUpperCase(), in_catalog: 0, added_by: u.id, tags_json: JSON.stringify(['افزوده با آدرس']) });
      a = reg.getApp(aid)!;
    }
    await mcp.probe(a, credential ?? null);
    return c.json({ app: reg.publicApp(reg.getApp(a.id)!, q.get('SELECT * FROM installs WHERE user_id=? AND app_id=?', u.id, a.id)) });
  } catch (e) { return err(c, e); }
});
api.post('/showcase/:id/install', async (c) => {
  try {
    const u = c.get('user'); const a = reg.getApp(c.req.param('id')); if (!a) return c.json({ error: 'not_found', message: 'اپ یافت نشد' }, 404);
    const { permissions, credential } = await body(c, z.object({ permissions: z.array(z.string()).default([]), credential: z.string().optional() }));
    if (credential !== undefined) {
      // store credential ahead of install so the start contract can list capabilities; it stays in the install row
      q.run('INSERT INTO installs (user_id, app_id, installed_at, permissions_json, credential, removed_at) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id, app_id) DO UPDATE SET credential=excluded.credential', u.id, a.id, now(), '[]', credential || null, now());
    }
    const inst = q.get<any>('SELECT * FROM installs WHERE user_id=? AND app_id=?', u.id, a.id);
    if (a.tools_json === '[]' && a.url) { try { await mcp.probe(a, inst?.credential ?? credential ?? null); } catch { /* recorded */ } }
    const row = sys.buildStart(u, a.id, permissions ?? [], 'system');
    return c.json({ contract: engine.projection(row, `user:${u.id}`) });
  } catch (e) { return err(c, e); }
});

// ───────────────────────── chats ─────────────────────────
function brief(r: engine.ContractRow) {
  const p = engine.projection(r, `user:${r.user_id}`);
  return { id: r.id, title: r.title, app: p.app, status: r.status, amount: r.amount, amount_label: p.amount_label, required_rung: r.required_rung, created_at: r.created_at, created_label: p.created_label, type: r.type, origin: r.origin, delegated: !!r.delegation_id };
}
api.get('/chats/:appId', (c) => {
  const u = c.get('user'); const appId = c.req.param('appId');
  const msgs = chats.history(u.id, appId).map((m) => ({
    id: m.id, kind: m.kind, text: m.text, created_at: m.created_at, at_label: formatJalaliDateTime(m.created_at), meta: json.parse(m.meta_json, null),
    contract: m.contract_id ? (() => { const r = engine.getContract(m.contract_id!); return r ? engine.projection(r, `user:${u.id}`) : null; })() : null,
    contracts: (json.parse<any>(m.meta_json, null)?.contract_ids ?? []).map((cid: string) => { const r = engine.getContract(cid); return r ? engine.projection(r, `user:${u.id}`) : null; }).filter(Boolean),
    reply_to: m.reply_to_contract_id ? (() => { const r = engine.getContract(m.reply_to_contract_id!); return r ? { id: r.id, title: r.title, amount_label: r.amount ? toman(r.amount) : null } : null; })() : null,
  }));
  chats.markRead(u.id, appId);
  return c.json({ messages: msgs });
});
api.post('/chats/:appId/read', (c) => { chats.markRead(c.get('user').id, c.req.param('appId')); return c.json({ ok: true }); });

const SYSTEM_REPLIES: Record<string, (u: User, text: string) => string> = {
  wallet: (u) => { const w = getWallet(u.id); return `موجودی شما ${toman(w.balance)} است (در دسترس ${toman(available(w))}). برای شارژ از دکمهٔ «شارژ کیف پول» استفاده کنید یا از دستیار بخواهید.`; },
  support: () => 'پیام شما ثبت شد و پشتیبانی رسیدگی می‌کند. اگر دربارهٔ قرارداد مشخصی است، از صفحهٔ همان قرارداد «اعتراض» را بزنید تا به همان قرارداد بچسبد.',
  contracts: (u) => { const n = engine.listContracts(u.id).length; return `شما ${n} قرارداد دارید. فهرست کامل را از دکمهٔ بالا ببینید.`; },
  showcase: () => 'برای پیدا کردن اپ، از دکمهٔ «ویترین» بالا استفاده کنید یا به دستیار بگویید چه می‌خواهید.',
  settings: () => 'تنظیمات از دکمهٔ بالا در دسترس است.',
};
api.post('/chats/:appId/messages', async (c) => {
  const u = c.get('user'); const appId = c.req.param('appId');
  const { text, forward_contract_id } = await body(c, z.object({ text: z.string().min(1).max(4000), forward_contract_id: z.string().optional() }));
  const a = reg.getApp(appId);
  if (!a) return c.json({ error: 'not_found', message: 'اپ یافت نشد' }, 404);
  const inst = q.get<any>('SELECT * FROM installs WHERE user_id=? AND app_id=? AND removed_at IS NULL', u.id, appId);
  if (!inst) return c.json({ error: 'not_installed', message: 'این اپ نصب نیست.' }, 400);
  if (forward_contract_id) chats.post(u.id, appId, 'forward', `↱ قرارداد فوروارد شد`, { contractId: forward_contract_id, meta: { forward: true }, unread: false });
  chats.post(u.id, appId, 'user', text);
  // system apps other than the assistant answer with fixed helpers
  if (a.kind === 'system' && appId !== 'assistant') {
    const reply = SYSTEM_REPLIES[appId]?.(u, text) ?? 'دریافت شد.';
    const m = chats.post(u.id, appId, 'system', reply, { unread: false });
    return c.json({ message: { id: m.id, kind: m.kind, text: m.text, created_at: m.created_at } });
  }
  if (!assistantAvailable(u)) {
    const m = chats.post(u.id, appId, 'system', appId === 'assistant' ? 'دستیار در دسترس نیست (مدل زبانی پیکربندی نشده). اپ‌ها مستقیم کار می‌کنند: از فهرست اپ‌ها یا ویترین بروید.' : 'گفت‌وگوی متنی این اپ به دستیار وابسته است که فعلاً در دسترس نیست. مینی‌اپ و قراردادهای این اپ همچنان کار می‌کنند.', { unread: false });
    return c.json({ message: { id: m.id, kind: m.kind, text: m.text, created_at: m.created_at }, assistant_unavailable: true });
  }
  return streamSSE(c, async (stream) => {
    const send = (event: string, data: unknown) => stream.writeSSE({ event, data: JSON.stringify(data) });
    try {
      const r = await runAssistant(u, appId === 'assistant' ? null : appId, text, {
        onToken: (t) => void send('token', t),
        onStatus: (s) => void send('status', s),
        onContract: (cid) => { const row = engine.getContract(cid); if (row) void send('contract', engine.projection(row, `user:${u.id}`)); },
      }, { forwardedContractId: forward_contract_id });
      const m = chats.post(u.id, appId, appId === 'assistant' ? 'assistant' : 'app', r.text || (r.contracts.length ? 'قرارداد آماده است.' : '…'), { unread: false, meta: r.contracts.length ? { contract_ids: r.contracts } : undefined });
      await send('done', { message_id: m.id, text: m.text, contracts: r.contracts });
    } catch (e: any) {
      console.error('[assistant]', e);
      const msg = e?.message === 'assistant_unavailable' ? 'دستیار در دسترس نیست.' : `دستیار به مشکل خورد: ${e?.message ?? e}`;
      chats.post(u.id, appId, 'system', msg, { unread: false });
      await send('error', { message: msg });
    }
  });
});

// ───────────────────────── contracts ─────────────────────────
api.get('/contracts', (c) => { const u = c.get('user'); return c.json({ contracts: engine.listContracts(u.id).map(brief), delegations: dlg.listDelegations(u.id).map(dlgView) }); });
api.get('/contracts/:id', (c) => {
  const u = c.get('user'); const r = engine.getContract(c.req.param('id'));
  if (!r || r.user_id !== u.id) return c.json({ error: 'not_found', message: 'قرارداد یافت نشد' }, 404);
  return c.json({ contract: engine.projection(r, `user:${u.id}`), doc: engine.docOf(r), signatures: engine.signaturesOf(r.id) });
});
api.post('/contracts/:id/otp', async (c) => {
  try {
    const u = c.get('user'); const r = engine.getContract(c.req.param('id'));
    if (!r || r.user_id !== u.id) return c.json({ error: 'not_found', message: 'قرارداد یافت نشد' }, 404);
    engine.checkSignable(r, u.id);
    const o = await auth.requestOtp(u.phone, 'sign', r.canonical_hash, r.title);
    return c.json({ otp_id: o.otpId, sent: o.sms.ok, dev_code: o.devCode, accept_any: config.sms.otpAcceptAny });
  } catch (e) { return err(c, e); }
});
api.post('/contracts/:id/sign', async (c) => {
  try {
    const u = c.get('user'); const cid = c.req.param('id');
    const { rung, otp_id, code, viewed } = await body(c, z.object({ rung: z.number().int().min(1).max(2), otp_id: z.string().optional(), code: z.string().optional(), viewed: z.any().optional() }));
    const r = engine.getContract(cid);
    if (!r || r.user_id !== u.id) return c.json({ error: 'not_found', message: 'قرارداد یافت نشد' }, 404);
    if (rung === 2) { if (!otp_id || !code) throw new engine.ContractError('otp', 'رمز یک‌بارمصرف لازم است.'); auth.verifyOtp(otp_id, u.phone, code, 'sign', r.canonical_hash); }
    const row = engine.signContract(u.id, cid, { rung: rung as 1 | 2, otpId: otp_id, device: device(c), sessionToken: c.get('token'), viewed });
    let payment: any = null;
    if (row.status === 'executing' && engine.docOf(row).effects.some((e) => e.type === 'wallet.topup')) {
      const pid = id('pay');
      q.run('INSERT INTO payments (id, user_id, amount, status, contract_id, gateway, created_at) VALUES (?,?,?,?,?,?,?)', pid, u.id, row.amount, 'pending', row.id, config.payment.gateway, now());
      payment = { id: pid, gateway_url: `/gateway/${pid}` };
    }
    return c.json({ contract: engine.projection(row, `user:${u.id}`), payment });
  } catch (e) { return err(c, e); }
});
api.post('/contracts/:id/reject', async (c) => { try { const b = await c.req.json().catch(() => ({})); const row = engine.rejectContract(c.get('user').id, c.req.param('id'), b?.reason); return c.json({ contract: engine.projection(row, `user:${c.get('user').id}`) }); } catch (e) { return err(c, e); } });
api.post('/contracts/:id/dispute', async (c) => {
  try {
    const u = c.get('user'); const r = engine.getContract(c.req.param('id'));
    if (!r || r.user_id !== u.id) return c.json({ error: 'not_found', message: 'قرارداد یافت نشد' }, 404);
    if (!['executing', 'settled', 'failed'].includes(r.status)) throw new engine.ContractError('status', 'فقط قرارداد اجراشده قابل اعتراض است.');
    const { text } = await body(c, z.object({ text: z.string().min(3).max(2000) }));
    const row = engine.recordEvent(r.id, 'disputed', 'user', u.id, text);
    return c.json({ contract: engine.projection(row, `user:${u.id}`) });
  } catch (e) { return err(c, e); }
});
api.post('/contracts/:id/share', (c) => {
  const u = c.get('user'); const r = engine.getContract(c.req.param('id'));
  if (!r || r.user_id !== u.id) return c.json({ error: 'not_found', message: 'قرارداد یافت نشد' }, 404);
  const token = r.share_token ?? id('sh', 24);
  if (!r.share_token) q.run('UPDATE contracts SET share_token=? WHERE id=?', token, r.id);
  return c.json({ url: `${config.publicUrl}/c/${token}`, sms_text: `قرارداد «${r.title}» در ویستا: ${config.publicUrl}/c/${token}` });
});
api.get('/share/:token', (c) => {
  const u = c.get('user'); const r = q.get<engine.ContractRow>('SELECT * FROM contracts WHERE share_token=?', c.req.param('token'));
  if (!r) return c.json({ error: 'not_found', message: 'لینک معتبر نیست' }, 404);
  const owner = q.get<User>('SELECT * FROM users WHERE id=?', r.user_id);
  return c.json({ contract: engine.projection(r, `user:${u.id}`), shared_by: owner ? auth.publicUser(owner).first_name : null, mine: r.user_id === u.id });
});

// ───────────────────────── wallet + fake gateway ─────────────────────────
api.get('/wallet', (c) => { const u = c.get('user'); const w = getWallet(u.id); return c.json({ wallet: { ...w, available: available(w), balance_label: toman(w.balance), held_label: toman(w.held) }, transactions: wallet.transactions(u.id).map((t) => ({ ...t, amount_label: toman(t.amount), at_label: formatJalaliDateTime(t.created_at), title: t.contract_id ? engine.getContract(t.contract_id)?.title : t.memo })), custodian: 'کیف پول نزد ویستا (در نسخهٔ بعد: حساب شما نزد بانک سینا)' }); });
api.post('/wallet/topup', async (c) => {
  try { const { amount } = await body(c, z.object({ amount: z.number().int() })); const row = sys.buildTopup(c.get('user'), amount); return c.json({ contract: engine.projection(row, `user:${c.get('user').id}`) }); } catch (e) { return err(c, e); }
});
api.get('/payments/:id', (c) => { const p = q.get<any>('SELECT * FROM payments WHERE id=? AND user_id=?', c.req.param('id'), c.get('user').id); return p ? c.json({ payment: p }) : c.json({ error: 'not_found' }, 404); });

// ───────────────────────── delegations ─────────────────────────
function dlgView(d: dlg.Delegation) { const a = reg.getApp(d.app_id); return { ...d, app: a ? { id: a.id, name: a.name, color: a.color, logo: a.logo } : null, cap_label: toman(d.cap), spent_label: toman(d.spent), remaining_label: toman(Math.max(0, d.cap - d.spent)), expires_label: isoToJalali(d.expires_at), uses: q.all('SELECT * FROM delegation_uses WHERE delegation_id=? ORDER BY created_at DESC', d.id) }; }
api.get('/delegations', (c) => c.json({ delegations: dlg.listDelegations(c.get('user').id).map(dlgView) }));
api.post('/delegations/:id/revoke', (c) => { try { return c.json({ delegation: dlgView(dlg.revoke(c.get('user').id, c.req.param('id'))) }); } catch (e) { return err(c, e); } });

// ───────────────────────── settings ─────────────────────────
api.post('/settings', async (c) => {
  const u = c.get('user'); const { default_page, theme } = await body(c, z.object({ default_page: z.string().optional(), theme: z.enum(['system', 'light', 'dark']).optional() }));
  if (default_page) q.run('UPDATE users SET default_page=? WHERE id=?', default_page, u.id);
  if (theme) q.run('UPDATE users SET theme=? WHERE id=?', theme, u.id);
  return c.json({ user: auth.publicUser(q.get<User>('SELECT * FROM users WHERE id=?', u.id)!) });
});
api.post('/settings/byok', async (c) => {
  const u = c.get('user'); const { base_url, api_key, model } = await body(c, z.object({ base_url: z.string().url(), api_key: z.string().min(4), model: z.string().min(1) }));
  q.run('UPDATE users SET ai_base_url=?, ai_api_key=?, ai_model=? WHERE id=?', base_url, api_key, model, u.id);
  return c.json({ user: auth.publicUser(q.get<User>('SELECT * FROM users WHERE id=?', u.id)!) });
});
api.delete('/settings/byok', (c) => { const u = c.get('user'); q.run('UPDATE users SET ai_base_url=NULL, ai_api_key=NULL, ai_model=NULL WHERE id=?', u.id); return c.json({ user: auth.publicUser(q.get<User>('SELECT * FROM users WHERE id=?', u.id)!) }); });
api.get('/ledger/verify', (c) => c.json(ledgerVerify()));
api.get('/ledger/mine', (c) => c.json({ entries: q.all('SELECT seq, kind, ref_type, ref_id, app_id, payload_json, hash, created_at FROM ledger WHERE user_id=? ORDER BY seq DESC LIMIT 200', c.get('user').id).map((e: any) => ({ ...e, payload: json.parse(e.payload_json, {}), at_label: formatJalaliDateTime(e.created_at) })) }));
export { plusMinutes };
