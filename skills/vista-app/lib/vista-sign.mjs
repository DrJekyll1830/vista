/**
 * vista-sign.mjs — امضا و هش قرارداد ویستا، بدون هیچ وابستگی (Node ≥ 18, ES module).
 *
 * این فایل باید بایت‌به‌بایت همان خروجی سکوی ویستا را بدهد:
 *   - canonicalJson: کلیدها به‌صورت بازگشتی مرتب، بدون فاصله، undefined حذف، آرایه‌ها با ترتیب خودشان،
 *     اسکالرها دقیقاً با JSON.stringify.
 *   - contractHash: sha256 (hex کوچک) روی canonicalJson قرارداد بدون فیلد `appearance`.
 *   - کلید عمومی: base64 از ۳۲ بایت خام Ed25519. کلید خصوصی: PEM با قالب PKCS8.
 *   - امضا: Ed25519 روی بایت‌های UTF-8 «رشتهٔ hex هش» (نه بایت‌های خام هش)، خروجی base64.
 *
 * استفاده:
 *   import { generateKeyPair, contractHash, signHash, verify } from './vista-sign.mjs';
 */
import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify as cryptoVerify, randomBytes } from 'node:crypto';

// ───────────────────────── canonical JSON ─────────────────────────
/** JSON متعارف — دقیقاً همان الگوریتم سکو. */
export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('non-finite number in canonical json');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return '[' + value.map((v) => canonicalJson(v === undefined ? null : v)).join(',') + ']';
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJson(value[k])).join(',') + '}';
}
export function sha256Hex(s) {
  return createHash('sha256').update(s).digest('hex');
}
/** بخشی از قرارداد که هش می‌شود: همه‌چیز جز `appearance` (ظاهر تعهد نیست). */
export function hashableView(doc) {
  const { appearance: _a, ...rest } = doc;
  return rest;
}
/** هش متعارف قرارداد — sha256 hex روی JSON متعارفِ نمای هش‌پذیر. */
export function contractHash(doc) {
  return sha256Hex(canonicalJson(hashableView(doc)));
}

// ───────────────────────── Ed25519 ─────────────────────────
const SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

/** تولید جفت‌کلید: { publicKey: base64 از ۳۲ بایت خام, privateKey: PEM (PKCS8) } */
export function generateKeyPair() {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  return { publicKey: rawPublicKeyBase64(publicKey), privateKey: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString() };
}
/** KeyObject عمومی → base64 از ۳۲ بایت خام (همان چیزی که در مانیفست می‌رود). */
export function rawPublicKeyBase64(keyObject) {
  const der = keyObject.export({ type: 'spki', format: 'der' });
  return Buffer.from(der.subarray(der.length - 32)).toString('base64');
}
/** base64 خام → KeyObject عمومی (با پیشوند SPKI DER). */
export function publicKeyFromRawBase64(b64) {
  const raw = Buffer.from(b64, 'base64');
  if (raw.length !== 32) throw new Error('invalid ed25519 public key');
  return createPublicKey({ key: Buffer.concat([SPKI_PREFIX, raw]), format: 'der', type: 'spki' });
}
/** کلید عمومی (base64 خام) متناظر با یک کلید خصوصی PEM — برای پر کردن `public_key` مانیفست. */
export function publicKeyOf(privateKeyPem) {
  return rawPublicKeyBase64(createPublicKey(createPrivateKey(privateKeyPem)));
}
/** امضای یک پیام متنی (UTF-8) → base64. */
export function signMessage(privateKeyPem, message) {
  return sign(null, Buffer.from(message, 'utf8'), createPrivateKey(privateKeyPem)).toString('base64');
}
/** امضای هش قرارداد: پیام همان رشتهٔ hex است. */
export function signHash(privateKeyPem, hashHex) {
  if (!/^[0-9a-f]{64}$/.test(hashHex)) throw new Error('hash must be 64 lowercase hex chars');
  return signMessage(privateKeyPem, hashHex);
}
/** راستی‌آزمایی امضا روی پیام متنی؛ هرگز استثنا نمی‌اندازد. */
export function verify(publicKeyB64, message, signatureB64) {
  try {
    return cryptoVerify(null, Buffer.from(message, 'utf8'), publicKeyFromRawBase64(publicKeyB64), Buffer.from(signatureB64, 'base64'));
  } catch {
    return false;
  }
}

