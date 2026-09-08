import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { get, fa } from '../api';
import { useAuth } from '../auth';
import { Avatar, Tick } from '../ui';

export interface AppItem { id: string; name: string; description: string; color: string; logo: string; verified: boolean; system: boolean; kind: string; health: string; last_preview: string; last_message_at: string | null; unread: number; pending: number; mini_app_url: string | null; has_key: boolean; tools: any; granted: string[]; muted: boolean; auth: any; has_credential: boolean }
const SYSTEM_ROUTES: Record<string, string> = { showcase: '/showcase', wallet: '/wallet', contracts: '/contracts', settings: '/settings', support: '/chat/support', assistant: '/chat/assistant' };
export const routeFor = (a: { id: string; system: boolean }) => (a.system ? SYSTEM_ROUTES[a.id] ?? `/chat/${a.id}` : `/chat/${a.id}`);

export function useApps() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const load = useCallback(async () => { try { const r = await get('/apps'); setApps(r.apps); } catch { /* auth handles */ } }, []);
  useEffect(() => { void load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);
  return { apps, reload: load };
}

export default function Shell() {
  const loc = useLocation(); const nav = useNavigate(); const params = useParams();
  const { me } = useAuth();
  const { apps, reload } = useApps();
  const isList = loc.pathname === '/apps';
  const activeId = params.appId ?? (Object.entries(SYSTEM_ROUTES).find(([, r]) => loc.pathname.startsWith(r) && r !== '/chat/assistant' && r !== '/chat/support')?.[0]);
  useEffect(() => { void reload(); }, [loc.pathname, reload]);
  return (
    <div className="shell">
      <div className={`pane list ${isList ? '' : 'hidden-mobile'}`}>
        <div className="top"><Avatar color="var(--accent)" logo="و" /><div className="title"><h2>ویستا</h2><div className="st">{apps.length ? `${fa(apps.length)} اپ` : '…'}{me?.pending ? ` · ${fa(me.pending)} قرارداد منتظر امضا` : ''}</div></div><button className="act" onClick={() => nav('/showcase')}>+ اپ</button></div>
        <div className="body">
          {apps.map((a) => <AppRow key={a.id} a={a} active={activeId === a.id || (loc.pathname === `/chat/${a.id}`)} onOpen={() => nav(routeFor(a))} />)}
          {apps.length === 0 && <div className="pad hint">در حال بارگذاری…</div>}
        </div>
      </div>
      <div className={`pane main ${isList ? 'hidden-mobile' : ''}`}><Outlet context={{ apps, reload }} /></div>
    </div>
  );
}
export function AppRow({ a, active, onOpen }: { a: AppItem; active?: boolean; onOpen: () => void }) {
  const down = a.health === 'down';
  return (
    <button className={`row ${active ? 'active' : ''} ${down ? 'down' : ''}`} onClick={onOpen}>
      <Avatar color={a.color} logo={a.logo} />
      <span className="tx"><span className="t1">{a.name}<Tick show={a.verified && !a.system} />{a.system && <span className="sysmark" style={{ marginInlineStart: 6 }}>سیستمی</span>}</span><span className="t2">{down ? 'در دسترس نیست' : a.last_preview || a.description}</span></span>
      <span className="tail">
        {a.pending > 0 && <span className="badge warn">{fa(a.pending)} امضا</span>}
        {a.unread > 0 && !a.muted && <span className="badge">{fa(a.unread)}</span>}
        {a.muted && <span>🔕</span>}
      </span>
    </button>
  );
}
