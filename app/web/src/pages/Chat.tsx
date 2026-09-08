import { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { get, post, sendChat, fa } from '../api';
import { useAuth } from '../auth';
import { Avatar, Tick, Sheet, Top, toast, Spinner } from '../ui';
import { ContractCard, type Projection } from '../contract';
import type { AppItem } from './Shell';

interface Msg { id: string; kind: string; text: string; at_label: string; contract: Projection | null; contracts?: Projection[]; reply_to: { id: string; title: string; amount_label: string | null } | null; meta: any }

export default function Chat() {
  const { appId = 'assistant' } = useParams(); const nav = useNavigate(); const [sp, setSp] = useSearchParams();
  const { apps } = useOutletContext<{ apps: AppItem[] }>(); const { me, refresh } = useAuth();
  const app = apps.find((a) => a.id === appId);
  const [msgs, setMsgs] = useState<Msg[]>([]); const [text, setText] = useState(''); const [busy, setBusy] = useState(false);
  const [stream, setStream] = useState(''); const [status, setStatus] = useState(''); const [live, setLive] = useState<Projection[]>([]);
  const [tools, setTools] = useState<any[] | null>(null); const [toolOpen, setToolOpen] = useState(false); const [activeTool, setActiveTool] = useState<any>(null); const [toolArgs, setToolArgs] = useState<Record<string, any>>({});
  const [forward, setForward] = useState<string | null>(sp.get('forward'));
  const bottom = useRef<HTMLDivElement>(null);
  const isAssistant = appId === 'assistant';
  const assistantDown = !me?.assistant_available;
  const load = async () => { try { const r = await get(`/chats/${appId}`); setMsgs(r.messages); } catch (e: any) { toast(e.message); } };
  useEffect(() => { setMsgs([]); setLive([]); setTools(null); void load(); setForward(sp.get('forward')); }, [appId]);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'end' }); }, [msgs, stream, live, status]);
  useEffect(() => { if (forward) setText((t) => t || 'این قرارداد یعنی چه؟ چیزی هست که باید حواسم باشد؟'); }, [forward]);

  async function send() {
    const t = text.trim(); if (!t || busy) return;
    setBusy(true); setText(''); setStream(''); setStatus('');
    const fwd = forward ?? undefined; setForward(null); if (sp.get('forward')) setSp({});
    setMsgs((m) => [...m, ...(fwd ? [{ id: 'f' + Date.now(), kind: 'forward', text: '↱ قرارداد فوروارد شد', at_label: '', contract: null, reply_to: null, meta: null }] : []), { id: 'u' + Date.now(), kind: 'user', text: t, at_label: '', contract: null, reply_to: null, meta: null }]);
    await sendChat(appId, t, fwd, {
      token: (x) => setStream((s) => s + x), status: setStatus,
      contract: (c) => setLive((l) => [...l, c]),
      done: async () => { setStream(''); setStatus(''); await load(); setLive([]); await refresh(); },
      error: async (m) => { toast(m); setStream(''); setStatus(''); await load(); },
      plain: async () => { await load(); },
    });
    setBusy(false);
  }
  async function openTools() { setToolOpen(true); if (!tools) { try { const r = await get(`/apps/${appId}/tools`); setTools(r.tools); } catch (e: any) { toast(e.message); } } }
  async function runTool() {
    if (!activeTool) return; setBusy(true);
    try {
      const args: Record<string, any> = {};
      for (const [k, v] of Object.entries(toolArgs)) { if (v === '' || v === undefined) continue; const sch = activeTool.input_schema?.properties?.[k]; args[k] = sch?.type === 'integer' || sch?.type === 'number' ? Number(String(v).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))) : v; }
      const r = await post(`/apps/${appId}/tools/${activeTool.name}`, { args });
      setActiveTool(null); setToolOpen(false); setToolArgs({});
      if (r.contract) toast('قرارداد آماده است'); await load(); await refresh();
    } catch (e: any) { toast(e.message); } finally { setBusy(false); }
  }
  const title = isAssistant ? 'دستیار ویستا' : app?.name ?? appId;
  const sub = isAssistant ? (assistantDown ? 'در دسترس نیست — مدل زبانی پیکربندی نشده' : `آنلاین${me?.provider === 'byok' ? ' · با مدل خودتان' : ''}`) : app?.health === 'down' ? 'در دسترس نیست' : app?.system ? 'اپ سیستمی' : 'برای تنظیمات، روی نام بزنید ›';
  return (
    <>
      <Top onBack={() => nav('/apps')} avatar={<Avatar color={app?.color ?? 'var(--accent)'} logo={app?.logo ?? 'و'} />} title={<span style={{ cursor: app && !app.system ? 'pointer' : 'default' }} onClick={() => app && !app.system && nav(`/app/${appId}`)}>{title}<Tick show={!!app?.verified && !app?.system} /></span>} sub={sub}
        right={app && !app.system ? <button className="act" onClick={() => nav(`/app/${appId}`)}>تنظیمات</button> : isAssistant ? <button className="act" onClick={() => nav('/contracts')}>قراردادها</button> : undefined} />
      <div className="body">
        <div className="chat">
          {isAssistant && msgs.length === 0 && <div className="msg system">سلام! بگویید چه می‌خواهید: «برای خطم ۵ گیگ بسته بخر»، «کیف پولم رو ۵۰۰ هزار تومن شارژ کن»، «یه اپ برای مستندات گیت‌هاب نصب کن». من قرارداد را می‌آورم؛ امضا با شماست.</div>}
          {msgs.map((m) => <Message key={m.id} m={m} onChange={load} />)}
          {live.map((c) => <ContractCard key={c.id} c={c} inChat onChange={load} />)}
          {status && <div className="msg status">{status}</div>}
          {stream && <div className="msg them">{stream}</div>}
          {busy && !stream && !status && <div className="typing"><i /><i /><i /></div>}
          <div ref={bottom} />
        </div>
      </div>
      {forward && <div className="pad" style={{ paddingBottom: 0 }}><div className="warn-box between"><span>↱ قرارداد برای دستیار فوروارد می‌شود</span><button className="btn sm" onClick={() => { setForward(null); setSp({}); }}>لغو</button></div></div>}
      <div className="composer">
        {app && !app.system && <button className="tools" title="قابلیت‌های اپ (بدون دستیار)" onClick={openTools}>⚙</button>}
        {app?.id === 'wallet' && <button className="tools" title="شارژ" onClick={() => nav('/wallet')}>💳</button>}
        <textarea rows={1} placeholder={app?.health === 'down' ? 'این اپ در دسترس نیست' : 'پیام…'} value={text} disabled={app?.health === 'down'} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} />
        <button className="send" disabled={busy || !text.trim() || app?.health === 'down'} onClick={send}>↑</button>
      </div>
      <Sheet open={toolOpen} onClose={() => { setToolOpen(false); setActiveTool(null); }} title={activeTool ? activeTool.title ?? activeTool.name : `قابلیت‌های ${app?.name ?? ''}`}>
        {!activeTool ? (<>
          <p className="hint" style={{ marginBottom: 10 }}>این سطح ساختاریافته از همان اعلام قابلیتی ساخته می‌شود که دستیار استفاده می‌کند — و وقتی دستیار در دسترس نیست هم کار می‌کند. قابلیت‌های اثرگذار منتشر نشده‌اند؛ آن‌ها قرارداد می‌آورند.</p>
          {!tools && <Spinner />}
          {tools?.filter((t) => t.exposed).map((t) => <div key={t.name} className="tool-card between"><div><div className="tn">{t.title ?? t.name} <span className={`chip ${t.kind === 'build' ? 'warn' : ''}`}>{t.kind === 'build' ? 'قرارداد می‌سازد' : 'خواندنی'}</span></div><div className="td">{t.description}</div></div><button className="btn sm" onClick={() => { setActiveTool(t); setToolArgs({}); }}>اجرا</button></div>)}
          {tools && tools.filter((t) => !t.exposed).length > 0 && <div className="hint" style={{ marginTop: 8 }}>{fa(tools.filter((t) => !t.exposed).length)} قابلیت پنهان شد: {tools.filter((t) => !t.exposed).map((t) => `${t.name} (${t.reason})`).join('، ')}</div>}
        </>) : (<>
          <p className="hint" style={{ marginBottom: 10 }}>{activeTool.description}</p>
          {Object.entries<any>(activeTool.input_schema?.properties ?? {}).map(([k, s]) => (
            <div className="field" key={k}><label>{s.description ?? k}{activeTool.input_schema?.required?.includes(k) ? ' *' : ''}</label>
              {s.enum ? <select value={toolArgs[k] ?? ''} onChange={(e) => setToolArgs({ ...toolArgs, [k]: e.target.value })}><option value="">—</option>{s.enum.map((o: string) => <option key={o} value={o}>{o}</option>)}</select>
                : <input dir={s.type === 'integer' || s.type === 'number' ? 'ltr' : undefined} inputMode={s.type === 'integer' || s.type === 'number' ? 'numeric' : undefined} value={toolArgs[k] ?? ''} onChange={(e) => setToolArgs({ ...toolArgs, [k]: e.target.value })} placeholder={s.default != null ? String(s.default) : ''} />}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}><button className="btn primary block" disabled={busy} onClick={runTool}>{busy ? <Spinner /> : activeTool.kind === 'build' ? 'ساختن قرارداد' : 'خواندن'}</button><button className="btn" onClick={() => setActiveTool(null)}>بازگشت</button></div>
        </>)}
      </Sheet>
    </>
  );
}
function Message({ m, onChange }: { m: Msg; onChange: () => void }) {
  if (m.kind === 'contract' && m.contract) return <ContractCard c={m.contract} inChat onChange={onChange} />;
  if (m.kind === 'event') return <div className="msg event">{m.reply_to && <div className="ref">{m.reply_to.title}{m.reply_to.amount_label ? ` · ${m.reply_to.amount_label}` : ''}</div>}↳ {m.text}<span className="at">{m.at_label}</span></div>;
  if (m.kind === 'forward') return <div className="msg system">↱ قرارداد فوروارد شد{m.contract ? `: ${m.contract.title}` : ''}</div>;
  const cls = m.kind === 'user' ? 'me' : m.kind === 'system' ? 'system' : 'them';
  return (<>
    <div className={`msg ${cls}`}>{m.text}{cls !== 'system' && <span className="at">{m.at_label}</span>}</div>
    {m.contracts?.map((c) => <ContractCard key={c.id} c={c} inChat onChange={onChange} />)}
  </>);
}
