/**
 * ثبت اپ‌ها و ویترین. شش اپ سیستمی + کاتالوگ اولیه (چهار MCP غیرملی) + اپ نمونهٔ مرجع.
 */
import { q, json } from '../db.js';
import { now, id } from '../util/ids.js';
import { config } from '../config.js';
import { ensureKey } from '../contracts/keys.js';

export interface AppRow {
  id: string; kind: 'system' | 'vista' | 'mcp'; name: string; description: string; long_description: string; url: string | null; mini_app_url: string | null;
  color: string; logo: string; company: string | null; verified: number; public_key: string | null; permissions_json: string; financial_permissions_json: string;
  data_permissions_json: string; fulfillment_tool: string | null; auth_json: string | null; in_catalog: number; category: string | null; rating: number | null;
  reviews_json: string; tags_json: string; health: 'up' | 'down' | 'unknown'; health_checked_at: string | null; last_error: string | null; manifest_json: string | null;
  tools_json: string; added_by: string | null; created_at: string;
}

const SYSTEM: Partial<AppRow>[] = [
  { id: 'vista', kind: 'system', name: 'ویستا', description: 'خودِ سکو — طرفِ قرارداد آغاز', color: '#1F2937', logo: 'و', in_catalog: 0 },
  { id: 'assistant', kind: 'system', name: 'دستیار ویستا', description: 'گفت‌وگوی پیش‌فرض. می‌خواند، می‌فهمد و قرارداد می‌آورد؛ هرگز امضا نمی‌کند.', color: '#2C5FA8', logo: 'و' },
  { id: 'showcase', kind: 'system', name: 'ویترین', description: 'پیدا کردن و نصب اپ‌ها؛ با نظر کاربران و فهرست مجوزها پیش از نصب.', color: '#7A4FA3', logo: 'ی' },
  { id: 'wallet', kind: 'system', name: 'مالی', description: 'کیف پول، تراکنش‌ها و سابقهٔ پرداخت. هر جا پولی جابه‌جا شود، رد آن این‌جاست.', color: '#B07C31', logo: 'م' },
  { id: 'contracts', kind: 'system', name: 'قراردادهای من', description: 'هر قراردادی که امضا کرده‌اید، در یک جا و به ترتیب زمان. مجوزها و وکالت‌ها هم همین‌جا.', color: '#C13B2F', logo: 'ق' },
  { id: 'support', kind: 'system', name: 'پشتیبانی', description: 'شکایت، اختلاف و مشکل حساب. هر اختلاف رویدادی است که به همان قرارداد می‌چسبد.', color: '#2E7D6B', logo: 'پ' },
  { id: 'settings', kind: 'system', name: 'تنظیمات', description: 'احراز هویت، کلید مدل دلخواه، ظاهر و صفحهٔ پیش‌فرض.', color: '#6B7B96', logo: 'ت' },
];

