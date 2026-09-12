/**
 * example-server.mjs — کمینه‌ترین اپ کامل ویستا (Node ≥ 18).
 *
 * وابستگی‌ها:  npm i @modelcontextprotocol/sdk zod        (نسخهٔ SDK ≥ 1.30)
 * اجرا:        VISTA_URL=http://localhost:8787 PORT=8790 node example-server.mjs
 *
 * چه چیزی این‌جاست:
 *   /mcp   → نقطهٔ MCP (Streamable HTTP، بی‌نشست): منبع vista://manifest، یک ابزار خواندنی،
 *            یک ابزار ساختن قرارداد، و ابزار تحویل که فقط پردازشگر ویستا صدایش می‌زند.
 *   /mini  → مینی‌اپ: صفحهٔ وب خودِ اپ که ویستا با ?token= داخل iframe باز می‌کند.
 *
 * متغیرهای محیط:
 *   VISTA_APP_PRIVATE_KEY   کلید خصوصی Ed25519 (PEM/PKCS8). اگر نباشد، برای توسعه یک کلید موقت ساخته می‌شود.
 *   VISTA_URL               آدرس سکو؛ کلید عمومی سکو از GET /api/platform خوانده می‌شود.
 *   PUBLIC_URL              آدرس عمومی همین سرور (برای mini_app_url). پیش‌فرض http://localhost:PORT
 *   VISTA_APP_ID            شناسهٔ اپ نزد ویستا (manifest.id و app_id قراردادها). پیش‌فرض demo-shop
 */
import http from 'node:http';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// StreamableHTTPServerTransport همان WebStandardStreamableHTTPServerTransport است با مبدل node:http.
// روی Workers/Deno/Bun از webStandardStreamableHttp.js و transport.handleRequest(request) استفاده کنید.
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { generateKeyPair, publicKeyOf, signContract, contractHash, verifyPlatformExecuted, verifyMiniAppToken, verifyAssertion, newId, newNonce, nowIso, plusMinutes, userRefOf } from './vista-sign.mjs';

// ───────────────────────── پیکربندی ─────────────────────────
const PORT = Number(process.env.PORT ?? 8790);
const PUBLIC_URL = (process.env.PUBLIC_URL ?? `http://localhost:${PORT}`).replace(/\/$/, '');
const VISTA_URL = (process.env.VISTA_URL ?? 'http://localhost:8787').replace(/\/$/, '');
const APP_ID = process.env.VISTA_APP_ID ?? 'demo-shop'; // باید دقیقاً همان شناسه‌ای باشد که ویستا اپ را زیر آن ثبت کرده
const COLOR = '#2E7D6B';
const PRIVATE_KEY = process.env.VISTA_APP_PRIVATE_KEY ?? (() => { const k = generateKeyPair(); console.warn('⚠ کلید موقت ساخته شد؛ در تولید VISTA_APP_PRIVATE_KEY بدهید'); return k.privateKey; })();
const PUBLIC_KEY = publicKeyOf(PRIVATE_KEY);
const NICKNAMES = new Map();   // user_ref → nickname (نمونه؛ در تولید پایگاه‌داده)

// کلید عمومی سکو — برای راستی‌آزمایی امضای «executed|<hash>» و توکن مینی‌اپ.
let PLATFORM_KEY = process.env.PLATFORM_PUBLIC_KEY ?? '';
async function loadPlatformKey() {
  if (PLATFORM_KEY) return;
  try { PLATFORM_KEY = (await (await fetch(`${VISTA_URL}/api/platform`)).json()).public_key; console.log('کلید عمومی سکو خوانده شد'); }
  catch (e) { console.warn('⚠ کلید سکو خوانده نشد؛ تحویل و مینی‌اپ تا وقتی کلید نباشد رد می‌شوند:', e.message); }
}

// ───────────────────────── دادهٔ نمونه (به جای پایگاه دادهٔ خودتان) ─────────────────────────
const PRODUCTS = [
  { id: 'p1', title: 'کتاب ریاضی جامع', price: 320_000 },
  { id: 'p2', title: 'کتاب فیزیک جامع', price: 290_000 },
];
const orders = new Map(); // contract_id → order  (تحویل باید idempotent باشد)

// ───────────────────────── مانیفست ─────────────────────────
const MANIFEST = {
  vista: '1', id: APP_ID, name: 'فروشگاه نمونه', description: 'خرید کتاب با قرارداد ویستا — نمونهٔ آموزشی.',
  company: { name: 'شرکت نمونه' }, public_key: PUBLIC_KEY, appearance: { color: COLOR, logo: 'ف' }, category: 'آموزش',
  permissions: [{ key: 'notify', label: 'ارسال اعلان به من', description: 'وضعیت سفارش' }],
  data_permissions: [],
  tools: { read: ['list_products'], build: ['build_order_contract'], write: ['set_nickname'], fulfil: 'vista_fulfil' },
  environment: process.env.VISTA_ENV ?? 'stage',
  mini_app_url: `${PUBLIC_URL}/mini`,
  templates: [{ ref: 'demo-shop/order', title: 'خرید کتاب', min_rung: 1, settlement: 'on_delivery' }],
};

