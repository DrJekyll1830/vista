import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { get, post, fa } from '../api';
import { Avatar, Tick, Top, toast, Sheet, Spinner, Field } from '../ui';
import { ContractCard, type Projection } from '../contract';

export function Showcase() {
  const nav = useNavigate(); const [apps, setApps] = useState<any[] | null>(null); const [q, setQ] = useState(''); const [addOpen, setAddOpen] = useState(false); const [url, setUrl] = useState(''); const [cred, setCred] = useState(''); const [busy, setBusy] = useState(false);
  const load = async () => { try { const r = await get(`/showcase?q=${encodeURIComponent(q)}`); setApps(r.apps); } catch (e: any) { toast(e.message); } };
  useEffect(() => { void load(); }, [q]);
  async function add() { setBusy(true); try { const r = await post('/showcase/add', { url, credential: cred || undefined }); toast(`اپ «${r.app.name}» خوانده شد`); setAddOpen(false); nav(`/showcase/${r.app.id}`); } catch (e: any) { toast(e.message); } finally { setBusy(false); } }
  return (
    <>
      <Top onBack={() => nav('/apps')} avatar={<Avatar color="#7A4FA3" logo="ی" />} title="ویترین" sub="هر اپ دیگری از این‌جا پیدا و نصب می‌شود" right={<button className="act" onClick={() => setAddOpen(true)}>+ با آدرس</button>} />
      <div className="pad" style={{ paddingBottom: 0 }}><input placeholder="جست‌وجو: نام، دسته، شرکت…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="body">
        {!apps && <div className="pad"><Spinner /></div>}
        {apps?.map((a) => (
          <button key={a.id} className="row" onClick={() => nav(`/showcase/${a.id}`)}>
            <Avatar color={a.color} logo={a.logo} />
            <span className="tx"><span className="t1">{a.name}<Tick show={a.verified} /> {a.category && <span className="sysmark">{a.category}</span>}</span><span className="t2">{a.description}</span></span>
            <span className="tail">{a.installed ? <span className="chip ok">نصب‌شده</span> : a.rating ? <span>★ {fa(a.rating)}</span> : null}{a.auth?.required && <span className="chip warn">توکن</span>}</span>
          </button>
        ))}
        <div className="pad hint">اپ‌ها از دو راه می‌آیند: از ویترین، یا با آدرس. هر دو به یک در می‌رسند: قرارداد استارت با همان فهرست مجوزها و همان امضا. فقط اپِ احرازشده (نشان آبی) می‌تواند اختیار مالی بخواهد.</div>
      </div>
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="افزودن اپ با آدرس">
        <p className="hint" style={{ marginBottom: 10 }}>آدرس MCP سرویس را بدهید؛ لازم نیست جایی خاص میزبانی شده یا از پیش با ما هماهنگ شده باشد.</p>
        <Field label="آدرس MCP"><input dir="ltr" placeholder="https://example.com/mcp" value={url} onChange={(e) => setUrl(e.target.value)} /></Field>
        <Field label="توکن (اختیاری)"><input dir="ltr" type="password" value={cred} onChange={(e) => setCred(e.target.value)} /></Field>
        <button className="btn primary block" disabled={busy || !url.startsWith('http')} onClick={add}>{busy ? <Spinner /> : 'خواندن قابلیت‌ها'}</button>
      </Sheet>
    </>
  );
}
export function ShowcaseDetail() {
  const { appId = '' } = useParams(); const nav = useNavigate(); const { reload } = useOutletContext<{ reload: () => Promise<void> }>();
  const [a, setA] = useState<any>(null); const [perms, setPerms] = useState<Record<string, boolean>>({}); const [cred, setCred] = useState(''); const [contract, setContract] = useState<Projection | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => { get(`/apps/${appId}`).then((r) => { setA(r.app); const p: Record<string, boolean> = {}; for (const x of r.app.permissions) p[x.key] = true; setPerms(p); }).catch((e) => toast(e.message)); }, [appId]);
  if (!a) return <><Top onBack={() => nav('/showcase')} title="…" /><div className="pad"><Spinner /></div></>;
  async function install() {
    setBusy(true);
    try { const chosen = Object.entries(perms).filter(([, v]) => v).map(([k]) => k); const r = await post(`/showcase/${appId}/install`, { permissions: chosen, credential: a.auth ? cred || undefined : undefined }); setContract(r.contract); }
    catch (e: any) { toast(e.message); } finally { setBusy(false); }
  }
  return (
    <>
      <Top onBack={() => nav('/showcase')} avatar={<Avatar color={a.color} logo={a.logo} />} title={<>{a.name}<Tick show={a.verified} /></>} sub={a.company ?? a.url} />
      <div className="body pad">
        <div className="card"><div className="between"><div>{a.rating && <span>★ {fa(a.rating)}</span>} <span className={`chip ${a.verified ? 'ok' : 'warn'}`}>{a.verified ? 'احرازشده' : 'احرازنشده'}</span> <span className={`chip ${a.health === 'up' ? 'ok' : a.health === 'down' ? 'bad' : ''}`}>{a.health === 'up' ? 'در دسترس' : a.health === 'down' ? 'در دسترس نیست' : 'سلامت نامعلوم'}</span> {a.tags?.map((t: string) => <span key={t} className="chip">{t}</span>)}</div></div><p style={{ marginTop: 8 }}>{a.long_description || a.description}</p><p className="hint mono" style={{ marginTop: 6 }}>{a.url}</p></div>
        {a.templates?.length > 0 && <div className="card"><h3>قراردادهایی که این اپ می‌سازد</h3>{a.templates.map((t: any) => <div key={t.ref} className="pc"><span>{t.title}</span><small>کف پلهٔ {fa(t.min_rung ?? 1)} · {t.settlement === 'on_delivery' ? 'کسر پس از تحویل' : 'کسر فوری'}</small></div>)}</div>}
        {a.tools.exposed.length > 0 && <div className="card"><h3>قابلیت‌ها ({fa(a.tools.exposed.length)} منتشرشده{a.tools.hidden.length ? ` · ${fa(a.tools.hidden.length)} پنهان چون اثر دارند` : ''})</h3>{a.tools.exposed.slice(0, 8).map((t: any) => <div key={t.name} className="pc"><span>{t.title ?? t.name}</span><small>{t.kind === 'build' ? 'قرارداد' : 'خواندنی'}</small></div>)}</div>}
        {a.reviews?.length > 0 && <div className="card"><h3>نظر کاربران</h3>{a.reviews.map((r: any, i: number) => <div key={i} className="pc"><div><div>{r.text}</div><small>{r.who} · {'★'.repeat(r.stars)}</small></div></div>)}</div>}
        {!contract && (
          <div className="card"><h3>{a.installed ? 'نصب‌شده' : 'پیش از نصب: این اپ چه مجوزهایی می‌خواهد؟'}</h3>
            {a.permissions.length === 0 && <div className="hint">هیچ مجوزی نمی‌خواهد.</div>}
            {a.permissions.map((p: any) => <label key={p.key} className="perm"><input type="checkbox" checked={!!perms[p.key]} disabled={a.installed} onChange={(e) => setPerms({ ...perms, [p.key]: e.target.checked })} /><span>{p.label}<div className="cap">{p.description}</div></span></label>)}
            {a.financial_permissions.map((p: any) => <div key={p.key} className="perm fin"><span><span className="lbl">{p.label}</span><div className="cap">اختیار مالی · {a.verified ? 'فقط از راه قرارداد وکالت با سقف و انقضا و امضای پلهٔ بالاتر؛ بعد از نصب، از گفت‌وگو بخواهید' : 'این اپ احراز نشده و نمی‌تواند اختیار مالی بگیرد'}</div></span></div>)}
            {a.auth && !a.installed && <Field label={a.auth.label + (a.auth.required ? ' *' : ' (اختیاری)')} hint={a.auth.hint}><input dir="ltr" type="password" value={cred} onChange={(e) => setCred(e.target.value)} /></Field>}
            {a.installed ? <button className="btn block" style={{ marginTop: 10 }} onClick={() => nav(`/chat/${a.id}`)}>رفتن به گفت‌وگو</button> : <button className="btn primary block" style={{ marginTop: 10 }} disabled={busy || (a.auth?.required && !cred)} onClick={install}>{busy ? <Spinner /> : 'ساختن قرارداد استارت'}</button>}
          </div>
        )}
        {contract && <ContractCard c={contract} allowAsk={false} onChange={async (c) => { setContract(c); if (['settled', 'executing'].includes(c.status)) { await reload(); toast(`${a.name} به فهرست شما اضافه شد`); nav(`/chat/${a.id}`); } }} />}
      </div>
    </>
  );
}
