import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post, setToken, fa } from '../api';
import { useAuth } from '../auth';
import { Field, Spinner } from '../ui';

export default function Login() {
  const nav = useNavigate(); const { refresh } = useAuth();
  const [phone, setPhone] = useState(''); const [otp, setOtp] = useState<any>(null); const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  async function send() { setBusy(true); setErr(''); try { setOtp(await post('/auth/otp', { phone })); } catch (e: any) { setErr(e.message); } finally { setBusy(false); } }
  async function verify() {
    setBusy(true); setErr('');
    try { const r = await post('/auth/verify', { otp_id: otp.otp_id, phone: otp.phone, code }); setToken(r.token); await refresh(); nav(r.user.onboarded ? '/' : '/onboarding', { replace: true }); }
    catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <div className="center"><div className="auth">
      <div className="logo">و</div>
      <h1 style={{ fontSize: 22 }}>ویستا</h1>
      <p className="hint" style={{ marginBottom: 16 }}>سوپر اپلیکیشنی که با آن حرف می‌زنید. هر کاری که اثر دارد، قرارداد دارد؛ و شما آخرین امضاکننده‌اید.</p>
      {!otp ? (<>
        <Field label="شمارهٔ موبایل" hint="هویت شما ریشه در شمارهٔ موبایل دارد؛ رمز یک‌بارمصرف به همین شماره می‌آید."><input inputMode="tel" dir="ltr" placeholder="09xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} autoFocus /></Field>
        {err && <div className="err" style={{ marginBottom: 10 }}>{err}</div>}
        <button className="btn primary block" disabled={busy || phone.length < 10} onClick={send}>{busy ? <Spinner /> : 'دریافت کد'}</button>
      </>) : (<>
        <p className="hint">کد به شمارهٔ <b dir="ltr">{fa(otp.phone)}</b> فرستاده شد{otp.sent ? '' : ' (ارسال پیامک ناموفق بود؛ پنل پیامکی را بررسی کنید)'}.</p>
        {otp.dev_code && <div className="warn-box" style={{ margin: '10px 0' }}>حالت آزمایشی (پنل پیامکی وصل نیست): کد {fa(otp.dev_code)}</div>}
        {otp.accept_any && <div className="warn-box" style={{ margin: '10px 0' }}>حالت آزمایشی: هر کدی پذیرفته می‌شود</div>}
        <Field label="کد تأیید"><input className="otp" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && verify()} autoFocus /></Field>
        {err && <div className="err" style={{ marginBottom: 10 }}>{err}</div>}
        <button className="btn primary block" disabled={busy || code.length < 4} onClick={verify}>{busy ? <Spinner /> : 'ورود'}</button>
        <button className="btn ghost block" style={{ marginTop: 8 }} onClick={() => { setOtp(null); setCode(''); }}>تغییر شماره</button>
      </>)}
    </div></div>
  );
}
