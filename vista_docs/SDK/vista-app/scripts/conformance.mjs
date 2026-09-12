#!/usr/bin/env node
/**
 * conformance.mjs — آزمون انطباق یک اپ ویستا، بدون هیچ وابستگی.
 *
 *   node conformance.mjs <mcp-url> [--platform-key <b64>] [--tool <build_tool>] [--args '<json>']
 *                                  [--platform-private-key <pem-file>] [--header 'Name: value']
 *
 * مستقیماً با MCP JSON-RPC روی Streamable HTTP حرف می‌زند (initialize → notifications/initialized →
 * tools/list → resources/read vista://manifest → یک ابزار ساختن قرارداد → آزمون منفی ابزار تحویل).
 * پاسخ‌های JSON ساده و SSE هر دو پشتیبانی می‌شوند؛ mcp-session-id اگر بیاید، برگردانده می‌شود.
 * خروجی: ✓ / ✗ / ⚠ با پیام فارسی؛ کد خروج ۱ اگر حتی یک ✗ باشد.
 */
import { readFileSync } from 'node:fs';
import { contractHash, verify, verifyPlatformExecuted, publicKeyOf, signMessage, generateKeyPair } from '../lib/vista-sign.mjs';

// ───────────────────────── args ─────────────────────────
const argv = process.argv.slice(2);
if (!argv[0] || argv[0].startsWith('-')) {
  console.error('استفاده: node conformance.mjs <mcp-url> [--platform-key <b64>] [--tool <name>] [--args <json>] [--platform-private-key <pem-file>] [--header "Name: value"]');
  process.exit(2);
}
const MCP_URL = argv[0];
const opt = (name) => { const i = argv.indexOf(name); return i > 0 && argv[i + 1] !== undefined ? argv[i + 1] : undefined; };
const PLATFORM_KEY = opt('--platform-key');
const FORCE_TOOL = opt('--tool');
const FORCE_ARGS = opt('--args') ? JSON.parse(opt('--args')) : undefined;
const PLATFORM_PRIV = opt('--platform-private-key') ? readFileSync(opt('--platform-private-key'), 'utf8') : undefined;
const EXTRA_HEADERS = {};
for (let i = 1; i < argv.length; i++) if (argv[i] === '--header' && argv[i + 1]) { const [k, ...v] = argv[i + 1].split(':'); EXTRA_HEADERS[k.trim()] = v.join(':').trim(); }

// ───────────────────────── reporting ─────────────────────────
let fails = 0, warns = 0, passes = 0;
const ok = (m) => { passes++; console.log(`✓ ${m}`); };
const bad = (m) => { fails++; console.log(`✗ ${m}`); };
const warn = (m) => { warns++; console.log(`⚠ ${m}`); };
const check = (cond, msgOk, msgBad) => (cond ? ok(msgOk) : bad(msgBad ?? msgOk));
const section = (t) => console.log(`\n── ${t} ──`);
const short = (v, n = 160) => { const s = typeof v === 'string' ? v : JSON.stringify(v); return s.length > n ? s.slice(0, n) + '…' : s; };

// ───────────────────────── MCP over Streamable HTTP ─────────────────────────
let rpcId = 0;
let sessionId = null;
const PROTOCOL = '2025-06-18';

async function post(body) {
  const headers = { 'content-type': 'application/json', accept: 'application/json, text/event-stream', 'mcp-protocol-version': PROTOCOL, 'user-agent': 'vista-conformance/0.1', ...EXTRA_HEADERS };
  if (sessionId) headers['mcp-session-id'] = sessionId;
  const res = await fetch(MCP_URL, { method: 'POST', headers, body: JSON.stringify(body) });
  const sid = res.headers.get('mcp-session-id');
  if (sid) sessionId = sid;
  const ct = res.headers.get('content-type') ?? '';
  const text = await res.text();
  return { status: res.status, ct, text };
}
function parseMessages(ct, text) {
  if (!text.trim()) return [];
  if (ct.includes('text/event-stream')) {
    const msgs = [];
    for (const block of text.split(/\n\n+/)) {
      const data = block.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('\n');
      if (!data) continue;
      try { msgs.push(JSON.parse(data)); } catch { /* skip */ }
    }
    return msgs;
  }
  const j = JSON.parse(text);
  return Array.isArray(j) ? j : [j];
}
async function request(method, params = {}) {
  const id = ++rpcId;
  const r = await post({ jsonrpc: '2.0', id, method, params });
  if (r.status >= 400) throw new Error(`HTTP ${r.status} برای ${method}: ${short(r.text)}`);
  const msg = parseMessages(r.ct, r.text).find((m) => m.id === id);
  if (!msg) throw new Error(`پاسخی با id=${id} برای ${method} نیامد (${r.ct || 'بدون content-type'}): ${short(r.text)}`);
  if (msg.error) throw new Error(`خطای JSON-RPC در ${method}: ${msg.error.code} ${msg.error.message}`);
  return msg.result;
}
async function notify(method, params = {}) {
  const r = await post({ jsonrpc: '2.0', method, params });
  return r.status;
}

