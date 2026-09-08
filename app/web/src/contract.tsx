import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post, STATUS, fa } from './api';
import { Sheet, toast, Spinner } from './ui';

export interface Projection {
  id: string; version: number; type: string; title: string; status: string;
  app: { id: string; name: string; color: string; logo: string; verified: boolean };
  clauses: { key: string; label: string; value: any; kind: string }[]; open_clauses: any[];
  amount: number; amount_label: string | null; money_kind: string | null; fees: { label: string; amount: string }[];
  parties: { id: string; label: string; role: string; must_sign: boolean; signed: boolean; is_me: boolean }[];
  required_rung: number; settlement: string; expires_at: string; expires_label: string; created_label: string; hash: string; hash_short: string;
  delegation_id: string | null; origin: string;
  events: { id: string; type: string; label: string; text: string; actor: string; at: string; at_label: string }[];
  signatures: { party_id: string; kind: string; rung: number; at: string }[];
}
const RUNG_LABEL: Record<number, string> = { 1: 'پلهٔ ۱ · درخواست احرازشده', 2: 'پلهٔ ۲ · رمز یک‌بارمصرف', 3: 'پلهٔ ۳ · کلید گوشی', 4: 'پلهٔ ۴ · کلید سیم‌کارت' };

export function ContractCard({ c, onChange, inChat, showEvents = true, allowAsk = true }: { c: Projection; onChange?: (c: Projection) => void; inChat?: boolean; showEvents?: boolean; allowAsk?: boolean }) {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<null | 'confirm' | 'otp' | 'reject'>(null);
  const [otp, setOtp] = useState<{ otp_id: string; dev_code?: string; accept_any?: boolean } | null>(null);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const st = STATUS[c.status] ?? { label: c.status, cls: '' };
  const me = c.parties.find((p) => p.is_me);
  const canSign = c.status === 'awaiting' && me?.must_sign && !me.signed;
  const done = ['settled', 'signed', 'executing'].includes(c.status);
  const bad = ['rejected', 'expired', 'cancelled', 'failed', 'disputed'].includes(c.status);

  async function startSign() {
    setErr('');
    if (c.required_rung >= 3) { setErr(`این قرارداد به امضای ${RUNG_LABEL[c.required_rung] ?? 'پلهٔ بالاتر'} نیاز دارد که در این نسخه در دسترس نیست.`); return; }
    if (c.required_rung === 2) {
      setBusy(true);
      try { const r = await post(`/contracts/${c.id}/otp`); setOtp(r); setStep('otp'); } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
    } else setStep('confirm');
  }
  async function sign(rung: 1 | 2) {
    setBusy(true); setErr('');
    try {
      const r = await post(`/contracts/${c.id}/sign`, { rung, otp_id: otp?.otp_id, code: rung === 2 ? code : undefined, viewed: c });
      setStep(null); setCode('');
      if (r.payment?.gateway_url) { toast('قرارداد امضا شد؛ انتقال به درگاه…'); window.location.href = r.payment.gateway_url; return; }
      toast(r.contract.status === 'awaiting' ? 'امضای شما ثبت شد؛ منتظر امضای طرف دیگر' : 'امضا شد');
      onChange?.(r.contract);
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  async function reject() {
    setBusy(true);
    try { const r = await post(`/contracts/${c.id}/reject`, { reason: 'user' }); setStep(null); onChange?.(r.contract); toast('قرارداد رد شد'); } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  const ask = () => nav(`/chat/assistant?forward=${c.id}`);

  return (
    <div className={`ctr ${done ? 'done' : ''} ${bad ? 'bad' : ''} ${inChat ? 'me-side' : ''}`} style={{ ['--tone' as any]: c.app.color }}>
      <div className="ch"><span className="av sm" style={{ background: c.app.color }}>{c.app.logo}</span><span className="an">{c.app.name}{c.app.verified && <i className="tick">✓</i>}</span><span className="ac">#{c.hash_short}</span></div>
      <div className="ct">{c.title}</div>
      <div className="ab">
        {c.clauses.filter((x) => x.key !== 'amount' || !c.amount_label).map((x) => (
          <div key={x.key} className={`ar ${x.kind === 'note' ? 'note' : ''}`}><span>{x.label}</span><b className={x.kind === 'amount' ? 'num' : ''}>{x.value == null ? '—' : String(x.value)}</b></div>
        ))}
      </div>
      {c.amount_label && (
        <div className={`amount ${c.money_kind === 'delegation.grant' ? 'seal' : ''}`}><span>{c.money_kind === 'delegation.grant' ? 'سقف وکالت' : c.money_kind === 'wallet.topup' ? 'مبلغ شارژ' : 'مبلغ'}</span><b className="num">{c.amount_label}</b></div>
      )}
      {c.fees.length > 0 && <div className="ab">{c.fees.map((f, i) => <div key={i} className="ar"><span>{f.label}</span><b>{f.amount}</b></div>)}</div>}
      <div className="af">
        <div className="sg">{c.parties.map((p) => <em key={p.id} className={p.signed ? 'ok' : ''}>{p.signed ? '✓ ' : p.must_sign ? '○ ' : '· '}{p.is_me ? 'شما' : p.label}{!p.must_sign && p.is_me ? ' (غایب — زیر وکالت)' : ''}</em>)}</div>
        <div className="meta"><span className={`status ${st.cls}`}>{st.label}</span><span className="rung">{RUNG_LABEL[c.required_rung] ?? `پلهٔ ${fa(c.required_rung)}`}</span>{c.status === 'awaiting' && <span>مهلت تا {c.expires_label}</span>}{c.delegation_id && <span>اجرا زیر وکالت</span>}</div>
        {err && <div className="err">{err}</div>}
        {canSign && (
          <div className="btns">
            <button className="btn primary" disabled={busy} onClick={startSign}>{busy ? <Spinner /> : c.money_kind === 'wallet.topup' ? 'امضا و رفتن به درگاه' : c.type === 'start' ? 'استارت و اعطای مجوزها' : c.type === 'genesis' ? 'امضای قرارداد آغاز' : 'امضا'}</button>
            <button className="btn" disabled={busy} onClick={() => setStep('reject')}>رد</button>
            {allowAsk && c.type !== 'genesis' && <button className="btn ghost" onClick={ask}>↱ پرسیدن از دستیار</button>}
          </div>
        )}
        {!canSign && !inChat && allowAsk && <div className="btns"><button className="btn sm ghost" onClick={ask}>↱ پرسیدن از دستیار</button></div>}
      </div>
      {showEvents && c.events.length > 0 && <div className="evs">{c.events.map((e) => <div key={e.id}>↳ {e.text ? `${e.label} — ${e.text}` : e.label}<small>{e.at_label}</small></div>)}</div>}

      <Sheet open={step === 'confirm'} onClose={() => setStep(null)} title="امضای قرارداد">
        <p className="hint" style={{ marginBottom: 12 }}>با امضا، شرایط بالا با هش <span className="mono">{c.hash_short}</span> به هویت احرازشدهٔ شما گره می‌خورد و در «قراردادهای من» ثبت می‌شود. {c.amount_label && c.money_kind === 'wallet.pay' ? `${c.amount_label} از کیف پول شما ${c.settlement === 'immediate' ? 'کسر' : 'مسدود و پس از تحویل کسر'} می‌شود.` : ''}</p>
        <div className="btns" style={{ display: 'flex', gap: 8 }}><button className="btn primary block" disabled={busy} onClick={() => sign(1)}>{busy ? <Spinner /> : 'تأیید و امضا'}</button><button className="btn" onClick={() => setStep(null)}>انصراف</button></div>
      </Sheet>
      <Sheet open={step === 'otp'} onClose={() => setStep(null)} title="امضای پلهٔ ۲ — رمز یک‌بارمصرف">
        <p className="hint">این قرارداد امضای سنگین‌تری می‌خواهد. رمزی به سیم‌کارت شما فرستاده شد که به هش همین قرارداد گره خورده است.</p>
        {otp?.dev_code && <div className="warn-box" style={{ margin: '10px 0' }}>حالت آزمایشی: کد {fa(otp.dev_code)}</div>}
        {otp?.accept_any && <div className="warn-box" style={{ margin: '10px 0' }}>حالت آزمایشی: هر کدی پذیرفته می‌شود</div>}
        <input className="otp" inputMode="numeric" autoFocus value={code} onChange={(e) => setCode(e.target.value)} placeholder="•••••" />
        {err && <div className="err" style={{ marginTop: 8 }}>{err}</div>}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}><button className="btn primary block" disabled={busy || code.length < 4} onClick={() => sign(2)}>{busy ? <Spinner /> : 'امضا'}</button><button className="btn" onClick={() => setStep(null)}>انصراف</button></div>
      </Sheet>
      <Sheet open={step === 'reject'} onClose={() => setStep(null)} title="رد قرارداد">
        <p className="hint" style={{ marginBottom: 12 }}>قرارداد رد می‌شود و هیچ اثری اجرا نمی‌شود. اپ می‌تواند نسخهٔ تازه‌ای بیاورد.</p>
        <div style={{ display: 'flex', gap: 8 }}><button className="btn danger block" disabled={busy} onClick={reject}>رد قرارداد</button><button className="btn" onClick={() => setStep(null)}>انصراف</button></div>
      </Sheet>
    </div>
  );
}