/** ویترین اولیه — چهار MCP غیرملی، تا ویترین خالی نباشد. اپ‌های ملی (کنکوریا، …) بعداً اضافه می‌شوند. */
const CATALOG: Partial<AppRow>[] = [
  {
    id: 'github', kind: 'mcp', name: 'GitHub', company: 'GitHub, Inc.', category: 'توسعه', rating: 4.7, verified: 0,
    description: 'مخزن‌ها، ایشوها و پول‌ریکوئست‌های شما در گیت‌هاب — خواندن و جست‌وجو.',
    long_description: 'سرور رسمی MCP گیت‌هاب. در ویستا فقط قابلیت‌های خواندنی آن در دسترس دستیار است؛ هر کاری که اثر داشته باشد (ساختن ایشو، ادغام) پنهان می‌ماند، چون در ویستا نوشتن قرارداد است و این اپ قرارداد نمی‌سازد.',
    url: 'https://api.githubcopilot.com/mcp/', color: '#24292F', logo: 'G',
    auth_json: JSON.stringify({ type: 'bearer', label: 'Personal Access Token گیت‌هاب', hint: 'از GitHub → Settings → Developer settings → Fine-grained tokens', required: true }),
    permissions_json: JSON.stringify([{ key: 'notify', label: 'ارسال اعلان به من', description: 'خبر ایشوها و بررسی‌ها' }]),
    reviews_json: JSON.stringify([{ who: 'م. رضایی', stars: 5, text: 'برای مرور پول‌ریکوئست‌ها با دستیار عالی است.' }, { who: 'س. احمدی', stars: 4, text: 'توکن می‌خواهد ولی بعدش سریع است.' }]),
    tags_json: JSON.stringify(['غیرملی', 'خواندنی', 'نیازمند توکن']),
  },
  {
    id: 'deepwiki', kind: 'mcp', name: 'DeepWiki', company: 'Cognition (Devin)', category: 'دانش', rating: 4.5, verified: 0,
    description: 'مستندات خودکار هر مخزن عمومی گیت‌هاب؛ بدون نیاز به توکن.',
    long_description: 'سرور عمومی MCP دیپ‌ویکی: ساختار مخزن، مستندات تولیدشده و پاسخ به پرسش دربارهٔ یک مخزن. کاملاً خواندنی و بدون احراز هویت.',
    url: 'https://mcp.deepwiki.com/mcp', color: '#3B5BDB', logo: 'D',
    permissions_json: '[]',
    reviews_json: JSON.stringify([{ who: 'ن. کریمی', stars: 5, text: 'برای فهمیدن یک کتابخانهٔ ناآشنا معجزه می‌کند.' }]),
    tags_json: JSON.stringify(['غیرملی', 'خواندنی', 'بدون توکن']),
  },
  {
    id: 'huggingface', kind: 'mcp', name: 'Hugging Face', company: 'Hugging Face, Inc.', category: 'هوش مصنوعی', rating: 4.4, verified: 0,
    description: 'جست‌وجوی مدل‌ها، دیتاست‌ها و مقاله‌ها در هاب هاگینگ‌فیس.',
    long_description: 'سرور رسمی MCP هاگینگ‌فیس. بدون توکن قابلیت‌های پایه کار می‌کند؛ با توکن به مخزن‌های خصوصی هم می‌رسد.',
    url: 'https://huggingface.co/mcp', color: '#F5A623', logo: '🤗',
    auth_json: JSON.stringify({ type: 'bearer', label: 'توکن هاگینگ‌فیس (اختیاری)', required: false }),
    permissions_json: '[]',
    reviews_json: JSON.stringify([{ who: 'ع. موسوی', stars: 4, text: 'برای پیدا کردن مدل فارسی به کار آمد.' }]),
    tags_json: JSON.stringify(['غیرملی', 'خواندنی']),
  },
  {
    id: 'cloudflare-docs', kind: 'mcp', name: 'Cloudflare Docs', company: 'Cloudflare, Inc.', category: 'دانش', rating: 4.3, verified: 0,
    description: 'جست‌وجو در مستندات کلادفلر؛ بدون توکن.',
    long_description: 'سرور عمومی MCP مستندات کلادفلر (Workers, R2, D1, DNS, …). خواندنی و بدون احراز هویت.',
    url: 'https://docs.mcp.cloudflare.com/mcp', color: '#F38020', logo: 'C',
    permissions_json: '[]',
    reviews_json: JSON.stringify([{ who: 'ر. شریفی', stars: 4, text: 'جواب‌های دقیقی از مستندات می‌آورد.' }]),
    tags_json: JSON.stringify(['غیرملی', 'خواندنی', 'بدون توکن']),
  },
];