// ───────────────────────── schema replica (contractDocSchema + createContract rules) ─────────────────────────
const isStr = (v, min = 0) => typeof v === 'string' && v.length >= min;
const isInt = (v) => Number.isInteger(v);
const isPosInt = (v) => isInt(v) && v > 0;
const isIso = (v) => isStr(v, 1) && !Number.isNaN(new Date(v).getTime());
const CLAUSE_KINDS = ['text', 'amount', 'date', 'phone', 'number', 'list', 'note'];
const PARTY_KINDS = ['app', 'user', 'platform'];

function schemaErrors(doc) {
  const e = [];
  const p = (path, cond, msg) => { if (!cond) e.push(`${path}: ${msg}`); };
  if (!doc || typeof doc !== 'object') return ['contract: باید یک شیء باشد'];
  p('vista', doc.vista === '1', "باید '1' باشد");
  p('id', isStr(doc.id, 4), 'رشته با دست‌کم ۴ نویسه');
  p('version', isPosInt(doc.version), 'عدد صحیح مثبت');
  p('prev_version_id', doc.prev_version_id === null || isStr(doc.prev_version_id), 'رشته یا null');
  p('type', isStr(doc.type, 1), 'رشتهٔ ناتهی');
  p('template_ref', isStr(doc.template_ref), 'رشته');
  p('app_id', isStr(doc.app_id, 1), 'رشتهٔ ناتهی');
  p('title', isStr(doc.title, 1), 'رشتهٔ ناتهی');
  p('parties', Array.isArray(doc.parties) && doc.parties.length >= 2, 'آرایه با دست‌کم ۲ طرف');
  (doc.parties ?? []).forEach((pt, i) => {
    p(`parties.${i}.id`, isStr(pt?.id, 1), 'رشتهٔ ناتهی');
    p(`parties.${i}.kind`, PARTY_KINDS.includes(pt?.kind), 'app | user | platform');
    p(`parties.${i}.role`, isStr(pt?.role), 'رشته');
    p(`parties.${i}.label`, isStr(pt?.label), 'رشته');
    p(`parties.${i}.must_sign`, typeof pt?.must_sign === 'boolean', 'boolean');
    p(`parties.${i}.visible_clauses`, pt?.visible_clauses === undefined || (Array.isArray(pt.visible_clauses) && pt.visible_clauses.every((s) => isStr(s))), 'آرایهٔ رشته یا غایب');
  });
  p('clauses', Array.isArray(doc.clauses), 'آرایه');
  (doc.clauses ?? []).forEach((c, i) => {
    p(`clauses.${i}.key`, isStr(c?.key, 1), 'رشتهٔ ناتهی');
    p(`clauses.${i}.label`, isStr(c?.label, 1), 'رشتهٔ ناتهی');
    p(`clauses.${i}.value`, c?.value === null || typeof c?.value === 'string' || typeof c?.value === 'number', 'string | number | null');
    p(`clauses.${i}.kind`, c?.kind === undefined || CLAUSE_KINDS.includes(c.kind), CLAUSE_KINDS.join(' | '));
    p(`clauses.${i}.visible_to`, c?.visible_to === undefined || (Array.isArray(c.visible_to) && c.visible_to.every((s) => isStr(s))), 'آرایهٔ رشته یا غایب');
  });
  p('open_clauses', Array.isArray(doc.open_clauses), 'آرایه');
  (doc.open_clauses ?? []).forEach((o, i) => { p(`open_clauses.${i}`, isStr(o?.key) && isStr(o?.owner) && isStr(o?.label) && (o?.kind === undefined || isStr(o.kind)), '{key, owner, label, kind?}'); });
  p('conditions', Array.isArray(doc.conditions) && doc.conditions.every((c) => c && isStr(c.type)), 'آرایه‌ای از {type, …}');
  p('effects', Array.isArray(doc.effects), 'آرایه');
  (doc.effects ?? []).forEach((ef, i) => {
    const at = `effects.${i}`;
    switch (ef?.type) {
      case 'wallet.pay': p(at, isPosInt(ef.amount) && isStr(ef.payee_app_id) && (ef.memo === undefined || isStr(ef.memo)), 'wallet.pay: amount عدد صحیح مثبت، payee_app_id رشته، memo اختیاری'); break;
      case 'wallet.topup': p(at, isPosInt(ef.amount), 'wallet.topup: amount عدد صحیح مثبت'); break;
      case 'app.install': case 'permission.grant': p(at, isStr(ef.app_id) && Array.isArray(ef.permissions) && ef.permissions.every(isStr), `${ef.type}: app_id رشته، permissions آرایهٔ رشته`); break;
      case 'delegation.grant': p(at, isStr(ef.app_id) && isStr(ef.scope, 1) && isStr(ef.label, 1) && isPosInt(ef.cap) && (ef.per_use_cap === undefined || isPosInt(ef.per_use_cap)) && isStr(ef.expires_at), 'delegation.grant: app_id, scope, label, cap (صحیح مثبت), per_use_cap?, expires_at'); break;
      case 'genesis': p(at, Array.isArray(ef.system_apps), 'genesis: system_apps آرایه'); break;
      case 'app.action': p(at, isStr(ef.action) && ef.params && typeof ef.params === 'object' && !Array.isArray(ef.params), 'app.action: action رشته، params شیء'); break;
      default: p(at, false, `نوع اثر ناشناخته: ${ef?.type}`);
    }
  });
  p('fees', Array.isArray(doc.fees) && doc.fees.every((f) => f && isStr(f.beneficiary) && isInt(f.amount) && f.amount >= 0 && (f.label === undefined || isStr(f.label)) && (f.visible === undefined || typeof f.visible === 'boolean')), 'آرایه‌ای از {beneficiary, amount ≥ 0, label?, visible?}');
  p('policy.min_rung', isInt(doc.policy?.min_rung) && doc.policy.min_rung >= 1 && doc.policy.min_rung <= 5, 'عدد صحیح ۱ تا ۵');
  p('policy.quorum', doc.policy?.quorum === 'all', "'all'");
  p('policy.settlement', ['immediate', 'on_delivery'].includes(doc.policy?.settlement), 'immediate | on_delivery');
  p('appearance', doc.appearance && isStr(doc.appearance.color) && isStr(doc.appearance.logo) && isStr(doc.appearance.display_name), '{color, logo, display_name} همگی رشته');
  p('nonce', isStr(doc.nonce, 8), 'رشته با دست‌کم ۸ نویسه');
  p('created_at', isIso(doc.created_at), 'زمان ISO');
  p('expires_at', isIso(doc.expires_at), 'زمان ISO');
  p('delegation_id', doc.delegation_id === undefined || isStr(doc.delegation_id), 'رشته یا غایب');
  return e;
}
function contractAmount(doc) {
  let sum = 0;
  for (const e of doc.effects ?? []) {
    if (e.type === 'wallet.pay' || e.type === 'wallet.topup') sum += e.amount;
    if (e.type === 'delegation.grant') sum = Math.max(sum, e.cap);
  }
  return sum;
}
function requiredRung(doc, ceilings = { rung1: 2_000_000, rung2: 20_000_000 }) {
  let r = doc.policy.min_rung;
  const amt = contractAmount(doc);
  if (amt > ceilings.rung1) r = Math.max(r, 2);
  if (amt > ceilings.rung2) r = Math.max(r, 3);
  if (doc.effects.some((e) => e.type === 'delegation.grant')) r = Math.max(r, 2);
  if (doc.effects.some((e) => (e.type === 'app.install' || e.type === 'permission.grant') && e.permissions.some((p) => p.startsWith('financial:')))) r = Math.max(r, 2);
  return r;
}

