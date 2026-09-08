/**
 * اپ نمونهٔ مرجع — «خدمات ایرانسل (نمونه)»: شارژ، بستهٔ اینترنت، قبض، و وکالتِ تمدید خودکار.
 * شبیه‌سازی‌شده است؛ هیچ اتصالی به ایرانسل ندارد. اما دقیقاً همان قراردادی را با ویستا دارد
 * که هر اپ بیرونی (مثلاً کنکوریا) باید داشته باشد: مانیفست، ابزارهای خواندن، ابزارهای ساختن قرارداد،
 * امضای Ed25519 روی هش متعارف، و ابزار تحویل که فقط پردازشگر صدایش می‌زند.
 * اسکیل «skills/vista-app» همین رفتار را برای اپ‌های دیگر توضیح می‌دهد.
 */
import { Hono } from 'hono';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { config } from '../config.js';
import { q } from '../db.js';
import { id, now, plusMinutes, plusDays } from '../util/ids.js';
import { toman, toFaDigits } from '../util/persian.js';
import { canonicalJson } from '../util/canonical.js';
import { ed25519Sign, ed25519Verify, generateEd25519 } from '../util/crypto.js';
import type { ContractDoc } from '../contracts/model.js';
import { contractHash } from '../contracts/hash.js';
import { upsert } from '../gateway/registry.js';
import { executeUnderDelegation } from '../contracts/delegation.js';
import { platformPublicKey } from '../contracts/keys.js';

export const APP_ID = 'irancell-demo';
const COLOR = '#F5B300';

// ── the app's own key (would live in the partner's own vault) ──
function appKey() {
  let k = q.get<{ private_key: string; public_key: string }>('SELECT * FROM app_keys WHERE app_id=?', APP_ID);
  if (!k) { const kp = generateEd25519(); q.run('INSERT INTO app_keys (app_id, private_key, public_key) VALUES (?,?,?)', APP_ID, kp.privateKey, kp.publicKey); k = { private_key: kp.privateKey, public_key: kp.publicKey }; }
  return k;
}
const sign = (hash: string) => ed25519Sign(appKey().private_key, hash);

// ── simulated line state, keyed by pseudonymous user ref ──
interface Line { balance: number; package: { id: string; title: string; remaining_gb: number; days_left: number } | null; bills: { id: string; title: string; amount: number; due: string; paid: boolean }[]; delegation_id?: string; history: string[] }
function line(ref: string): Line {
  const row = q.get<{ value: string }>('SELECT value FROM kv WHERE key=?', `demo:line:${ref}`);
  if (row) return JSON.parse(row.value);
  const seed = ref.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const l: Line = {
    balance: 12_000 + (seed % 9) * 3_500,
    package: { id: 'p5', title: '۵ گیگ · ۳۰ روزه', remaining_gb: Number(((seed % 30) / 10).toFixed(1)), days_left: 3 + (seed % 12) },
    bills: [{ id: 'b1', title: 'صورتحساب دورهٔ گذشته', amount: 185_000 + (seed % 5) * 10_000, due: plusDays(6), paid: false }],
    history: [],
  };
  save(ref, l);
  return l;
}
function save(ref: string, l: Line) { q.run('INSERT INTO kv (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', `demo:line:${ref}`, JSON.stringify(l)); }

const PACKAGES = [
  { id: 'p2', title: '۲ گیگ · ۷ روزه', gb: 2, days: 7, price: 45_000 },
  { id: 'p5', title: '۵ گیگ · ۳۰ روزه', gb: 5, days: 30, price: 95_000 },
  { id: 'p15', title: '۱۵ گیگ · ۳۰ روزه', gb: 15, days: 30, price: 210_000 },
  { id: 'p40', title: '۴۰ گیگ · ۹۰ روزه', gb: 40, days: 90, price: 520_000 },
];
const TOPUPS = [20_000, 50_000, 100_000, 200_000];

