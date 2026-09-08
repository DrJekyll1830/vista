import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './styles.css';
import { AuthProvider, useAuth } from './auth';
import { Toaster, Spinner } from './ui';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Shell from './pages/Shell';
import Chat from './pages/Chat';
import AppSettings from './pages/AppSettings';
import { Showcase, ShowcaseDetail } from './pages/Showcase';
import Wallet from './pages/Wallet';
import { Contracts, ContractDetail, Delegations } from './pages/Contracts';
import Settings from './pages/Settings';
import Share from './pages/Share';

function Guard({ children, needOnboarded = true }: { children: React.ReactElement; needOnboarded?: boolean }) {
  const { me, loading } = useAuth(); const loc = useLocation();
  if (loading) return <div className="center"><Spinner /></div>;
  if (!me) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (needOnboarded && !me.user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}
function Home() { const { me } = useAuth(); return <Navigate to={me?.user?.default_page === 'apps' ? '/apps' : '/chat/assistant'} replace />; }
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Guard needOnboarded={false}><Onboarding /></Guard>} />
      <Route path="/c/:token" element={<Guard><Share /></Guard>} />
      <Route element={<Guard><Shell /></Guard>}>
        <Route path="/" element={<Home />} />
        <Route path="/apps" element={<div className="center hint">یک اپ را انتخاب کنید</div>} />
        <Route path="/chat/:appId" element={<Chat />} />
        <Route path="/app/:appId" element={<AppSettings />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/showcase/:appId" element={<ShowcaseDetail />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/contracts/:id" element={<ContractDetail />} />
        <Route path="/delegations" element={<Delegations />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/support" element={<Navigate to="/chat/support" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
createRoot(document.getElementById('root')!).render(<StrictMode><AuthProvider><BrowserRouter><App /><Toaster /></BrowserRouter></AuthProvider></StrictMode>);
