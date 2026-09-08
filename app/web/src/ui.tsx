import { useEffect, useState, type ReactNode } from 'react';

export const Avatar = ({ color, logo, size = '' }: { color: string; logo: string; size?: '' | 'sm' | 'lg' }) => <span className={`av ${size}`} style={{ background: color }}>{logo}</span>;
export const Tick = ({ show }: { show: boolean }) => (show ? <i className="tick" title="احرازشده">✓</i> : null);
export const Spinner = () => <span className="spin" />;
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  if (!open) return null;
  return <div className="sheet-bg" onClick={onClose}><div className="sheet" onClick={(e) => e.stopPropagation()}>{title && <h3>{title}</h3>}{children}</div></div>;
}
let toastFn: ((m: string) => void) | null = null;
export const toast = (m: string) => toastFn?.(m);
export function Toaster() {
  const [m, setM] = useState<string | null>(null);
  useEffect(() => { toastFn = (x) => { setM(x); setTimeout(() => setM(null), 2600); }; return () => { toastFn = null; }; }, []);
  return m ? <div className="toast">{m}</div> : null;
}
export const Field = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => <div className="field"><label>{label}</label>{children}{hint && <span className="hint">{hint}</span>}</div>;
export const Empty = ({ text }: { text: string }) => <div className="pad hint" style={{ textAlign: 'center', padding: 40 }}>{text}</div>;
export function Top({ title, sub, onBack, right, avatar }: { title: ReactNode; sub?: ReactNode; onBack?: () => void; right?: ReactNode; avatar?: ReactNode }) {
  return <div className="top">{onBack && <button className="back" onClick={onBack} aria-label="بازگشت">›</button>}{avatar}<div className="title"><h2>{title}</h2>{sub && <div className="st">{sub}</div>}</div>{right}</div>;
}