export const MANIFEST = {
  vista: '1' as const,
  id: APP_ID,
  name: 'خدمات ایرانسل (نمونه)',
  description: 'شارژ، بستهٔ اینترنت و قبض خط شما — شبیه‌سازی‌شده برای اثبات ساز و کار.',
  long_description: 'این اپ نمونهٔ مرجع ویستاست و به شبکهٔ ایرانسل وصل نیست. شارژ و بسته و قبض آن واقعی نیستند؛ اما قرارداد، امضا، مسدودی و کسر وجه، رویدادهای پس از قرارداد و وکالتِ تمدید خودکار همه واقعی و همان چیزی‌اند که هر اپ دیگری در ویستا خواهد داشت.',
  company: { name: 'ایرانسل — نمونهٔ شبیه‌سازی‌شده', registration: 'demo' },
  public_key: '',
  appearance: { color: COLOR, logo: 'ا' },
  category: 'مخابرات',
  permissions: [
    { key: 'notify', label: 'ارسال اعلان به من', description: 'اتمام بسته، سررسید قبض' },
    { key: 'profile.read', label: 'خواندن پروفایل من', description: 'نام و شمارهٔ خط، برای اینکه هر بار نپرسد' },
  ],
  financial_permissions: [
    { key: 'auto_renew', label: 'تمدید خودکار بسته وقتی تمام می‌شود', cap_default: 300_000, period: 'monthly', description: 'وکالت سقف‌دار و زمان‌دار؛ هر مصرف اطلاع داده می‌شود' },
  ],
  data_permissions: ['profile.phone', 'profile.name'],
  tools: {
    read: ['get_line_status', 'list_packages', 'list_bills', 'list_topup_amounts'],
    build: ['build_topup_contract', 'build_package_contract', 'build_bill_payment_contract', 'build_auto_renew_delegation'],
    fulfil: 'vista_fulfil',
  },
  mini_app_url: `${config.publicUrl}/apps/${APP_ID}/mini`,
  templates: [
    { ref: 'irancell/topup', title: 'شارژ خط', min_rung: 1, settlement: 'on_delivery' },
    { ref: 'irancell/package', title: 'خرید بستهٔ اینترنت', min_rung: 1, settlement: 'on_delivery' },
    { ref: 'irancell/bill', title: 'پرداخت قبض', min_rung: 1, settlement: 'immediate' },
    { ref: 'irancell/auto-renew', title: 'وکالت تمدید خودکار', min_rung: 2, settlement: 'immediate' },
  ],
};

export function registerSampleApp() {
  const k = appKey();
  MANIFEST.public_key = k.public_key;
  upsert({
    id: APP_ID, kind: 'vista', name: MANIFEST.name, description: MANIFEST.description, long_description: MANIFEST.long_description,
    url: `${config.publicUrl}/apps/${APP_ID}/mcp`, mini_app_url: MANIFEST.mini_app_url, color: COLOR, logo: 'ا', company: MANIFEST.company.name, verified: 1,
    public_key: k.public_key, permissions_json: JSON.stringify(MANIFEST.permissions), financial_permissions_json: JSON.stringify(MANIFEST.financial_permissions),
    data_permissions_json: JSON.stringify(MANIFEST.data_permissions), fulfillment_tool: 'vista_fulfil', in_catalog: 1, category: MANIFEST.category, rating: 4.8,
    reviews_json: JSON.stringify([{ who: 'تیم ویستا', stars: 5, text: 'نمونهٔ مرجع: هر اپ دیگری همین قرارداد را با ویستا دارد.' }]),
    tags_json: JSON.stringify(['نمونه', 'شبیه‌سازی', 'احرازشده', 'با قرارداد', 'با وکالت']),
    manifest_json: JSON.stringify(MANIFEST), health: 'up',
  });
}