export async function seedApps() {
  for (const a of SYSTEM) await upsert({ ...a, in_catalog: a.in_catalog ?? 0, verified: 1, health: 'up' });
  for (const a of CATALOG) await upsert({ ...a, in_catalog: 1 });
  await ensureKey('platform');
  for (const a of SYSTEM) await ensureKey(a.id!);
}
export async function upsert(a: Partial<AppRow>) {
  const cur = await q.get<AppRow>('SELECT * FROM apps WHERE id=?', a.id);
  const row: AppRow = {
    id: a.id!, kind: a.kind ?? 'mcp', name: a.name ?? a.id!, description: a.description ?? '', long_description: a.long_description ?? '', url: a.url ?? null, mini_app_url: a.mini_app_url ?? null,
    color: a.color ?? '#2C5FA8', logo: a.logo ?? (a.name ?? '?').slice(0, 1), company: a.company ?? null, verified: a.verified ?? 0, public_key: a.public_key ?? null,
    permissions_json: a.permissions_json ?? '[]', financial_permissions_json: a.financial_permissions_json ?? '[]', data_permissions_json: a.data_permissions_json ?? '[]',
    fulfillment_tool: a.fulfillment_tool ?? null, auth_json: a.auth_json ?? null, in_catalog: a.in_catalog ?? 0, category: a.category ?? null, rating: a.rating ?? null,
    reviews_json: a.reviews_json ?? '[]', tags_json: a.tags_json ?? '[]', health: (a.health ?? cur?.health ?? 'unknown') as AppRow['health'], health_checked_at: cur?.health_checked_at ?? null, last_error: cur?.last_error ?? null,
    manifest_json: a.manifest_json ?? cur?.manifest_json ?? null, tools_json: a.tools_json ?? cur?.tools_json ?? '[]', added_by: a.added_by ?? cur?.added_by ?? null, created_at: cur?.created_at ?? now(),
  };
  await q.run(`INSERT INTO apps (id, kind, name, description, long_description, url, mini_app_url, color, logo, company, verified, public_key, permissions_json, financial_permissions_json, data_permissions_json, fulfillment_tool, auth_json, in_catalog, category, rating, reviews_json, tags_json, health, health_checked_at, last_error, manifest_json, tools_json, added_by, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET kind=excluded.kind, name=excluded.name, description=excluded.description, long_description=excluded.long_description, url=excluded.url, mini_app_url=excluded.mini_app_url, color=excluded.color, logo=excluded.logo, company=excluded.company, verified=excluded.verified, public_key=COALESCE(excluded.public_key, apps.public_key), permissions_json=excluded.permissions_json, financial_permissions_json=excluded.financial_permissions_json, data_permissions_json=excluded.data_permissions_json, fulfillment_tool=excluded.fulfillment_tool, auth_json=excluded.auth_json, in_catalog=excluded.in_catalog, category=excluded.category, rating=excluded.rating, reviews_json=excluded.reviews_json, tags_json=excluded.tags_json, manifest_json=COALESCE(excluded.manifest_json, apps.manifest_json), tools_json=CASE WHEN excluded.tools_json='[]' THEN apps.tools_json ELSE excluded.tools_json END`,
    row.id, row.kind, row.name, row.description, row.long_description, row.url, row.mini_app_url, row.color, row.logo, row.company, row.verified, row.public_key, row.permissions_json, row.financial_permissions_json, row.data_permissions_json, row.fulfillment_tool, row.auth_json, row.in_catalog, row.category, row.rating, row.reviews_json, row.tags_json, row.health, row.health_checked_at, row.last_error, row.manifest_json, row.tools_json, row.added_by, row.created_at);
}
export const getApp = (appId: string) => q.get<AppRow>('SELECT * FROM apps WHERE id=?', appId);
export const allApps = () => q.all<AppRow>('SELECT * FROM apps');
export const catalog = () => q.all<AppRow>("SELECT * FROM apps WHERE in_catalog=1 ORDER BY (kind='vista') DESC, rating DESC");
export function findByUrl(url: string) { return q.get<AppRow>('SELECT * FROM apps WHERE url=?', url); }

export async function publicApp(a: AppRow, install?: any) {
  const tools = json.parse<any[]>(a.tools_json, []);
  return {
    id: a.id, kind: a.kind, name: a.name, description: a.description, long_description: a.long_description, url: a.url, mini_app_url: a.mini_app_url,
    color: a.color, logo: a.logo, company: a.company, verified: !!a.verified, has_key: !!a.public_key || !!(await q.get('SELECT 1 FROM app_keys WHERE app_id=?', a.id)),
    permissions: json.parse(a.permissions_json, []), financial_permissions: json.parse(a.financial_permissions_json, []), data_permissions: json.parse(a.data_permissions_json, []),
    auth: json.parse(a.auth_json, null), in_catalog: !!a.in_catalog, category: a.category, rating: a.rating, reviews: json.parse(a.reviews_json, []), tags: json.parse(a.tags_json, []),
    health: a.health, health_checked_at: a.health_checked_at, last_error: a.last_error,
    tools: { exposed: tools.filter((t) => t.exposed).map((t) => ({ name: t.name, title: t.title, description: t.description, kind: t.kind })), hidden: tools.filter((t) => !t.exposed).map((t) => ({ name: t.name, reason: t.reason })) },
    templates: json.parse<any>(a.manifest_json, {})?.templates ?? [],
    installed: !!install && !install.removed_at, granted: install ? json.parse(install.permissions_json, []) : [], muted: !!install?.muted, has_credential: !!install?.credential,
    system: a.kind === 'system',
  };
}
export const isSystem = async (appId: string) => (await getApp(appId))?.kind === 'system';
export { id, config };