// ───────────────────────── کمکی‌ها ─────────────────────────
const text = (o) => ({ content: [{ type: 'text', text: typeof o === 'string' ? o : JSON.stringify(o) }] });
const fail = (msg) => ({ content: [{ type: 'text', text: msg }], isError: true });
/**
 * بافت ویستا. گواهی «به نیابت از» را وارسی می‌کنیم و **همان** را مبنا می‌گیریم، نه user_id لخت:
 * ادعای هویت نباید از سمت مدل بیاید. `aud` تضمین می‌کند گواهی اپ دیگری اینجا بازپخش نشود.
 */
function ctxOf(extra) {
  const v = extra?._meta?.vista;
  if (!v?.user_id) throw new Error('vista context missing (_meta.vista.user_id)');
  if (PLATFORM_KEY) {
    const claims = verifyAssertion(PLATFORM_KEY, v.assertion, { appId: APP_ID });
    if (!claims) throw new Error('گواهی «به نیابت از» معتبر نیست');
    return { ...v, user_id: claims.sub, user_ref: claims.user_ref, scopes: claims.scopes ?? [], env: claims.env };
  }
  // کلید سکو هنوز خوانده نشده — در تولید نباید پیش بیاید؛ لاگ کنید و ادامه ندهید.
  console.warn('⚠ کلید عمومی سکو در دسترس نیست؛ گواهی وارسی نشد');
  return v;
}

// ───────────────────────── سرور MCP ─────────────────────────
function buildServer() {
  const server = new McpServer({ name: APP_ID, version: '0.1.0' });

  // مانیفست: ویستا هنگام افزودن اپ و در هر بازبینی سلامت، این منبع را می‌خواند.
  server.registerResource('manifest', 'vista://manifest', { title: 'Vista manifest', mimeType: 'application/json' },
    async () => ({ contents: [{ uri: 'vista://manifest', mimeType: 'application/json', text: JSON.stringify(MANIFEST) }] }));

  // ابزار خواندنی — رایگان، بی‌قرارداد، readOnlyHint:true
  server.registerTool('list_products', { title: 'فهرست کتاب‌ها', description: 'کتاب‌های قابل خرید با قیمت (تومان)', inputSchema: {}, annotations: { readOnlyHint: true } },
    async (_args, extra) => {
      ctxOf(extra);   // حتی ابزار خواندنی هم گواهی را وارسی می‌کند — جوابِ «کدام کاربر» بخشی از خودِ پرسش است
      return text({ products: PRODUCTS.map((p) => ({ id: p.id, title: p.title, price_toman: p.price })) });
    });

  // نوشتن سبک — بار مالی ندارد، برگشت‌پذیر است، idempotent است. بدون قرارداد اجرا می‌شود.
  // پیش از افزودن هر ابزاری به tools.write، reference/mcp-write-guidance.md را بخوانید.
  server.registerTool('set_nickname', { title: 'نام مستعار', description: 'نام مستعار کاربر را در این فروشگاه تغییر می‌دهد. بی‌بارِ مالی و قابل بازگشت.', inputSchema: { nickname: z.string().min(1).max(40).describe('نام مستعار تازه') } },
    async (args, extra) => {
      const v = ctxOf(extra);
      NICKNAMES.set(v.user_ref, args.nickname);   // idempotent: همان ورودی، همان نتیجه
      return text({ ok: true, nickname: args.nickname });
    });

  // ابزار ساختن قرارداد — عدد از اپ می‌آید نه از مدل؛ اپ اول امضا می‌کند، کاربر آخر.
  server.registerTool('build_order_contract', { title: 'قرارداد خرید', description: 'قرارداد خرید یک کتاب را می‌سازد و امضا می‌کند؛ کاربر در ویستا امضا می‌کند.', inputSchema: { product_id: z.enum(PRODUCTS.map((p) => p.id)).describe('شناسهٔ کتاب از list_products') } },
    async (args, extra) => {
      const ctx = ctxOf(extra);
      const p = PRODUCTS.find((x) => x.id === args.product_id);
      if (!p) return fail('کتاب یافت نشد');
      const doc = {
        vista: '1', id: newId('ctr'), version: 1, prev_version_id: null,
        type: 'demo-shop.order', template_ref: 'demo-shop/order', app_id: APP_ID, title: `خرید ${p.title}`,
        parties: [
          { id: `app:${APP_ID}`, kind: 'app', role: 'provider', label: MANIFEST.name, must_sign: true },
          { id: ctx.user_id, kind: 'user', role: 'payer', label: ctx.name || 'شما', must_sign: true },
        ],
        clauses: [
          { key: 'subject', label: 'موضوع', value: 'خرید کتاب' },
          { key: 'item', label: 'کالا', value: p.title },
          { key: 'amount', label: 'مبلغ', value: p.price, kind: 'amount' },
          { key: 'delivery', label: 'تحویل', value: 'فعال‌سازی نسخهٔ دیجیتال بلافاصله پس از امضا؛ مبلغ اول مسدود و پس از تحویل کسر می‌شود' },
        ],
        open_clauses: [], conditions: [{ type: 'wallet.sufficient' }],
        effects: [
          { type: 'wallet.pay', amount: p.price, payee_app_id: APP_ID, memo: p.title },
          { type: 'app.action', action: 'order', params: { product_id: p.id } },
        ],
        fees: [], policy: { min_rung: 1, quorum: 'all', settlement: 'on_delivery' },
        appearance: { color: COLOR, logo: 'ف', display_name: MANIFEST.name },
        nonce: newNonce(), created_at: nowIso(), expires_at: plusMinutes(15),
      };
      return text(signContract(PRIVATE_KEY, doc)); // → { contract, canonical_hash, app_signature }
    });

  // ابزار تحویل — پنهان از دستیار؛ فقط پردازشگر با امضای سکو صدایش می‌زند. باید idempotent باشد (ویستا تا «delivered» نیاید دوباره صدا می‌زند).
  server.registerTool('vista_fulfil', { title: 'تحویل', description: 'فقط پردازشگر ویستا.', inputSchema: { contract: z.record(z.any()), platform_signature: z.string(), delegation_id: z.string().optional() } },
    async (args) => {
      const doc = args.contract;
      const hash = contractHash(doc);
      if (!PLATFORM_KEY) await loadPlatformKey();
      // مشکل گذرا (کلید سکو هنوز خوانده نشده): پاسخ غیرخطا بدون delivered → ویستا هر دقیقه دوباره می‌پرسد.
      // هر isError یا رویداد failed «قطعی» است: مسدودی آزاد و قرارداد failed می‌شود.
      if (!PLATFORM_KEY) return text({ events: [{ type: 'note', text: 'کلید سکو هنوز در دسترس نیست؛ دوباره تلاش می‌شود' }] });
      if (!verifyPlatformExecuted(PLATFORM_KEY, hash, args.platform_signature)) return { ...text({ events: [{ type: 'failed', text: 'امضای سکو معتبر نیست' }] }), isError: true };
      if (doc.app_id !== APP_ID) return { ...text({ events: [{ type: 'failed', text: 'قرارداد مال این اپ نیست' }] }), isError: true };
      const user = doc.parties.find((p) => p.kind === 'user');           // در تحویل _meta نیست؛ کاربر از خودِ قرارداد
      const action = doc.effects.find((e) => e.type === 'app.action');
      if (!orders.has(doc.id)) orders.set(doc.id, { user_ref: userRefOf(user.id), product_id: action?.params?.product_id, at: nowIso() });
      return text({ events: [{ type: 'delivered', text: 'نسخهٔ دیجیتال فعال شد' }] });
    });
  return server;
}