// ───────────────────────── sample args from JSON schema ─────────────────────────
function sampleFromSchema(schema, name = '') {
  if (!schema || typeof schema !== 'object') return 'test';
  if (schema.default !== undefined) return schema.default;
  if (schema.const !== undefined) return schema.const;
  if (Array.isArray(schema.enum) && schema.enum.length) return schema.enum[0];
  if (schema.anyOf?.length) return sampleFromSchema(schema.anyOf[0], name);
  if (schema.oneOf?.length) return sampleFromSchema(schema.oneOf[0], name);
  const t = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  switch (t) {
    case 'integer': case 'number': {
      const min = schema.minimum ?? schema.exclusiveMinimum ?? 1;
      const v = schema.exclusiveMinimum !== undefined && schema.minimum === undefined ? min + 1 : min;
      return t === 'integer' ? Math.ceil(v) : v;
    }
    case 'boolean': return false;
    case 'array': return [];
    case 'object': {
      const o = {};
      for (const k of schema.required ?? []) o[k] = sampleFromSchema(schema.properties?.[k], k);
      return o;
    }
    default: {
      if (schema.format === 'date-time') return new Date(Date.now() + 86_400_000).toISOString();
      if (schema.format === 'uri' || schema.format === 'url') return 'https://example.com';
      if (/phone|mobile/i.test(name)) return '09121234567';
      if (/_id$|^id$/i.test(name)) return 'test';
      return 'test';
    }
  }
}

// ───────────────────────── main ─────────────────────────
const VISTA_CTX = { user_id: 'user:test', user_ref: 'u_test' };
/**
 * گواهی «به نیابت از» که سکو به هر فراخوانی می‌چسباند.
 * اپِ منطبق آن را وارسی می‌کند، پس آزمون باید گواهی معتبر بفرستد وگرنه اپ درست، رد می‌شود.
 * با --platform-private-key گواهی واقعی امضا می‌شود؛ بدون آن، گواهی نمی‌رود و اپ‌هایی که
 * وارسی می‌کنند (درست) رد خواهند کرد — همان هشداری که پایین داده می‌شود.
 */
