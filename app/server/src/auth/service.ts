import { config } from '../config.js';
import { q, json } from '../db.js';
import { id, now, plusMinutes, plusDays } from '../util/ids.js';
import { hmacHex, otpCode, safeEqual } from '../util/crypto.js';
import { sendOtp } from '../sms/index.js';
import { isValidNationalId } from '../util/national-id.js';
import { parseJalali, ageFromIso } from '../util/jalali.js';
import { toEnDigits } from '../util/persian.js';
import { ledgerAppend } from '../ledger.js';

export interface User {
  id: string; phone: string; national_id: string | null; birth_date_jalali: string | null; birth_date_iso: string | null;
  first_name: string | null; last_name: string | null; shahkar_matched: number; kyc_level: number; onboarded_at: string | null;
  default_page: string; theme: string; ai_base_url: string | null; ai_api_key: string | null; ai_model: string | null; created_at: string;
}
export class AuthError extends Error { constructor(public code: string, message: string, public status = 400) { super(message); } }

const hashCode = (phone: string, code: string) => hmacHex(config.platformSecret, `otp|${phone}|${code}`);

/** Step 1 — request an OTP for login (or contract signing at rung 2). */
export async function requestOtp(phone: string, purpose: 'login' | 'sign', ref?: string, context?: string) {
  // throttle: max 5 active codes per phone in 10 minutes
  const recent = await q.get<{ c: number }>('SELECT COUNT(*) c FROM otps WHERE phone=? AND created_at > ?', phone, new Date(Date.now() - 600_000).toISOString());
  if ((recent?.c ?? 0) >= 5) throw new AuthError('otp_throttled', 'تعداد درخواست‌ها زیاد است؛ چند دقیقه بعد دوباره تلاش کنید.', 429);
  const code = otpCode(5);
  const otpId = id('otp');
  await q.run('INSERT INTO otps (id, phone, code_hash, purpose, ref, expires_at, created_at) VALUES (?,?,?,?,?,?,?)', otpId, phone, hashCode(phone, code), purpose, ref ?? null, plusMinutes(5), now());
  const sms = await sendOtp(phone, code, purpose, context);
  return { otpId, sms, devCode: config.sms.provider === 'console' && config.sms.devShowOtp ? code : undefined };
}

/** Verify an OTP. Returns the consumed otp row id. */
export async function verifyOtp(otpId: string, phone: string, code: string, purpose: 'login' | 'sign', ref?: string): Promise<string> {
  const row = await q.get<any>('SELECT * FROM otps WHERE id=? AND phone=? AND purpose=?', otpId, phone, purpose);
  if (!row) throw new AuthError('otp_not_found', 'کد یافت نشد؛ دوباره درخواست کنید.');
  if (row.consumed_at) throw new AuthError('otp_used', 'این کد قبلاً استفاده شده است.');
  if (row.expires_at < now()) throw new AuthError('otp_expired', 'کد منقضی شده است؛ دوباره درخواست کنید.');
  if (row.attempts >= 5) throw new AuthError('otp_attempts', 'تلاش‌های ناموفق زیاد است؛ کد تازه بگیرید.');
  if (ref && row.ref !== ref) throw new AuthError('otp_ref', 'این کد برای قرارداد دیگری است.');
  const ok = config.sms.otpAcceptAny || safeEqual(hashCode(phone, toEnDigits(code).trim()), row.code_hash);
  if (!ok) {
    await q.run('UPDATE otps SET attempts = attempts + 1 WHERE id=?', otpId);
    throw new AuthError('otp_wrong', 'کد نادرست است.');
  }
  await q.run('UPDATE otps SET consumed_at=? WHERE id=?', now(), otpId);
  return otpId;
}