// ───────────────────────── رویدادها ─────────────────────────
/** پاکت رویداد امضاشده — همان چیزی که سکو راستی‌آزمایی می‌کند (text خالی و payload تهی جایگزین می‌شوند). */
export function eventEnvelope({ contract_id, type, text, payload, ts }) {
  return canonicalJson({ contract_id, type, text: text ?? '', payload: payload ?? {}, ts });
}
/** امضای رویداد برای POST /api/app-events → base64. */
export function signEvent(privateKeyPem, ev) {
  return signMessage(privateKeyPem, eventEnvelope(ev));
}
/** بدنهٔ کامل و آمادهٔ ارسال به POST /api/app-events. */
export function buildEventBody(privateKeyPem, appId, { contract_id, type, text, payload }) {
  const ts = new Date().toISOString();
  const ev = { contract_id, type, text: text ?? '', payload: payload ?? {}, ts };
  return { app_id: appId, ...ev, signature: signEvent(privateKeyPem, ev) };
}

// ───────────────────────── امضاهای سکو ─────────────────────────
/** امضای سکو که با ابزار تحویل می‌آید: Ed25519 روی رشتهٔ `executed|<hash>`. */
export function verifyPlatformExecuted(platformPublicKeyB64, hashHex, signature) {
  return verify(platformPublicKeyB64, `executed|${hashHex}`, signature);
}
/**
 * توکن مینی‌اپ: `<base64url(json)>.<امضای سکو روی همان رشتهٔ base64url>`
 * بازگشت: payload ({ user_id, user_ref, exp }) یا null اگر نامعتبر/منقضی باشد.
 * توجه: user_id در توکن «خام» است (بدون پیشوند `user:`).
 */
export function verifyMiniAppToken(platformPublicKeyB64, token, now = Date.now()) {
  try {
    const [b64, sig] = String(token ?? '').split('.');
    if (!b64 || !sig) return null;
    if (!verify(platformPublicKeyB64, b64, sig)) return null;
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    if (typeof payload.exp !== 'number' || payload.exp <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

// ───────────────────────── کمکی‌ها ─────────────────────────
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
/** شناسهٔ تصادفی به سبک سکو: `<prefix>_<len chars>` از [0-9a-z]. */
export function newId(prefix = '', len = 16) {
  const bytes = randomBytes(len);
  let s = '';
  for (let i = 0; i < len; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return prefix ? `${prefix}_${s}` : s;
}
/** یکتای قرارداد (nonce) — دست‌کم ۸ نویسه؛ ۲۰ نویسه توصیه می‌شود. */
export const newNonce = () => newId('n', 20);
export const nowIso = () => new Date().toISOString();
export const plusMinutes = (m) => new Date(Date.now() + m * 60_000).toISOString();
export const plusDays = (d) => new Date(Date.now() + d * 86_400_000).toISOString();
/** user_ref شبه‌نام از شناسهٔ طرف کاربر (`user:<id>`) — همان قاعدهٔ سکو: `u_` + ده نویسهٔ آخر. */
export const userRefOf = (userPartyId) => `u_${String(userPartyId).replace(/^user:/, '').slice(-10)}`;

/** ساخت خروجی ابزار ساختن قرارداد: { contract, canonical_hash, app_signature } */
export function signContract(privateKeyPem, doc) {
  const canonical_hash = contractHash(doc);
  return { contract: doc, canonical_hash, app_signature: signHash(privateKeyPem, canonical_hash) };
}