// ── contract building (what every partner app does) ──
type Ctx = { user_id: string; user_ref: string; phone?: string; name?: string };
function ctxOf(extra: any): Ctx {
  const v = extra?._meta?.vista ?? {};
  if (!v.user_id) throw new Error('vista context missing (_meta.vista.user_id)');
  return { user_id: v.user_id, user_ref: v.user_ref ?? v.user_id, phone: v.phone, name: v.name };
}
function baseDoc(ctx: Ctx, type: string, templateRef: string, title: string, settlement: 'immediate' | 'on_delivery', minRung: 1 | 2 = 1): ContractDoc {
  return {
    vista: '1', id: id('ctr'), version: 1, prev_version_id: null, type, template_ref: templateRef, app_id: APP_ID, title,
    parties: [
      { id: `app:${APP_ID}`, kind: 'app', role: 'provider', label: MANIFEST.name, must_sign: true },
      { id: ctx.user_id, kind: 'user', role: 'payer', label: ctx.name || 'شما', must_sign: true },
    ],
    clauses: [], open_clauses: [], conditions: [{ type: 'wallet.sufficient' }], effects: [], fees: [],
    policy: { min_rung: minRung, quorum: 'all', settlement },
    appearance: { color: COLOR, logo: 'ا', display_name: MANIFEST.name },
    nonce: id('n', 20), created_at: now(), expires_at: plusMinutes(15),
  };
}
function signed(doc: ContractDoc) {
  const hash = contractHash(doc);
  return { contract: doc, canonical_hash: hash, app_signature: sign(hash) };
}
function text(o: unknown) { return { content: [{ type: 'text' as const, text: typeof o === 'string' ? o : JSON.stringify(o) }] }; }
function phoneOf(ctx: Ctx, arg?: string) { return arg || ctx.phone || 'شمارهٔ خط شما'; }