// ───────────────────────── مینی‌اپ ─────────────────────────
function miniHtml(url) {
  const payload = verifyMiniAppToken(PLATFORM_KEY, url.searchParams.get('token') ?? '');
  const who = payload ? `کاربر ${payload.user_ref}` : 'مهمان (توکن نامعتبر یا منقضی)';
  const mine = payload ? [...orders.values()].filter((o) => o.user_ref === payload.user_ref) : [];
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${MANIFEST.name}</title>
<style>body{font-family:Vazirmatn,system-ui,sans-serif;margin:0;padding:16px;color:#222}h1{font-size:18px}.card{border:1px solid #ddd;border-radius:12px;padding:12px;margin:12px 0}</style></head>
<body><h1>${MANIFEST.name}</h1><small>${who}</small>
<div class="card"><b>کتاب‌ها</b><ul>${PRODUCTS.map((p) => `<li>${p.title} — ${p.price.toLocaleString('fa-IR')} تومان</li>`).join('')}</ul><small>برای خرید از دستیار ویستا بخواهید قرارداد بیاورد؛ این صفحه فقط نشان می‌دهد و امضا نمی‌گیرد.</small></div>
<div class="card"><b>سفارش‌های شما</b><ul>${mine.map((o) => `<li>${o.product_id} — ${o.at}</li>`).join('') || '<li>هنوز سفارشی نیست</li>'}</ul></div></body></html>`;
}

// ───────────────────────── HTTP ─────────────────────────
await loadPlatformKey();
http.createServer(async (req, res) => {
  const url = new URL(req.url, PUBLIC_URL);
  if (url.pathname === '/mcp') {
    // بی‌نشست: برای هر درخواست یک سرور و ترنسپورت تازه — ساده، مقیاس‌پذیر، و برای ویستا کافی.
    const server = buildServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => { transport.close(); server.close(); });
    await server.connect(transport);
    return transport.handleRequest(req, res);
  }
  if (url.pathname === '/mini') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(miniHtml(url)); }
  if (url.pathname === '/health') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(JSON.stringify({ ok: true, app: APP_ID })); }
  res.writeHead(404); res.end();
}).listen(PORT, () => console.log(`اپ نمونه روی ${PUBLIC_URL} · MCP: ${PUBLIC_URL}/mcp · کلید عمومی: ${PUBLIC_KEY}`));
