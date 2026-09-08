import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { get, getToken, setToken } from './api';

export interface Me { user: any; assistant_available: boolean; provider: string | null; wallet: { balance: number; held: number }; pending: number }
interface Ctx { me: Me | null; loading: boolean; refresh: () => Promise<void>; logout: () => void }
const AuthCtx = createContext<Ctx>({ me: null, loading: true, refresh: async () => {}, logout: () => {} });
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!getToken()) { setMe(null); setLoading(false); return; }
    try { setMe(await get<Me>('/me')); } catch { setMe(null); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); const h = () => setMe(null); window.addEventListener('vista:logout', h); return () => window.removeEventListener('vista:logout', h); }, [refresh]);
  useEffect(() => { const t = me?.user?.theme ?? 'system'; document.documentElement.dataset.theme = t === 'system' ? '' : t; }, [me?.user?.theme]);
  const logout = () => { setToken(''); setMe(null); };
  return <AuthCtx.Provider value={{ me, loading, refresh, logout }}>{children}</AuthCtx.Provider>;
}