export async function getOrCreateUser(phone: string): Promise<User> {
  let u = await q.get<User>('SELECT * FROM users WHERE phone=?', phone);
  if (!u) {
    const uid = id('usr');
    await q.run('INSERT INTO users (id, phone, created_at) VALUES (?,?,?)', uid, phone, now());
    await q.run('INSERT INTO wallets (user_id, balance, held, updated_at) VALUES (?,0,?)', uid, now());
    u = (await q.get<User>('SELECT * FROM users WHERE id=?', uid))!;
    await ledgerAppend('user.created', { userId: uid, phone }, { userId: uid, refType: 'user', refId: uid });
  }
  return u;
}
export async function createSession(userId: string, device: string) {
  const token = id('ses', 32);
  await q.run('INSERT INTO sessions (token, user_id, device, created_at, last_seen_at, expires_at) VALUES (?,?,?,?,?,?)', token, userId, device, now(), now(), plusDays(30));
  return token;
}
export async function sessionUser(token: string | undefined): Promise<{ user: User; token: string } | null> {
  if (!token) return null;
  const s = await q.get<any>('SELECT * FROM sessions WHERE token=? AND expires_at > ?', token, now());
  if (!s) return null;
  await q.run('UPDATE sessions SET last_seen_at=? WHERE token=?', now(), token);
  const user = await q.get<User>('SELECT * FROM users WHERE id=?', s.user_id);
  return user ? { user, token } : null;
}
export async function logout(token: string) { await q.run('DELETE FROM sessions WHERE token=?', token); }

/** Step 2 — national id + Jalali birthdate; Shahkar match is mocked (assumed to match). */
export async function submitIdentity(user: User, nationalId: string, birthJalali: string) {
  const nid = toEnDigits(nationalId).trim();
  if (!isValidNationalId(nid)) throw new AuthError('national_id_invalid', 'کد ملی معتبر نیست.');
  const bd = parseJalali(birthJalali);
  if (!bd) throw new AuthError('birth_date_invalid', 'تاریخ تولد معتبر نیست (نمونه: ۱۳۷۵/۰۶/۱۵).');
  const age = ageFromIso(bd.iso);
  if (age < 18 || age > 120) throw new AuthError('age', 'برای استفاده از ویستا باید دست‌کم ۱۸ سال داشته باشید.');
  // شاهکار — provider mock: assumed to match. Real provider plugs in here.
  const matched = config.kyc.shahkar === 'mock' ? true : shahkarUnavailable();
  await q.run('UPDATE users SET national_id=?, birth_date_jalali=?, birth_date_iso=?, shahkar_matched=?, kyc_level=GREATEST(kyc_level,1) WHERE id=?', nid, birthJalali, bd.iso, matched ? 1 : 0, user.id);
  await ledgerAppend('kyc.identity', { userId: user.id, nationalIdMasked: nid.slice(0, 3) + '****' + nid.slice(-3), shahkar: config.kyc.shahkar, matched }, { userId: user.id, refType: 'user', refId: user.id });
  return { matched, provider: config.kyc.shahkar };
}
function shahkarUnavailable(): never { throw new AuthError('shahkar_unavailable', 'سرویس شاهکار در دسترس نیست.', 503); }

/** Step 3 — name. The lookup-by-phone service is "down", so we ask the user. */
export function nameLookup(_phone: string): { available: false; reason: string } | { available: true; first: string; last: string } {
  if (config.kyc.nameLookup === 'down') return { available: false, reason: 'سرویس استعلام نام از روی شمارهٔ موبایل در دسترس نیست؛ لطفاً نام خود را وارد کنید.' };
  return { available: false, reason: 'سرویس استعلام پیکربندی نشده است.' };
}
export async function submitName(user: User, first: string, last: string) {
  first = first.trim(); last = last.trim();
  if (first.length < 2 || last.length < 2) throw new AuthError('name_invalid', 'نام و نام خانوادگی را کامل وارد کنید.');
  await q.run('UPDATE users SET first_name=?, last_name=?, kyc_level=GREATEST(kyc_level,2) WHERE id=?', first, last, user.id);
  await ledgerAppend('kyc.name', { userId: user.id, source: 'user-entered', reason: 'lookup-unavailable' }, { userId: user.id, refType: 'user', refId: user.id });
}
export async function markOnboarded(userId: string) { await q.run('UPDATE users SET onboarded_at=?, kyc_level=GREATEST(kyc_level,3) WHERE id=?', now(), userId); }

export function publicUser(u: User) {
  return {
    id: u.id, phone: u.phone, first_name: u.first_name, last_name: u.last_name,
    national_id_masked: u.national_id ? u.national_id.slice(0, 3) + '****' + u.national_id.slice(-3) : null,
    birth_date_jalali: u.birth_date_jalali, shahkar_matched: !!u.shahkar_matched, kyc_level: u.kyc_level,
    onboarded: !!u.onboarded_at, default_page: u.default_page, theme: u.theme,
    byok: { base_url: u.ai_base_url, model: u.ai_model, has_key: !!u.ai_api_key },
    created_at: u.created_at,
  };
}
export { json };
