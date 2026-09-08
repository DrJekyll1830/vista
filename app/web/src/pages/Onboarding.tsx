import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { get, post } from '../api';
import { useAuth } from '../auth';
import { Field, Spinner } from '../ui';
import { ContractCard, type Projection } from '../contract';

export default function Onboarding() {
  const nav = useNavigate(); const loc = useLocation(); const { me, refresh } = useAuth();
  const from = (loc.state as any)?.from as string | undefined;
  const u = me?.user;
  const initial = !u ? 0 : !u.national_id_masked ? 0 : !u.first_name ? 1 : 2;
  const [step, setStep] = useState(initial);
  const [nid, setNid] = useState(''); const [bd, setBd] = useState(''); const [first, setFirst] = useState(''); const [last, setLast] = useState('');
  const [lookup, setLookup] = useState<any>(null); const [genesis, setGenesis] = useState<Projection | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const [shahkar, setShahkar] = useState<any>(null);
  useEffect(() => { if (step === 1) get('/kyc/name-lookup').then(setLookup).catch(() => {}); if (step === 2) post('/onboarding/genesis').then((r) => setGenesis(r.contract)).catch((e) => setErr(e.message)); }, [step]);
  async function identity() { setBusy(true); setErr(''); try { setShahkar(await post('/kyc/identity', { national_id: nid, birth_date: bd })); await refresh(); setStep(1); } catch (e: any) { setErr(e.message); } finally { setBusy(false); } }
  async function name() { setBusy(true); setErr(''); try { await post('/kyc/name', { first_name: first, last_name: last }); await refresh(); setStep(2); } catch (e: any) { setErr(e.message); } finally { setBusy(false); } }
  return (
    <div className="center"><div className="auth" style={{ maxWidth: 460 }}>
      <div className="logo">و</div>
      <h1 style={{ fontSize: 20 }}>{['احراز هویت', 'نام شما', 'قرارداد آغاز'][step]}</h1>
      <div className="steps">{[0, 1, 2].map((i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
      {step === 0 && (<>
        <p className="hint" style={{ marginBottom: 12 }}>کد ملی و تاریخ تولد با شمارهٔ موبایل شما تطبیق داده می‌شود (سرویس شاهکار).</p>
        <Field label="کد ملی"><input inputMode="numeric" dir="ltr" value={nid} onChange={(e) => setNid(e.target.value)} placeholder="۰۰۱۲۳۴۵۶۷۸" /></Field>
        <Field label="تاریخ تولد (شمسی)" hint="نمونه: ۱۳۷۵/۰۶/۱۵"><input inputMode="numeric" dir="ltr" value={bd} onChange={(e) => setBd(e.target.value)} placeholder="۱۳۷۵/۰۶/۱۵" /></Field>
        {err && <div className="err" style={{ marginBottom: 10 }}>{err}</div>}
        <button className="btn primary block" disabled={busy || nid.length < 10 || bd.length < 8} onClick={identity}>{busy ? <Spinner /> : 'تطبیق و ادامه'}</button>
      </>)}
      {step === 1 && (<>
        {shahkar && <div className="ok-box" style={{ marginBottom: 10 }}>تطبیق کد ملی و شماره انجام شد ({shahkar.provider === 'mock' ? 'شبیه‌سازی شاهکار' : 'شاهکار'}).</div>}
        <div className="warn-box" style={{ marginBottom: 12 }}>{lookup?.reason ?? 'سرویس استعلام نام از روی شمارهٔ موبایل در دسترس نیست؛ لطفاً نام خود را وارد کنید.'}</div>
        <div className="grid2"><Field label="نام"><input value={first} onChange={(e) => setFirst(e.target.value)} autoFocus /></Field><Field label="نام خانوادگی"><input value={last} onChange={(e) => setLast(e.target.value)} /></Field></div>
        {err && <div className="err" style={{ marginBottom: 10 }}>{err}</div>}
        <button className="btn primary block" disabled={busy || first.length < 2 || last.length < 2} onClick={name}>{busy ? <Spinner /> : 'ادامه'}</button>
      </>)}
      {step === 2 && (<>
        <p className="hint" style={{ marginBottom: 12 }}>ویستا شش اپ سیستمی دارد که از اجازه گرفتن معاف‌اند، نه از قرارداد دادن. این‌جا می‌بینید چه چیزهایی از پیش نصب است و هر کدام چه می‌کنند — و همان را یک بار امضا می‌کنید.</p>
        {err && <div className="err" style={{ marginBottom: 10 }}>{err}</div>}
        {genesis ? <ContractCard c={genesis} allowAsk={false} showEvents={false} onChange={async (c) => { setGenesis(c); if (['settled', 'executing'].includes(c.status)) { await refresh(); nav(from ?? '/chat/assistant', { replace: true }); } }} /> : <Spinner />}
      </>)}
    </div></div>
  );
}
