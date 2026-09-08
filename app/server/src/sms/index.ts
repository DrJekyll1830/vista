import { config } from '../config.js';

export interface SmsResult { ok: boolean; provider: string; detail?: string }

/**
 * پنل پیامکی. تنها کاری که می‌کند خبر دادن است؛ هیچ پیامکی مرجع اختیار نیست.
 * Providers: console (dev), kavenegar, smsir, http (generic template).
 */
export async function sendSms(phone: string, message: string): Promise<SmsResult> {
  const p = config.sms.provider;
  try {
    switch (p) {
      case 'kavenegar': return await sendKavenegar(phone, message);
      case 'smsir': return await sendSmsIr(phone, message);
      case 'http': return await sendHttp(phone, message);
      default:
        console.log(`[sms:console] → ${phone}: ${message}`);
        return { ok: true, provider: 'console' };
    }
  } catch (e: any) {
    console.error('[sms] failed', e?.message ?? e);
    return { ok: false, provider: p, detail: String(e?.message ?? e) };
  }
}

/** Send an OTP. Some panels use a "verify/lookup" template with a token; others send plain text. */
export async function sendOtp(phone: string, code: string, purpose: 'login' | 'sign', context?: string): Promise<SmsResult> {
  const text = purpose === 'login'
    ? `ویستا\nکد ورود شما: ${code}\nاین کد ۵ دقیقه معتبر است.`
    : `ویستا\nکد امضای قرارداد${context ? ` «${context}»` : ''}: ${code}\nاگر شما این قرارداد را نمی‌شناسید، آن را رد کنید.`;
  if (config.sms.provider === 'kavenegar' && config.sms.kavenegar.template) return kavenegarLookup(phone, code, purpose);
  if (config.sms.provider === 'smsir' && config.sms.smsir.templateId) return smsIrVerify(phone, code);
  return sendSms(phone, text);
}

async function sendKavenegar(phone: string, message: string): Promise<SmsResult> {
  const { apiKey, sender } = config.sms.kavenegar;
  if (!apiKey) throw new Error('KAVENEGAR_API_KEY missing');
  const url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`;
  const body = new URLSearchParams({ receptor: phone, message, ...(sender ? { sender } : {}) });
  const res = await fetch(url, { method: 'POST', body });
  const j: any = await res.json().catch(() => ({}));
  return { ok: res.ok && j?.return?.status === 200, provider: 'kavenegar', detail: j?.return?.message };
}
async function kavenegarLookup(phone: string, code: string, purpose: string): Promise<SmsResult> {
  const { apiKey, template } = config.sms.kavenegar;
  const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`;
  const body = new URLSearchParams({ receptor: phone, token: code, template, type: 'sms', token2: purpose });
  const res = await fetch(url, { method: 'POST', body });
  const j: any = await res.json().catch(() => ({}));
  return { ok: res.ok && j?.return?.status === 200, provider: 'kavenegar', detail: j?.return?.message };
}
async function sendSmsIr(phone: string, message: string): Promise<SmsResult> {
  const { apiKey, lineNumber } = config.sms.smsir;
  if (!apiKey) throw new Error('SMSIR_API_KEY missing');
  const res = await fetch('https://api.sms.ir/v1/send/bulk', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ lineNumber, messageText: message, mobiles: [phone] }),
  });
  const j: any = await res.json().catch(() => ({}));
  return { ok: res.ok && j?.status === 1, provider: 'smsir', detail: j?.message };
}
async function smsIrVerify(phone: string, code: string): Promise<SmsResult> {
  const { apiKey, templateId } = config.sms.smsir;
  const res = await fetch('https://api.sms.ir/v1/send/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ mobile: phone, templateId: Number(templateId), parameters: [{ name: 'CODE', value: code }] }),
  });
  const j: any = await res.json().catch(() => ({}));
  return { ok: res.ok && j?.status === 1, provider: 'smsir', detail: j?.message };
}
async function sendHttp(phone: string, message: string): Promise<SmsResult> {
  const { url, method, headers, body } = config.sms.http;
  if (!url) throw new Error('SMS_HTTP_URL missing');
  const fill = (s: string) => s.replace(/\{phone\}/g, phone).replace(/\{message\}/g, message.replace(/"/g, '\\"').replace(/\n/g, '\\n'));
  const res = await fetch(fill(url), { method, headers: JSON.parse(headers), body: method === 'GET' ? undefined : fill(body) });
  return { ok: res.ok, provider: 'http', detail: `HTTP ${res.status}` };
}