function buildServer(): McpServer {
  const server = new McpServer({ name: 'irancell-demo', version: '0.1.0' });
  server.registerResource('manifest', 'vista://manifest', { title: 'Vista manifest', mimeType: 'application/json' }, async () => ({ contents: [{ uri: 'vista://manifest', mimeType: 'application/json', text: JSON.stringify(MANIFEST) }] }));

  server.registerTool('get_line_status', { title: 'وضعیت خط', description: 'موجودی شارژ، بستهٔ فعال و باقی‌ماندهٔ آن برای خط کاربر', inputSchema: { phone: z.string().optional().describe('شمارهٔ خط؛ اگر خالی باشد خطِ خودِ کاربر') }, annotations: { readOnlyHint: true } },
    async (args, extra) => { const ctx = ctxOf(extra); const l = line(ctx.user_ref); return text({ phone: phoneOf(ctx, args.phone), balance_toman: l.balance, package: l.package, unpaid_bills: l.bills.filter((b) => !b.paid).length, auto_renew: l.delegation_id ? 'active' : 'off' }); });
  server.registerTool('list_packages', { title: 'بسته‌های اینترنت', description: 'فهرست بسته‌های قابل خرید با قیمت (تومان)', inputSchema: {}, annotations: { readOnlyHint: true } },
    async () => text({ packages: PACKAGES.map((p) => ({ id: p.id, title: p.title, gb: p.gb, days: p.days, price_toman: p.price })) }));
  server.registerTool('list_topup_amounts', { title: 'مبالغ شارژ', description: 'مبالغ پیشنهادی شارژ (تومان)؛ هر مبلغ دیگری میان ۱۰ هزار و ۲ میلیون هم مجاز است', inputSchema: {}, annotations: { readOnlyHint: true } },
    async () => text({ amounts_toman: TOPUPS, min: 10_000, max: 2_000_000 }));
  server.registerTool('list_bills', { title: 'قبض‌ها', description: 'صورتحساب‌های خط کاربر', inputSchema: {}, annotations: { readOnlyHint: true } },
    async (_a, extra) => { const ctx = ctxOf(extra); return text({ bills: line(ctx.user_ref).bills }); });

  server.registerTool('build_topup_contract', { title: 'قرارداد شارژ', description: 'قرارداد شارژ خط را می‌سازد و امضا می‌کند. مبلغ به تومان.', inputSchema: { amount: z.number().int().min(10_000).max(2_000_000), phone: z.string().optional() } },
    async (args, extra) => {
      const ctx = ctxOf(extra);
      const doc = baseDoc(ctx, 'irancell.topup', 'irancell/topup', `شارژ خط · ${toman(args.amount)}`, 'on_delivery');
      doc.clauses = [
        { key: 'subject', label: 'موضوع', value: 'شارژ مستقیم خط' },
        { key: 'phone', label: 'خط', value: phoneOf(ctx, args.phone), kind: 'phone' },
        { key: 'amount', label: 'مبلغ', value: args.amount, kind: 'amount' },
        { key: 'delivery', label: 'تحویل', value: 'بلافاصله پس از امضا؛ مبلغ اول مسدود و پس از تحویل کسر می‌شود' },
        { key: 'refund', label: 'بازگشت وجه', value: 'ندارد' },
      ];
      doc.effects = [{ type: 'wallet.pay', amount: args.amount, payee_app_id: APP_ID, memo: 'شارژ خط' }, { type: 'app.action', action: 'topup', params: { phone: phoneOf(ctx, args.phone), amount: args.amount } }];
      doc.fees = [{ beneficiary: 'vista', amount: Math.round(args.amount * 0.01), label: 'کارمزد سکو', visible: false }];
      return text(signed(doc));
    });
  server.registerTool('build_package_contract', { title: 'قرارداد بسته', description: 'قرارداد خرید بستهٔ اینترنت را می‌سازد و امضا می‌کند.', inputSchema: { package_id: z.string(), phone: z.string().optional() } },
    async (args, extra) => {
      const ctx = ctxOf(extra);
      const p = PACKAGES.find((x) => x.id === args.package_id);
      if (!p) return { content: [{ type: 'text', text: 'بسته یافت نشد' }], isError: true };
      const doc = baseDoc(ctx, 'irancell.package', 'irancell/package', `بستهٔ ${p.title}`, 'on_delivery');
      doc.clauses = [
        { key: 'subject', label: 'موضوع', value: 'خرید بستهٔ اینترنت' },
        { key: 'phone', label: 'خط', value: phoneOf(ctx, args.phone), kind: 'phone' },
        { key: 'package', label: 'بسته', value: `${p.title} — ${toFaDigits(p.gb)} گیگابایت، ${toFaDigits(p.days)} روز` },
        { key: 'amount', label: 'مبلغ', value: p.price, kind: 'amount' },
        { key: 'activation', label: 'فعال‌سازی', value: 'بلافاصله پس از امضا؛ مبلغ اول مسدود و پس از فعال شدن کسر می‌شود' },
        { key: 'refund', label: 'بازگشت وجه', value: 'تا پیش از فعال شدن' },
      ];
      doc.effects = [{ type: 'wallet.pay', amount: p.price, payee_app_id: APP_ID, memo: p.title }, { type: 'app.action', action: 'package', params: { phone: phoneOf(ctx, args.phone), package_id: p.id } }];
      doc.fees = [{ beneficiary: 'vista', amount: Math.round(p.price * 0.01), label: 'کارمزد سکو', visible: false }];
      return text(signed(doc));
    });
  server.registerTool('build_bill_payment_contract', { title: 'قرارداد پرداخت قبض', description: 'قرارداد پرداخت یک قبض را می‌سازد و امضا می‌کند.', inputSchema: { bill_id: z.string() } },
    async (args, extra) => {
      const ctx = ctxOf(extra);
      const l = line(ctx.user_ref);
      const b = l.bills.find((x) => x.id === args.bill_id);
      if (!b) return { content: [{ type: 'text', text: 'قبض یافت نشد' }], isError: true };
      if (b.paid) return { content: [{ type: 'text', text: 'این قبض قبلاً پرداخت شده است' }], isError: true };
      const doc = baseDoc(ctx, 'irancell.bill', 'irancell/bill', `پرداخت قبض · ${toman(b.amount)}`, 'immediate');
      doc.clauses = [
        { key: 'subject', label: 'موضوع', value: 'پرداخت صورتحساب' },
        { key: 'bill', label: 'قبض', value: b.title },
        { key: 'amount', label: 'مبلغ', value: b.amount, kind: 'amount' },
        { key: 'settlement', label: 'تسویه', value: 'همان لحظهٔ امضا از کیف پول کسر می‌شود' },
      ];
      doc.effects = [{ type: 'wallet.pay', amount: b.amount, payee_app_id: APP_ID, memo: b.title }, { type: 'app.action', action: 'bill', params: { bill_id: b.id } }];
      return text(signed(doc));
    });
  server.registerTool('build_auto_renew_delegation', { title: 'وکالت تمدید خودکار', description: 'قرارداد وکالت می‌سازد تا وقتی بستهٔ کاربر تمام شد، همان بسته خودکار تمدید شود. سقف و مدت اجباری‌اند.', inputSchema: { package_id: z.string(), cap_toman: z.number().int().min(50_000).max(5_000_000).describe('سقف کل خرج زیر این وکالت'), months: z.number().int().min(1).max(12).default(3) } },
    async (args, extra) => {
      const ctx = ctxOf(extra);
      const p = PACKAGES.find((x) => x.id === args.package_id);
      if (!p) return { content: [{ type: 'text', text: 'بسته یافت نشد' }], isError: true };
      const months = args.months ?? 3;
      const expires = plusDays(30 * months);
      const doc = baseDoc(ctx, 'irancell.auto-renew', 'irancell/auto-renew', `وکالت تمدید خودکار · ${p.title}`, 'immediate', 2);
      doc.conditions = [];
      doc.clauses = [
        { key: 'subject', label: 'موضوع', value: 'وکالت به اپ برای تمدید خودکار بسته در غیاب شما' },
        { key: 'scope', label: 'محدوده', value: `فقط خرید بستهٔ ${p.title} (${toman(p.price)}) هنگام اتمام بسته` },
        { key: 'cap', label: 'سقف کل', value: args.cap_toman, kind: 'amount' },
        { key: 'per_use', label: 'سقف هر بار', value: p.price, kind: 'amount' },
        { key: 'expiry', label: 'انقضا', value: `${toFaDigits(months)} ماه`, kind: 'date' },
        { key: 'rules', label: 'قواعد', value: 'واگذاری به اپ دیگر ممنوع · لغو یک‌طرفه و فوری · هر مصرف به شما اطلاع داده می‌شود', kind: 'note' },
      ];
      doc.effects = [{ type: 'delegation.grant', app_id: APP_ID, scope: 'irancell/package', label: `تمدید خودکار ${p.title}`, cap: args.cap_toman, per_use_cap: p.price, expires_at: expires }, { type: 'app.action', action: 'auto_renew', params: { package_id: p.id } }];
      return text(signed(doc));
    });

  // ── fulfilment: only the processor calls this; never exposed to the assistant ──
  server.registerTool('vista_fulfil', { title: 'تحویل', description: 'اجرای خدمت پس از قرارداد امضاشده. فقط پردازشگر ویستا.', inputSchema: { contract: z.record(z.any()), platform_signature: z.string(), delegation_id: z.string().optional() } },
    async (args) => {
      const doc = args.contract as ContractDoc;
      const hash = contractHash(doc);
      if (!ed25519Verify(platformPublicKey(), `executed|${hash}`, args.platform_signature)) return { content: [{ type: 'text', text: JSON.stringify({ events: [{ type: 'failed', text: 'امضای سکو معتبر نیست' }] }) }], isError: true };
      const userParty = doc.parties.find((p) => p.kind === 'user')!;
      const ref = `u_${userParty.id.replace('user:', '').slice(-10)}`;
      const l = line(ref);
      const action = doc.effects.find((e) => e.type === 'app.action') as any;
      const events: { type: string; text?: string }[] = [];
      switch (action?.action) {
        case 'topup': l.balance += action.params.amount; l.history.push(`topup ${action.params.amount}`); events.push({ type: 'delivered', text: `شارژ انجام شد · موجودی خط ${toman(l.balance)}` }); break;
        case 'package': { const p = PACKAGES.find((x) => x.id === action.params.package_id)!; l.package = { id: p.id, title: p.title, remaining_gb: p.gb, days_left: p.days }; events.push({ type: 'delivered', text: `بستهٔ ${p.title} فعال شد` }); break; }
        case 'bill': { const b = l.bills.find((x) => x.id === action.params.bill_id); if (b) b.paid = true; events.push({ type: 'delivered', text: 'قبض پرداخت و ثبت شد' }); break; }
        case 'auto_renew': l.delegation_id = args.delegation_id; events.push({ type: 'note', text: 'تمدید خودکار فعال شد؛ وقتی بسته تمام شود، اپ به نیابت از شما بسته می‌خرد و خبر می‌دهد.' }); break;
        default: events.push({ type: 'delivered' });
      }
      save(ref, l);
      return text({ events });
    });
  return server;
}

