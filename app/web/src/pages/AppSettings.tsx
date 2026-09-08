import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { get, post, del, fa, STATUS } from '../api';
import { Avatar, Tick, Top, toast, Sheet, Spinner } from '../ui';
import { ContractCard, type Projection } from '../contract';

export default function AppSettings() {
  const { appId = '' } = useParams(); const nav = useNavigate(); const { reload } = useOutletContext<{ reload: () => Promise<void> }>();
  const [d, setD] = useState<any>(null); const [tab, setTab] = useState<'contracts' | 'perms' | 'caps' | 'mini'>('contracts');
  const [grant, setGrant] = useState<Projection | null>(null); const [cred, setCred] = useState(''); const [busy, setBusy] = useState(false); const [confirmRemove, setConfirmRemove] = useState(false);
  const load = async () => { try { setD(await get(`/apps/${appId}`)); } catch (e: any) { toast(e.message); } };
  useEffect(() => { void load(); }, [appId]);
  if (!d) return <><Top onBack={() => nav(-1)} title="…" /><div className="pad"><Spinner /></div></>;
  const a = d.app;
  const declared: any[] = a.permissions; const fin: any[] = a.financial_permissions;
  async function revoke(key: string) { try { await post(`/apps/${appId}/permissions/revoke`, { key }); toast('مجوز پس گرفته شد — یک‌طرفه و فوری'); await load(); } catch (e: any) { toast(e.message); } }
  async function grantPerm(key: string) { try { const r = await post(`/apps/${appId}/permissions/grant`, { permissions: [key] }); setGrant(r.contract); } catch (e: any) { toast(e.message); } }
  async function saveCred() { setBusy(true); try { const r = await post(`/apps/${appId}/credential`, { credential: cred }); toast(r.probe_error ? `توکن ذخیره شد؛ اتصال: ${r.probe_error}` : 'توکن ذخیره و اتصال برقرار شد'); setCred(''); await load(); } catch (e: any) { toast(e.message); } finally { setBusy(false); } }
  async function probe() { setBusy(true); try { const r = await post(`/apps/${appId}/probe`); toast(r.error ? `اتصال برقرار نشد: ${r.error}` : `اتصال برقرار است · ${fa(r.app.tools.exposed.length)} قابلیت`); await load(); await reload(); } catch (e: any) { toast(e.message); } finally { setBusy(false); } }
  async function remove() { try { await del(`/apps/${appId}`); toast('اپ حذف شد'); await reload(); nav('/apps'); } catch (e: any) { toast(e.message); } }
  async function simulate() { setBusy(true); try { await post(`/apps/${appId}/simulate-exhaust`); toast('اپ زیر وکالت شما بسته خرید؛ به گفت‌وگو نگاه کنید'); await load(); } catch (e: any) { toast(e.message); } finally { setBusy(false); } }
  return (
    <>
      <Top onBack={() => nav(`/chat/${appId}`)} avatar={<Avatar color={a.color} logo={a.logo} />} title={<>{a.name}<Tick show={a.verified} /></>} sub={a.company ?? a.url} right={<button className="act" onClick={() => nav(`/chat/${appId}`)}>گفت‌وگو</button>} />
      <div className="tabs">{([['contracts', 'قراردادها'], ['perms', 'مجوزها'], ['caps', 'قابلیت‌ها'], ...(a.mini_app_url ? [['mini', 'مینی‌اپ']] : [])] as [string, string][]).map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k as any)}>{l}</button>)}</div>
      <div className="body pad">
        <div className="card" style={{ marginBottom: 10 }}>
          <div className="between"><div><span className={`chip ${a.health === 'up' ? 'ok' : a.health === 'down' ? 'bad' : ''}`}>{a.health === 'up' ? 'در دسترس' : a.health === 'down' ? 'در دسترس نیست' : 'سلامت نامعلوم'}</span> <span className={`chip ${a.verified ? 'ok' : 'warn'}`}>{a.verified ? 'احرازشده' : 'احرازنشده — اختیار مالی نمی‌گیرد'}</span> {a.tags?.map((t: string) => <span key={t} className="chip">{t}</span>)}</div><button className="btn sm" disabled={busy} onClick={probe}>بررسی اتصال</button></div>
          <p className="hint" style={{ marginTop: 6 }}>{a.long_description || a.description}</p>
          {a.last_error && a.health === 'down' && <div className="err" style={{ marginTop: 6 }}>{a.last_error}</div>}
        </div>
        {tab === 'contracts' && (<>
          {d.delegations.length > 0 && <div className="card"><h3>وکالت‌ها</h3>{d.delegations.map((g: any) => <div key={g.id} className="pc"><span>{g.label}</span><small>{g.status === 'active' ? 'فعال' : g.status === 'revoked' ? 'لغوشده' : g.status}</small></div>)}<button className="btn sm" style={{ marginTop: 8 }} onClick={() => nav('/delegations')}>همهٔ وکالت‌ها</button>{appId === 'irancell-demo' && d.delegations.some((g: any) => g.status === 'active') && <button className="btn sm" style={{ marginTop: 8, marginInlineStart: 8 }} disabled={busy} onClick={simulate}>شبیه‌سازی: بسته تمام شد</button>}</div>}
          <div className="card"><h3>قراردادهای میان شما و این اپ</h3>
            {d.contracts.length === 0 && <div className="hint">هنوز قراردادی نیست.</div>}
            {d.contracts.map((c: any) => <button key={c.id} className="pc" style={{ width: '100%', textAlign: 'start' }} onClick={() => nav(`/contracts/${c.id}`)}><span>{c.title}</span><small>{c.amount_label ? `${c.amount_label} · ` : ''}{STATUS[c.status]?.label ?? c.status} · {c.created_label}</small></button>)}
          </div>
        </>)}
        {tab === 'perms' && (<>
          <div className="card"><h3>مجوزهای عادی</h3>
            {declared.length === 0 && <div className="hint">این اپ مجوزی نمی‌خواهد.</div>}
            {declared.map((p) => { const on = a.granted.includes(p.key); return <div key={p.key} className="pc"><div><div>{p.label}</div><small>{p.description}</small></div>{on ? <button className="btn sm danger" onClick={() => revoke(p.key)}>لغو</button> : <button className="btn sm" onClick={() => grantPerm(p.key)}>اعطا (با قرارداد)</button>}</div>; })}
            <p className="hint" style={{ marginTop: 8 }}>لغو مجوز به موافقت اپ نیاز ندارد و همان لحظه اثر می‌کند. اعطای مجوز تازه، خودش یک قرارداد است.</p>
          </div>
          <div className="card" style={{ borderColor: 'color-mix(in srgb, var(--seal) 40%, var(--line))' }}><h3 style={{ color: 'var(--seal)' }}>اختیار مالی</h3>
            {fin.length === 0 && <div className="hint">این اپ اختیار مالی نمی‌خواهد.</div>}
            {fin.map((p) => { const on = a.granted.includes(`financial:${p.key}`); return <div key={p.key} className="pc"><div><div>{p.label}</div><small>{p.description}</small></div>{on ? <button className="btn sm danger" onClick={() => revoke(`financial:${p.key}`)}>لغو</button> : <span className="hint">از راه قرارداد وکالت</span>}</div>; })}
            <p className="hint" style={{ marginTop: 8 }}>اختیار مالی فقط با وکالتِ سقف‌دار و زمان‌دار و امضای پلهٔ بالاتر داده می‌شود؛ فهرستش در «وکالت‌ها»ست.</p>
          </div>
          {a.auth && <div className="card"><h3>{a.auth.label}</h3><p className="hint">{a.auth.hint}</p><div style={{ display: 'flex', gap: 8, marginTop: 8 }}><input dir="ltr" type="password" placeholder={a.has_credential ? '•••••• (ذخیره شده)' : 'توکن'} value={cred} onChange={(e) => setCred(e.target.value)} /><button className="btn" disabled={busy || !cred} onClick={saveCred}>ذخیره</button></div></div>}
          <div className="card"><h3>حذف اپ</h3><p className="hint">همهٔ مجوزها و وکالت‌های این اپ لغو می‌شود؛ قراردادهای گذشته در «قراردادهای من» می‌مانند.</p><button className="btn danger" style={{ marginTop: 8 }} onClick={() => setConfirmRemove(true)}>حذف اپ</button></div>
        </>)}
        {tab === 'caps' && (<div className="card"><h3>قابلیت‌هایی که دستیار می‌بیند</h3>
          {a.tools.exposed.length === 0 && <div className="hint">هنوز قابلیتی خوانده نشده؛ «بررسی اتصال» را بزنید.</div>}
          {a.tools.exposed.map((t: any) => <div key={t.name} className="pc"><div><div>{t.title ?? t.name} <span className={`chip ${t.kind === 'build' ? 'warn' : ''}`}>{t.kind === 'build' ? 'قرارداد می‌سازد' : 'خواندنی'}</span></div><small>{t.description}</small></div></div>)}
          {a.tools.hidden.length > 0 && <><h3 style={{ marginTop: 12 }}>پنهان‌شده — چون اثر دارند</h3><p className="hint">در ویستا نوشتن قرارداد است؛ هیچ ابزاری که مستقیم چیزی را عوض کند منتشر نمی‌شود.</p>{a.tools.hidden.map((t: any) => <div key={t.name} className="pc"><span className="mono">{t.name}</span><small>{t.reason}</small></div>)}</>}
        </div>)}
        {tab === 'mini' && a.mini_app_url && (<div className="card"><p className="hint" style={{ marginBottom: 8 }}>صفحهٔ گرافیکی خودِ اپ که داخل ویستا باز می‌شود. امضا هیچ‌وقت داخل مینی‌اپ انجام نمی‌شود.</p><iframe className="mini" src={`${a.mini_app_url}?token=${encodeURIComponent(d.mini_token ?? '')}`} title={a.name} /></div>)}
      </div>
      <Sheet open={!!grant} onClose={() => setGrant(null)} title="اعطای مجوز">{grant && <ContractCard c={grant} allowAsk={false} onChange={async (c) => { setGrant(c); if (c.status !== 'awaiting') { setGrant(null); await load(); } }} />}</Sheet>
      <Sheet open={confirmRemove} onClose={() => setConfirmRemove(false)} title="حذف اپ"><p className="hint" style={{ marginBottom: 12 }}>مطمئنید؟</p><div style={{ display: 'flex', gap: 8 }}><button className="btn danger block" onClick={remove}>حذف</button><button className="btn" onClick={() => setConfirmRemove(false)}>انصراف</button></div></Sheet>
    </>
  );
}
