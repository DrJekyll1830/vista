import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { get, post, fa, STATUS } from '../api';
import { Avatar, Top, toast, Sheet, Spinner, Tick } from '../ui';
import { ContractCard, type Projection } from '../contract';

export function Contracts() {
  const nav = useNavigate(); const [d, setD] = useState<any>(null); const [f, setF] = useState<'all' | 'awaiting' | 'done' | 'perm'>('all');
  useEffect(() => { get('/contracts').then(setD).catch((e) => toast(e.message)); }, []);
  const list = (d?.contracts ?? []).filter((c: any) => f === 'all' ? true : f === 'awaiting' ? c.status === 'awaiting' : f === 'done' ? ['settled', 'executing'].includes(c.status) : ['start', 'permission.grant', 'genesis'].includes(c.type) || c.type.includes('delegation') || c.type.includes('auto-renew'));
  return (
    <>
      <Top onBack={() => nav('/apps')} avatar={<Avatar color="#C13B2F" logo="ق" />} title="قراردادهای من" sub="هر قراردادی که امضا کرده‌اید — با چه کسی، کِی، با چه امضایی، و بعدش چه شد" right={<button className="act" onClick={() => nav('/delegations')}>وکالت‌ها{d?.delegations?.filter((x: any) => x.status === 'active').length ? ` (${fa(d.delegations.filter((x: any) => x.status === 'active').length)})` : ''}</button>} />
      <div className="tabs">{([['all', 'همه'], ['awaiting', 'منتظر امضا'], ['done', 'اجراشده'], ['perm', 'مجوزها و وکالت‌ها']] as const).map(([k, l]) => <button key={k} className={f === k ? 'on' : ''} onClick={() => setF(k)}>{l}</button>)}</div>
      <div className="body">
        {!d && <div className="pad"><Spinner /></div>}
        {d && list.length === 0 && <div className="pad hint">چیزی نیست.</div>}
        {list.map((c: any) => (
          <button key={c.id} className="row" onClick={() => nav(`/contracts/${c.id}`)}>
            <Avatar color={c.app.color} logo={c.app.logo} size="sm" />
            <span className="tx"><span className="t1">{c.title}</span><span className="t2">{c.app.name}{c.delegated ? ' · زیر وکالت' : ''} · {c.created_label}</span></span>
            <span className="tail">{c.amount_label && <b className="num" style={{ color: 'var(--fg)' }}>{c.amount_label}</b>}<span className={`chip ${STATUS[c.status]?.cls ?? ''}`}>{STATUS[c.status]?.label ?? c.status}</span></span>
          </button>
        ))}
      </div>
    </>
  );
}
export function ContractDetail() {
  const { id = '' } = useParams(); const nav = useNavigate(); const [d, setD] = useState<any>(null); const [dispute, setDispute] = useState(false); const [txt, setTxt] = useState(''); const [share, setShare] = useState<any>(null); const [busy, setBusy] = useState(false); const [raw, setRaw] = useState(false);
  const load = async () => { try { setD(await get(`/contracts/${id}`)); } catch (e: any) { toast(e.message); } };
  useEffect(() => { void load(); }, [id]);
  if (!d) return <><Top onBack={() => nav(-1)} title="…" /><div className="pad"><Spinner /></div></>;
  const c: Projection = d.contract;
  async function sendDispute() { setBusy(true); try { await post(`/contracts/${id}/dispute`, { text: txt }); toast('اعتراض به همان قرارداد چسبید و به پشتیبانی رفت'); setDispute(false); await load(); } catch (e: any) { toast(e.message); } finally { setBusy(false); } }
  async function doShare() { try { const r = await post(`/contracts/${id}/share`); setShare(r); } catch (e: any) { toast(e.message); } }
  return (
    <>
      <Top onBack={() => nav(-1)} avatar={<Avatar color={c.app.color} logo={c.app.logo} />} title={<>{c.app.name}<Tick show={c.app.verified} /></>} sub={`قرارداد · نسخهٔ ${fa(c.version)} · ${c.created_label}`} right={<button className="act" onClick={() => nav(`/chat/${c.app.id}`)}>گفت‌وگو</button>} />
      <div className="body pad">
        <ContractCard c={c} onChange={(x) => setD({ ...d, contract: x })} />
        <div className="card" style={{ marginTop: 10 }}><h3>امضاها</h3>
          {d.signatures.map((s: any) => <div key={s.id} className="pc"><span>{s.party_kind === 'user' ? 'شما' : s.party_kind === 'platform' ? 'ویستا (از طرف اپ بی‌کلید)' : c.app.name}</span><small>پلهٔ {fa(s.rung)} · {s.party_kind === 'user' ? 'درخواست احرازشده' : 'کلید Ed25519'}{s.device ? ` · ${s.device.slice(0, 30)}…` : ''}</small></div>)}
          <div className="hint" style={{ marginTop: 8 }}>هش متعارف: <span className="mono">{c.hash}</span></div>
          <div className="hint">امضا به همین هش گره خورده است؛ هر تغییری در بندها نسخهٔ تازه می‌سازد و امضاها را باطل می‌کند.</div>
        </div>
        <div className="card"><div className="btns" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => nav(`/chat/assistant?forward=${c.id}`)}>↱ پرسیدن از دستیار</button>
          <button className="btn" onClick={doShare}>اشتراک‌گذاری با لینک</button>
          {['executing', 'settled', 'failed'].includes(c.status) && <button className="btn danger" onClick={() => setDispute(true)}>اعتراض</button>}
          <button className="btn ghost" onClick={() => setRaw(!raw)}>{raw ? 'پنهان کردن سند' : 'سند خام'}</button>
        </div>
          {share && <div className="ok-box" style={{ marginTop: 10 }}>لینک: <a href={share.url} dir="ltr">{share.url}</a><br /><small>می‌توانید با پیامک یا هر پیام‌رسانی بفرستید. گیرنده با شمارهٔ خودش وارد می‌شود.</small></div>}
          {raw && <pre className="mono" style={{ whiteSpace: 'pre-wrap', marginTop: 10, background: 'var(--surface-2)', padding: 10, borderRadius: 10, direction: 'ltr', textAlign: 'left' }}>{JSON.stringify(d.doc, null, 2)}</pre>}
        </div>
      </div>
      <Sheet open={dispute} onClose={() => setDispute(false)} title="اعتراض به این قرارداد"><p className="hint" style={{ marginBottom: 8 }}>اعتراض رویدادی است که به همین قرارداد می‌چسبد؛ پشتیبانی همه‌چیز را کنار هم می‌بیند: قرارداد، امضاها، آنچه دیدید، و رویدادها.</p><textarea rows={3} value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="چه چیزی درست پیش نرفت؟" /><button className="btn danger block" style={{ marginTop: 10 }} disabled={busy || txt.length < 3} onClick={sendDispute}>{busy ? <Spinner /> : 'ثبت اعتراض'}</button></Sheet>
    </>
  );
}
export function Delegations() {
  const nav = useNavigate(); const [list, setList] = useState<any[] | null>(null); const [confirm, setConfirm] = useState<any>(null);
  const load = async () => { try { setList((await get('/delegations')).delegations); } catch (e: any) { toast(e.message); } };
  useEffect(() => { void load(); }, []);
  async function revoke() { try { await post(`/delegations/${confirm.id}/revoke`); toast('وکالت لغو شد — یک‌طرفه و فوری'); setConfirm(null); await load(); } catch (e: any) { toast(e.message); } }
  const ST: Record<string, string> = { active: 'فعال', revoked: 'لغوشده', expired: 'منقضی', exhausted: 'تمام‌شده' };
  return (
    <>
      <Top onBack={() => nav('/contracts')} avatar={<Avatar color="#7A4FA3" logo="و" />} title="وکالت‌ها" sub="همهٔ وکالت‌ها در یک صفحه — با مبلغی که خرج شده و مبلغی که مانده" />
      <div className="body pad">
        <div className="warn-box" style={{ marginBottom: 10 }}>وکالت با غیاب شما تعریف می‌شود؛ پس امنیتش از خودِ قرارداد می‌آید: سقف و انقضای اجباری، امضای پلهٔ بالاتر برای اعطا، ممنوعیت واگذاری، لغو یک‌طرفه، همه در یک صفحه، و اطلاع بر هر مصرف.</div>
        {!list && <Spinner />}
        {list?.length === 0 && <div className="hint">هنوز وکالتی نداده‌اید. اپ‌های احرازشده می‌توانند از راه گفت‌وگو قرارداد وکالت بیاورند.</div>}
        {list?.map((g) => (
          <div key={g.id} className="card">
            <div className="between"><div><b>{g.label}</b><div className="hint">{g.app?.name} · محدوده: <span className="mono">{g.scope}</span></div></div><span className={`chip ${g.status === 'active' ? 'ok' : 'bad'}`}>{ST[g.status] ?? g.status}</span></div>
            <div className="kv" style={{ marginTop: 8 }}><span>سقف</span><b className="num">{g.cap_label}</b><span>خرج‌شده</span><b className="num">{g.spent_label}</b><span>باقی‌مانده</span><b className="num">{g.remaining_label}</b><span>انقضا</span><b>{g.expires_label}</b></div>
            <div className="bar" style={{ marginTop: 8 }}><i style={{ width: `${Math.min(100, Math.round((g.spent / g.cap) * 100))}%` }} /></div>
            {g.uses.length > 0 && <div className="hint" style={{ marginTop: 6 }}>{fa(g.uses.length)} بار مصرف شده · آخرین: {g.uses[0].contract_id && <a onClick={() => nav(`/contracts/${g.uses[0].contract_id}`)}>مشاهدهٔ قرارداد</a>}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}><button className="btn sm" onClick={() => nav(`/contracts/${g.contract_id}`)}>قرارداد وکالت</button>{g.status === 'active' && <button className="btn sm danger" onClick={() => setConfirm(g)}>لغو وکالت</button>}</div>
          </div>
        ))}
      </div>
      <Sheet open={!!confirm} onClose={() => setConfirm(null)} title="لغو وکالت"><p className="hint" style={{ marginBottom: 12 }}>لغو به موافقت اپ نیاز ندارد و همان لحظه اثر می‌کند.</p><div style={{ display: 'flex', gap: 8 }}><button className="btn danger block" onClick={revoke}>لغو وکالت</button><button className="btn" onClick={() => setConfirm(null)}>انصراف</button></div></Sheet>
    </>
  );
}