/** Simulate "package ran out" → the app acts under delegation, user absent. */
export function simulateExhaustion(userId: string) {
  const ref = `u_${userId.slice(-10)}`;
  const l = line(ref);
  if (!l.delegation_id) throw new Error('وکالت تمدید خودکار برای این خط فعال نیست.');
  const p = PACKAGES.find((x) => x.id === l.package?.id) ?? PACKAGES[1];
  const ctx: Ctx = { user_id: `user:${userId}`, user_ref: ref };
  const doc = baseDoc(ctx, 'irancell.package', 'irancell/package', `تمدید خودکار · بستهٔ ${p.title}`, 'on_delivery');
  doc.clauses = [
    { key: 'subject', label: 'موضوع', value: 'تمدید خودکار بسته زیر وکالت' },
    { key: 'package', label: 'بسته', value: p.title },
    { key: 'amount', label: 'مبلغ', value: p.price, kind: 'amount' },
    { key: 'trigger', label: 'دلیل', value: 'بستهٔ قبلی تمام شد' },
  ];
  doc.effects = [{ type: 'wallet.pay', amount: p.price, payee_app_id: APP_ID, memo: `تمدید ${p.title}` }, { type: 'app.action', action: 'package', params: { package_id: p.id } }];
  // delegated form: reference the delegation, add its condition, and mark the absent user as not signing — then sign.
  doc.delegation_id = l.delegation_id;
  doc.conditions = [{ type: 'wallet.sufficient' }, { type: 'delegation.active', delegation_id: l.delegation_id }];
  doc.parties = doc.parties.map((pt) => (pt.kind === 'user' ? { ...pt, must_sign: false } : pt));
  l.package = { id: p.id, title: p.title, remaining_gb: 0, days_left: 0 };
  save(ref, l);
  const hash = contractHash(doc);
  return executeUnderDelegation(APP_ID, l.delegation_id, doc, sign(hash));
}

