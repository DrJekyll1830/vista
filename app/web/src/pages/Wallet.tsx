import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { get, post, fa, toman } from '../api';
import { useAuth } from '../auth';
import { Avatar, Top, toast, Sheet, Spinner } from '../ui';
import { ContractCard, type Projection } from '../contract';

const AMOUNTS = [100_000, 500_000, 1_000_000, 5_000_000];
export default function Wallet() {
  const nav = useNavigate(); const [sp, setSp] = useSearchParams(); const { refresh } = useAuth();
  const [d, setD] = useState<any>(null); const [open, setOpen] = useState(false); const [amount, setAmount] = useState(''); const [contract, setContract] = useState<Projection | null>(null); const [busy, setBusy] = useState(false);
  const load = async () => { try { setD(await get('/wallet')); await refresh(); } catch (e: any) { toast(e.message); } };
  useEffect(() => { void load(); const r = sp.get('result'); if (r) { toast(r === 'success' ? 'پرداخت موفق — کیف پول شارژ شد' : 'پرداخت ناموفق بود'); setSp({}); } }, []);
  async function topup() { setBusy(true); try { const n = Number(amount.replace(/[۰-۹]/g, (x) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(x))).replace(/[^0-9]/g, '')); const r = await post('/wallet/topup', { amount: n }); setContract(r.contract); } catch (e: any) { toast(e.message); } finally { setBusy(false); } }
  const KIND: Record<string, string> = { topup: 'شارژ', hold: 'مسدودی', capture: 'کسر', release: 'آزادسازی مسدودی', refund: 'بازگشت وجه', fee: 'کارمزد' };
  return (
    <>
      <Top onBack={() => nav('/apps')} avatar={<Avatar color="#B07C31" logo="م" />} title="مالی" sub={d?.custodian ?? 'کیف پول'} right={<button className="act" onClick={() => nav('/chat/wallet')}>گفت‌وگو</button>} />
      <div className="body pad">
        <div className="card" style={{ background: 'var(--surface)' }}>
          <div className="k">موجودی</div><div className="num" style={{ fontSize: 30, fontWeight: 800 }}>{d ? d.wallet.balance_label : '…'}</div>
          {d && d.wallet.held > 0 && <div className="hint">مسدودشده: {d.wallet.held_label} · در دسترس: {toman(d.wallet.available)}</div>}
          <div className="warn-box" style={{ margin: '10px 0' }}>در این نسخه کیف پول نزد ویستا نگهداری می‌شود. در نسخهٔ بعد همین صفحه به حساب شما نزد بانک سینا وصل می‌شود؛ از دید شما چیزی عوض نمی‌شود.</div>
          <button className="btn primary block" onClick={() => { setOpen(true); setContract(null); }}>شارژ کیف پول</button>
        </div>
        <div className="card"><h3>تراکنش‌ها</h3>
          {d?.transactions.length === 0 && <div className="hint">هنوز تراکنشی نیست.</div>}
          {d?.transactions.map((t: any) => <button key={t.id} className="pc" style={{ width: '100%', textAlign: 'start' }} onClick={() => t.contract_id && nav(`/contracts/${t.contract_id}`)}><div><div>{KIND[t.kind] ?? t.kind}{t.title ? ` · ${t.title}` : ''}</div><small>{t.at_label}</small></div><b className="num" style={{ color: ['topup', 'refund', 'release'].includes(t.kind) ? 'var(--green)' : t.kind === 'hold' ? 'var(--amber)' : 'var(--fg)' }}>{['topup', 'refund'].includes(t.kind) ? '+' : t.kind === 'capture' ? '−' : ''}{t.amount_label}</b></button>)}
        </div>
      </div>
      <Sheet open={open} onClose={() => setOpen(false)} title="شارژ کیف پول">
        {!contract ? (<>
          <p className="hint" style={{ marginBottom: 10 }}>شارژ هم یک قرارداد است: میان شما و «مالی». پس از امضا به درگاه پرداخت می‌روید (فعلاً آزمایشی؛ بعداً کارت هر بانکی).</p>
          <div className="grid2" style={{ marginBottom: 10 }}>{AMOUNTS.map((a) => <button key={a} className={`btn ${amount === String(a) ? 'primary' : ''}`} onClick={() => setAmount(String(a))}>{toman(a)}</button>)}</div>
          <input inputMode="numeric" dir="ltr" placeholder="مبلغ دلخواه (تومان)" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <button className="btn primary block" style={{ marginTop: 10 }} disabled={busy || !amount} onClick={topup}>{busy ? <Spinner /> : 'ساختن قرارداد شارژ'}</button>
        </>) : <ContractCard c={contract} allowAsk={false} onChange={(c) => { setContract(c); if (c.status !== 'awaiting') { setOpen(false); void load(); } }} />}
      </Sheet>
    </>
  );
}