function mintAssertion(appId, privPem, { ttlSec = 300 } = {}) {
  const iat = Math.floor(Date.now() / 1000);
  const claims = { iss: 'vista', aud: appId, sub: VISTA_CTX.user_id, user_ref: VISTA_CTX.user_ref, scopes: [], env: 'stage', iat, exp: iat + ttlSec, jti: 'as_conformance' };
  const b64 = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${b64}.${signMessage(privPem, b64)}`;
}
/** بافت هر فراخوانی — با گواهی معتبر اگر کلید خصوصی سکو را داریم. */
let ctx = () => VISTA_CTX;

async function main() {
  console.log(`آزمون انطباق اپ ویستا — ${MCP_URL}`);
  if (PLATFORM_KEY) check(Buffer.from(PLATFORM_KEY, 'base64').length === 32, 'کلید عمومی سکو ۳۲ بایت است', 'کلید عمومی سکو (--platform-key) باید base64 از ۳۲ بایت باشد');

  // 1. reachable
  section('اتصال');
  let init;
  try {
    init = await request('initialize', { protocolVersion: PROTOCOL, capabilities: {}, clientInfo: { name: 'vista-conformance', version: '0.1.0' } });
    ok(`اپ در دسترس است — ${init.serverInfo?.name ?? '?'} ${init.serverInfo?.version ?? ''} · پروتکل ${init.protocolVersion}`);
  } catch (e) {
    bad(`اتصال برقرار نشد: ${e.message}`);
    return finish();
  }
  const nstatus = await notify('notifications/initialized');
  check(nstatus < 400, `notifications/initialized پذیرفته شد (HTTP ${nstatus})`, `notifications/initialized رد شد (HTTP ${nstatus})`);
  if (sessionId) ok(`نشست: mcp-session-id دریافت و بازگردانده می‌شود (${short(sessionId, 12)})`); else ok('بی‌نشست (stateless) — برای ویستا کافی است');
  check(!!init.capabilities?.resources, 'قابلیت resources اعلام شده (لازم برای خواندن مانیفست)', 'سرور قابلیت resources را اعلام نمی‌کند؛ ویستا مانیفست را نمی‌خواند (registerResource را صدا بزنید)');
  check(!!init.capabilities?.tools, 'قابلیت tools اعلام شده', 'سرور قابلیت tools را اعلام نمی‌کند');

  // 2. manifest
  section('مانیفست vista://manifest');
  let manifest = null;
  try {
    const r = await request('resources/read', { uri: 'vista://manifest' });
    const c = r.contents?.[0];
    check(!!c?.text, 'منبع vista://manifest خوانده شد', 'منبع vista://manifest متن ندارد');
    if (c?.mimeType && c.mimeType !== 'application/json') warn(`mimeType مانیفست ${c.mimeType} است؛ application/json توصیه می‌شود`);
    try { manifest = JSON.parse(c.text); ok('مانیفست JSON معتبر است'); } catch { bad('مانیفست JSON معتبر نیست'); }
  } catch (e) { bad(`خواندن مانیفست ناموفق: ${e.message}`); }
  if (manifest) {
    check(manifest.vista === '1', "manifest.vista === '1'", "manifest.vista باید '1' باشد");
    check(isStr(manifest.id, 1), `manifest.id = ${manifest.id}`, 'manifest.id رشتهٔ ناتهی لازم است');
    if (isStr(manifest.id) && !/^[a-z0-9][a-z0-9._-]*$/.test(manifest.id)) warn('manifest.id بهتر است فقط حروف کوچک لاتین، رقم، نقطه، خط تیره باشد');
    check(isStr(manifest.name, 1), `manifest.name = ${manifest.name}`, 'manifest.name لازم است');
    if (!isStr(manifest.description, 1)) warn('manifest.description خالی است؛ در ویترین دیده می‌شود');
    let pk = null;
    try { pk = Buffer.from(manifest.public_key ?? '', 'base64'); } catch { /* */ }
    check(pk && pk.length === 32 && Buffer.from(pk).toString('base64') === manifest.public_key, 'manifest.public_key کلید Ed25519 خام ۳۲ بایتی (base64) است', 'manifest.public_key باید base64 از ۳۲ بایت خام Ed25519 باشد');
    check(manifest.tools && typeof manifest.tools === 'object', 'manifest.tools موجود است', 'manifest.tools لازم است ({read, build, fulfil})');
    const T = manifest.tools ?? {};
    check(Array.isArray(T.read ?? []) && Array.isArray(T.build ?? []), 'tools.read و tools.build آرایه‌اند', 'tools.read و tools.build باید آرایهٔ نام ابزار باشند');
    check(Array.isArray(T.write ?? []), 'tools.write آرایه یا غایب است', 'tools.write باید آرایهٔ نام ابزار باشد');
    check(T.fulfil === undefined || isStr(T.fulfil, 1), 'tools.fulfil رشته یا غایب است', 'tools.fulfil باید نام یک ابزار باشد');
    // نوشتن سبک — تشخیصش با اپ است، اما چند الگو تقریباً همیشه اشتباه‌اند.
    const WRITE_RED = /^(delete|remove|cancel|send|publish|share|invite|transfer|pay|charge|refund|revoke|grant)/i;
    for (const w of T.write ?? []) {
      if (WRITE_RED.test(w)) bad(`ابزار «${w}» در tools.write جا ندارد — برگشت‌ناپذیر یا اثرگذار بر شخص ثالث به نظر می‌رسد؛ جایش قرارداد است (reference/mcp-write-guidance.md)`);
      else ok(`نوشتن سبک: ${w}`);
      if ((T.read ?? []).includes(w) || (T.build ?? []).includes(w)) bad(`ابزار «${w}» هم‌زمان در write و read/build است`);
    }
    if ((T.write ?? []).length) warn('tools.write اعلام شده — چک‌لیست reference/mcp-write-guidance.md را برای هر ابزار سبز کنید؛ ویستا این فهرست را بازبینی نمی‌کند');
    if (manifest.environment !== undefined) check(['stage', 'production'].includes(manifest.environment), `environment = ${manifest.environment}`, "environment باید 'stage' یا 'production' باشد");
    else warn("environment اعلام نشده؛ توصیه می‌شود تا اپِ استیج در پروداکشن ثبت نشود");
    if (!(T.build ?? []).length) warn('هیچ ابزار ساختن قرارداد اعلام نشده؛ اپ فقط خواندنی خواهد بود');
    if ((T.build ?? []).length && !T.fulfil) warn('ابزار ساختن قرارداد هست اما tools.fulfil نیست؛ قراردادهای wallet.pay/app.action تحویل نمی‌گیرند');
    if (T.fulfil) check(!(T.read ?? []).includes(T.fulfil) && !(T.build ?? []).includes(T.fulfil), 'ابزار تحویل در read/build نیست', 'ابزار تحویل نباید در read یا build باشد (باید از دستیار پنهان بماند)');
    const perms = manifest.permissions ?? [];
    check(Array.isArray(perms) && perms.every((x) => isStr(x?.key, 1) && isStr(x?.label, 1)), `permissions: ${perms.map((x) => x.key).join(', ') || 'هیچ'}`, 'هر permission باید {key, label, description?} باشد');
    const fin = manifest.financial_permissions ?? [];
    check(Array.isArray(fin) && fin.every((x) => isStr(x?.key, 1) && isStr(x?.label, 1) && (x.cap_default === undefined || isPosInt(x.cap_default))), `financial_permissions: ${fin.map((x) => x.key).join(', ') || 'هیچ'}`, 'هر financial_permission باید {key, label, cap_default?, period?, description?} باشد');
    const dp = manifest.data_permissions ?? [];
    check(Array.isArray(dp) && dp.every(isStr), 'data_permissions آرایهٔ رشته است', 'data_permissions باید آرایهٔ رشته باشد');
    for (const d of dp) if (!['profile.phone', 'profile.name'].includes(d)) warn(`data_permission ناشناخته: ${d} (این نسخه فقط profile.phone و profile.name را می‌فهمد)`);
    if (dp.length && !perms.some((x) => x.key === 'profile.read')) warn('data_permissions اعلام شده اما مجوز profile.read در permissions نیست؛ داده هرگز نمی‌رسد');
    if (manifest.appearance?.color && !/^#[0-9a-fA-F]{6}$/.test(manifest.appearance.color)) warn('appearance.color بهتر است #RRGGBB باشد');
    if (manifest.mini_app_url !== undefined) { try { new URL(manifest.mini_app_url); ok(`mini_app_url = ${manifest.mini_app_url}`); } catch { bad('mini_app_url آدرس معتبر نیست'); } }
    const tpl = manifest.templates ?? [];
    check(Array.isArray(tpl) && tpl.every((t) => isStr(t?.ref, 1) && isStr(t?.title, 1) && (t.min_rung === undefined || (isInt(t.min_rung) && t.min_rung >= 1 && t.min_rung <= 5)) && (t.settlement === undefined || ['immediate', 'on_delivery'].includes(t.settlement))), `templates: ${tpl.map((t) => t.ref).join(', ') || 'هیچ'}`, 'هر template باید {ref, title, min_rung?, settlement?, description?} باشد');
    if ('verified' in manifest) warn('فیلد verified در مانیفست نادیده گرفته می‌شود؛ نشان آبی را فقط ویستا می‌دهد');
  }

  // 3. tools
  section('ابزارها');
  let tools = [];
  try {
    const r = await request('tools/list');
    tools = r.tools ?? [];
    ok(`${tools.length} ابزار فهرست شد: ${tools.map((t) => t.name).join(', ')}`);
  } catch (e) { bad(`tools/list ناموفق: ${e.message}`); }
  const names = new Set(tools.map((t) => t.name));
  const T = manifest?.tools ?? {};
  const declared = new Set([...(T.read ?? []), ...(T.build ?? []), ...(T.write ?? []), ...(T.fulfil ? [T.fulfil] : [])]);
  for (const n of T.read ?? []) check(names.has(n), `ابزار خواندنی ${n} وجود دارد`, `ابزار خواندنی ${n} در مانیفست هست اما در tools/list نیست`);
  for (const n of T.build ?? []) check(names.has(n), `ابزار ساختن ${n} وجود دارد`, `ابزار ساختن ${n} در مانیفست هست اما در tools/list نیست`);
  for (const n of T.write ?? []) check(names.has(n), `ابزار نوشتن سبک ${n} وجود دارد`, `ابزار نوشتن سبک ${n} در مانیفست هست اما در tools/list نیست`);
  if (T.fulfil) check(names.has(T.fulfil), `ابزار تحویل ${T.fulfil} وجود دارد`, `ابزار تحویل ${T.fulfil} در tools/list نیست`);
  for (const n of [...(T.read ?? [])].filter((x) => (T.build ?? []).includes(x))) bad(`ابزار ${n} هم در read و هم در build است`);
  for (const t of tools) {
    if (!declared.has(t.name)) warn(`ابزار ${t.name} در مانیفست اعلام نشده؛ ویستا آن را پنهان می‌کند`);
    if ((T.read ?? []).includes(t.name) && t.annotations?.readOnlyHint !== true) warn(`ابزار خواندنی ${t.name} annotation readOnlyHint:true ندارد`);
    if ((T.build ?? []).includes(t.name) && t.annotations?.readOnlyHint === true) warn(`ابزار ساختن ${t.name} نباید readOnlyHint:true داشته باشد`);
  }

  // 3ب. گواهی «به نیابت از» — اپ باید گواهی جعلی را رد کند و گواهی معتبر را بپذیرد
  section('گواهی «به نیابت از»');
  if (PLATFORM_PRIV && manifest?.id) {
    ctx = () => ({ ...VISTA_CTX, assertion: mintAssertion(manifest.id, PLATFORM_PRIV) });
    ok('گواهی معتبر با کلید خصوصی سکو امضا می‌شود و به هر فراخوانی می‌رود');
  } else {
    warn('بدون --platform-private-key گواهی معتبری فرستاده نمی‌شود؛ اپی که درست وارسی می‌کند فراخوانی‌ها را رد خواهد کرد. برای آزمون کامل: کلید آزمایشی بسازید، اپ را با PLATFORM_PUBLIC_KEY همان کلید اجرا کنید، و اینجا --platform-private-key بدهید.');
  }
  {
    const probeTool = (T.read ?? []).find((n) => names.has(n)) ?? (T.write ?? []).find((n) => names.has(n));
    if (!probeTool) warn('ابزار خواندنی‌ای برای آزمودن گواهی نبود');
    else {
      const tool = tools.find((t) => t.name === probeTool);
      const args = sampleFromSchema(tool?.inputSchema ?? { type: 'object' });
      // گواهی با کلید دیگری امضا شده — اپِ منطبق باید ردش کند.
      const other = generateKeyPair();
      const claims = { iss: 'vista', aud: manifest?.id ?? 'unknown', sub: VISTA_CTX.user_id, user_ref: VISTA_CTX.user_ref, scopes: [], env: 'stage', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 300, jti: 'as_probe' };
      const b64 = Buffer.from(JSON.stringify(claims)).toString('base64url');
      const forged = `${b64}.${signMessage(other.privateKey, b64)}`;
      try {
        const r = await request('tools/call', { name: probeTool, arguments: args, _meta: { vista: { ...ctx(), assertion: forged } } });
        if (r?.isError) ok('گواهی جعلی رد شد');
        else warn(`ابزار «${probeTool}» با گواهی جعلی هم جواب داد — اپ باید _meta.vista.assertion را با کلید سکو وارسی کند (reference/tools.md)`);
      } catch { ok('گواهی جعلی رد شد'); }
    }
  }

  // 4. build one contract
  section('ساختن قرارداد');
  const candidates = FORCE_TOOL ? [FORCE_TOOL] : (T.build ?? []).filter((n) => names.has(n));
  let built = null, usedTool = null;
  for (const name of candidates) {
    const tool = tools.find((t) => t.name === name);
    const args = FORCE_ARGS ?? sampleFromSchema(tool?.inputSchema ?? { type: 'object' });
    try {
      const r = await request('tools/call', { name, arguments: args, _meta: { vista: ctx() } });
      const text = r.content?.filter((c) => c.type === 'text').map((c) => c.text).join('') ?? '';
      let parsed = r.structuredContent ?? null;
      if (!parsed) { try { parsed = JSON.parse(text); } catch { parsed = null; } }
      if (r.isError) { warn(`ابزار ${name} با آرگومان ${short(args, 80)} خطا داد: ${short(text, 100)} — ابزار بعدی`); continue; }
      if (!parsed?.contract) { bad(`ابزار ${name} پاسخ داد اما {contract, canonical_hash, app_signature} نبود: ${short(text, 120)}`); continue; }
      built = parsed; usedTool = name;
      ok(`ابزار ${name} با آرگومان ${short(args, 100)} قرارداد برگرداند`);
      break;
    } catch (e) { warn(`فراخوانی ${name} ناموفق: ${e.message}`); }
  }
  if (!candidates.length) warn('ابزار ساختنی برای آزمون نیست');
  else if (!built) bad('هیچ ابزار ساختنی قرارداد معتبری برنگرداند (برای آرگومان دستی: --tool <name> --args <json>)');

  if (built) {
    const doc = built.contract;
    check(isStr(built.canonical_hash) && /^[0-9a-f]{64}$/.test(built.canonical_hash), 'canonical_hash رشتهٔ hex ۶۴ نویسه‌ای است', 'canonical_hash باید sha256 hex با حروف کوچک باشد');
    check(isStr(built.app_signature, 1), 'app_signature موجود است', 'app_signature لازم است');
    const errs = schemaErrors(doc);
    if (errs.length) for (const e of errs.slice(0, 12)) bad(`ساختار قرارداد: ${e}`); else ok('ساختار قرارداد با contractDocSchema می‌خواند');
    if (!errs.length) {
      // createContract rules
      check(doc.parties.some((p) => p.id === VISTA_CTX.user_id), `کاربر (${VISTA_CTX.user_id}) طرف قرارداد است`, 'کاربر با شناسهٔ _meta.vista.user_id طرف قرارداد نیست');
      const userParty = doc.parties.find((p) => p.id === VISTA_CTX.user_id);
      if (userParty && userParty.kind !== 'user') bad('طرف کاربر باید kind=user داشته باشد');
      if (userParty && !userParty.must_sign && !doc.delegation_id) bad('کاربر باید امضاکننده باشد (must_sign:true) — جز در اجرای زیر وکالت');
      const appParty = doc.parties.find((p) => p.id === `app:${doc.app_id}`);
      check(!!appParty, `اپ (app:${doc.app_id}) طرف قرارداد است`, 'طرفی با شناسهٔ app:<app_id> در قرارداد نیست');
      if (appParty && !appParty.must_sign) warn('طرف اپ must_sign:false است؛ معمولاً اپ اول امضا می‌کند');
      if (manifest) check(doc.app_id === manifest.id, `app_id با manifest.id یکی است (${doc.app_id})`, `app_id (${doc.app_id}) با manifest.id (${manifest.id}) فرق دارد`);
      for (const e of doc.effects) {
        if (e.type === 'wallet.pay') check(e.payee_app_id === doc.app_id, 'wallet.pay.payee_app_id همان app_id است', `wallet.pay.payee_app_id (${e.payee_app_id}) باید همان app_id باشد`);
        if (['app.install', 'permission.grant', 'delegation.grant'].includes(e.type)) check(e.app_id === doc.app_id, `${e.type}.app_id همان app_id است`, `${e.type}.app_id باید همان app_id باشد`);
        if (e.type === 'delegation.grant') {
          const t = new Date(e.expires_at).getTime();
          check(t > Date.now(), 'انقضای وکالت در آینده است', 'انقضای وکالت باید در آینده باشد');
          check(t <= Date.now() + 366 * 86_400_000, 'انقضای وکالت ≤ یک سال است', 'وکالت بیش از یک سال مجاز نیست');
          check(!!e.per_use_cap, 'وکالت per_use_cap دارد', 'وکالت بهتر است per_use_cap داشته باشد');
        }
        if (e.type === 'wallet.topup' || e.type === 'genesis') bad(`اثر ${e.type} فقط برای سکوست؛ اپ نمی‌تواند آن را بسازد`);
      }
      const exp = new Date(doc.expires_at).getTime();
      check(exp > Date.now(), `expires_at در آینده است (${Math.round((exp - Date.now()) / 60_000)} دقیقه)`, 'قرارداد پیش از ثبت منقضی شده است');
      if (exp - Date.now() > 24 * 3_600_000) warn('مهلت امضا بیش از ۲۴ ساعت است؛ ۱۵ تا ۶۰ دقیقه معمول است');
      check(doc.open_clauses.length === 0, 'بند بازی ندارد (نهایی و امضاپذیر)', 'قرارداد بند باز دارد؛ پیش‌نویس است و ابزار ساختن باید قرارداد نهایی بدهد');
      check(doc.version === 1 && doc.prev_version_id === null, 'نسخهٔ ۱ با prev_version_id=null', 'قرارداد تازه باید version:1 و prev_version_id:null باشد');
      check(!doc.delegation_id, 'delegation_id ندارد (قرارداد با حضور کاربر)', 'ابزار ساختن نباید delegation_id بگذارد؛ آن فقط برای POST /api/app-actions/delegated است');
      if (!doc.conditions.some((c) => c.type === 'wallet.sufficient') && doc.effects.some((e) => e.type === 'wallet.pay')) warn('شرط wallet.sufficient برای قرارداد پولی توصیه می‌شود');
      const money = doc.effects.filter((e) => e.type === 'wallet.pay');
      if (money.length) { const amtClause = doc.clauses.find((c) => c.kind === 'amount'); if (!amtClause) warn('قرارداد پولی است اما بندی با kind:"amount" ندارد؛ کاربر مبلغ را در بندها هم باید ببیند'); else if (typeof amtClause.value === 'number' && amtClause.value !== contractAmount(doc)) warn(`مبلغ بند amount (${amtClause.value}) با مجموع اثرها (${contractAmount(doc)}) فرق دارد`); }
      if (doc.appearance && manifest?.appearance?.color && doc.appearance.color !== manifest.appearance.color) warn('appearance.color قرارداد با مانیفست فرق دارد');
      // hash + signature
      const h = contractHash(doc);
      check(h === built.canonical_hash, 'هش بازمحاسبه‌شده با canonical_hash یکی است', `هش بازمحاسبه‌شده (${h.slice(0, 12)}…) با canonical_hash (${String(built.canonical_hash).slice(0, 12)}…) فرق دارد — JSON متعارف را با lib/vista-sign.mjs بسازید`);
      if (manifest?.public_key) check(verify(manifest.public_key, h, built.app_signature), 'امضای اپ با کلید مانیفست تأیید شد', 'امضای اپ با کلید عمومی مانیفست تأیید نشد (پیام امضا باید خودِ رشتهٔ hex هش باشد)');
      const rung = requiredRung(doc);
      const amt = contractAmount(doc);
      if (rung >= 3) bad(`پلهٔ لازم ${rung} است (مبلغ ${amt.toLocaleString('en')} تومان یا min_rung)؛ پلهٔ ۳ در این نسخه در دسترس نیست و قرارداد امضا نمی‌شود`);
      else ok(`پلهٔ امضای لازم: ${rung} (مبلغ ${amt.toLocaleString('en')} تومان)`);
    }

    // 5. fulfil: forged platform signature must be rejected
    if (T.fulfil && names.has(T.fulfil) && !errs.length) {
      section('ابزار تحویل');
      const forged = Buffer.from('x'.repeat(64)).toString('base64');
      try {
        const r = await request('tools/call', { name: T.fulfil, arguments: { contract: doc, platform_signature: forged } });
        const text = r.content?.filter((c) => c.type === 'text').map((c) => c.text).join('') ?? '';
        let parsed = r.structuredContent ?? null; if (!parsed) { try { parsed = JSON.parse(text); } catch { parsed = null; } }
        const delivered = Array.isArray(parsed?.events) && parsed.events.some((e) => e.type === 'delivered');
        check(r.isError || (!delivered && Array.isArray(parsed?.events)), 'ابزار تحویل امضای جعلی سکو را رد کرد', 'ابزار تحویل با امضای جعلی سکو تحویل داد! باید executed|<hash> را با کلید عمومی سکو راستی‌آزمایی کند');
      } catch (e) { ok(`ابزار تحویل امضای جعلی را رد کرد (${short(e.message, 80)})`); }
      if (PLATFORM_PRIV) {
        const pub = publicKeyOf(PLATFORM_PRIV);
        if (PLATFORM_KEY && pub !== PLATFORM_KEY) warn('کلید خصوصی سکو با --platform-key نمی‌خواند');
        const sig = signMessage(PLATFORM_PRIV, `executed|${contractHash(doc)}`);
        if (!verifyPlatformExecuted(pub, contractHash(doc), sig)) bad('امضای آزمایشی سکو خودش تأیید نشد (خطای داخلی)');
        try {
          const r = await request('tools/call', { name: T.fulfil, arguments: { contract: doc, platform_signature: sig } });
          const text = r.content?.filter((c) => c.type === 'text').map((c) => c.text).join('') ?? '';
          let parsed = r.structuredContent ?? null; if (!parsed) { try { parsed = JSON.parse(text); } catch { parsed = null; } }
          check(!r.isError && Array.isArray(parsed?.events), `ابزار تحویل با امضای معتبر {events:[…]} برگرداند: ${short(parsed?.events, 120)}`, `ابزار تحویل با امضای معتبر پاسخ درست نداد: ${short(text, 120)}`);
          for (const ev of parsed?.events ?? []) if (!['delivered', 'cancelled', 'refunded', 'failed', 'note'].includes(ev.type)) warn(`نوع رویداد ${ev.type} برای اپ مجاز نیست (delivered | cancelled | refunded | failed | note)`);
        } catch (e) { bad(`ابزار تحویل با امضای معتبر خطا داد: ${e.message}`); }
      } else warn('برای آزمون مثبت تحویل، --platform-private-key <pem> بدهید (کلید آزمایشی خودتان)');
    }
  }
  finish();
}
function finish() {
  console.log(`\n${passes} ✓ · ${warns} ⚠ · ${fails} ✗`);
  console.log(fails ? 'نتیجه: اپ هنوز منطبق نیست.' : 'نتیجه: اپ با پروتکل ویستا منطبق است.');
  process.exit(fails ? 1 : 0);
}
main().catch((e) => { console.error('✗ خطای غیرمنتظره:', e?.stack ?? e); process.exit(1); });