// ── HTTP surface: MCP endpoint (stateless) + mini-app ──
export const sampleApp = new Hono();
sampleApp.all('/mcp', async (c) => {
  const server = buildServer();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await server.connect(transport);
  const res = await transport.handleRequest(c.req.raw);
  return res;
});
sampleApp.get('/mini', (c) => {
  const token = c.req.query('token') ?? '';
  const [b64, sig] = token.split('.');
  let ref = 'guest';
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString());
    if (ed25519Verify(platformPublicKey(), b64, sig) && payload.exp > Date.now()) ref = payload.user_ref;
  } catch { /* guest */ }
  const l = line(ref);
  const rows = PACKAGES.map((p) => `<li><b>${p.title}</b> — ${toman(p.price)}</li>`).join('');
  const bills = l.bills.map((b) => `<li>${b.title} — ${toman(b.amount)} — ${b.paid ? 'پرداخت‌شده ✓' : 'پرداخت‌نشده'}</li>`).join('');
  return c.html(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>خدمات ایرانسل (نمونه)</title>
  <style>body{font-family:Vazirmatn,system-ui,sans-serif;margin:0;padding:16px;background:#fffbea;color:#222}h1{font-size:18px;margin:0 0 4px}.tag{display:inline-block;font-size:11px;background:#F5B300;color:#222;border-radius:99px;padding:2px 8px}.card{background:#fff;border:1px solid #f1e3a5;border-radius:12px;padding:12px;margin:12px 0}ul{padding-inline-start:18px;margin:6px 0}button{background:#F5B300;border:0;border-radius:8px;padding:8px 12px;font:inherit;cursor:pointer}small{color:#666}</style></head><body>
  <h1>خدمات ایرانسل <span class="tag">نمونهٔ شبیه‌سازی‌شده</span></h1><small>این مینی‌اپ صفحهٔ وبِ خودِ اپ است که داخل ویستا باز شده. ${ref === 'guest' ? 'هویت شما تأیید نشد (مهمان).' : 'هویت شما از توکن ویستا تأیید شد.'}</small>
  <div class="card"><b>وضعیت خط</b><ul><li>موجودی شارژ: ${toman(l.balance)}</li><li>بسته: ${l.package ? `${l.package.title} — ${toFaDigits(l.package.remaining_gb)} گیگ مانده، ${toFaDigits(l.package.days_left)} روز` : 'ندارد'}</li><li>تمدید خودکار: ${l.delegation_id ? 'فعال (وکالت)' : 'غیرفعال'}</li></ul></div>
  <div class="card"><b>بسته‌ها</b><ul>${rows}</ul><small>برای خرید، از دستیار یا گفت‌وگوی اپ بخواهید قرارداد بیاورد؛ این صفحه فقط نشان می‌دهد.</small></div>
  <div class="card"><b>قبض‌ها</b><ul>${bills}</ul></div>
  ${l.delegation_id ? `<div class="card"><b>شبیه‌سازی</b><p>وانمود کنید بسته تمام شد. اپ زیر وکالت شما، بی‌آنکه شما حاضر باشید، بستهٔ تازه می‌خرد و در گفت‌وگوی ویستا خبر می‌دهد.</p><form method="post" action="/apps/${APP_ID}/simulate/exhaust?token=${encodeURIComponent(token)}"><button>بسته تمام شد ← تمدید خودکار</button></form></div>` : ''}
  </body></html>`);
});
sampleApp.post('/simulate/exhaust', (c) => {
  const token = c.req.query('token') ?? '';
  const [b64, sig] = token.split('.');
  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString());
    if (!ed25519Verify(platformPublicKey(), b64, sig) || payload.exp < Date.now()) return c.text('توکن نامعتبر', 403);
    const r = simulateExhaustion(payload.user_id);
    return c.html(`<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><body style="font-family:Vazirmatn,system-ui;padding:16px"><p>✓ تمدید خودکار انجام شد: ${r.contract.title}. به گفت‌وگوی اپ در ویستا برگردید؛ رویداد و قرارداد آن‌جاست.</p><p><a href="/apps/${APP_ID}/mini?token=${encodeURIComponent(token)}">بازگشت</a></p></body></html>`);
  } catch (e: any) {
    return c.html(`<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><body style="font-family:Vazirmatn,system-ui;padding:16px"><p>✗ ${e?.message ?? e}</p><p><a href="/apps/${APP_ID}/mini?token=${encodeURIComponent(token)}">بازگشت</a></p></body></html>`, 400);
  }
});
export { canonicalJson };
