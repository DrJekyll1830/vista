export const TOKEN_KEY = 'vista.token';
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) ?? ''; } catch { return ''; } };
export const setToken = (t: string) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } };

export class ApiError extends Error { constructor(public status: number, public code: string, message: string) { super(message); } }

export async function api<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch('/api' + path, {
    method, headers: { 'content-type': 'application/json', ...(getToken() ? { authorization: `Bearer ${getToken()}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { message: text }; }
  if (!res.ok) {
    if (res.status === 401) { setToken(''); window.dispatchEvent(new Event('vista:logout')); }
    throw new ApiError(res.status, data?.error ?? 'error', data?.message ?? `خطای ${res.status}`);
  }
  return data as T;
}
export const get = <T = any>(p: string) => api<T>('GET', p);
export const post = <T = any>(p: string, b?: unknown) => api<T>('POST', p, b ?? {});
export const del = <T = any>(p: string) => api<T>('DELETE', p);

/** Chat send with SSE streaming. Falls back to JSON when the server answers without a stream. */
export async function sendChat(appId: string, text: string, forwardContractId: string | undefined, on: { token?: (t: string) => void; status?: (s: string) => void; contract?: (c: any) => void; done?: (d: any) => void; error?: (m: string) => void; plain?: (m: any) => void }) {
  const res = await fetch(`/api/chats/${appId}/messages`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${getToken()}` }, body: JSON.stringify({ text, forward_contract_id: forwardContractId }) });
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('text/event-stream')) {
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { on.error?.(j?.message ?? 'خطا'); return; }
    on.plain?.(j); return;
  }
  const reader = res.body!.getReader(); const dec = new TextDecoder(); let buf = '';
  let event = 'message', data = '';
  const flush = () => {
    if (!data) return;
    let d: any; try { d = JSON.parse(data); } catch { d = data; }
    if (event === 'token') on.token?.(d); else if (event === 'status') on.status?.(d); else if (event === 'contract') on.contract?.(d); else if (event === 'done') on.done?.(d); else if (event === 'error') on.error?.(d?.message ?? 'خطا');
    event = 'message'; data = '';
  };
  for (;;) {
    const { value, done } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
      if (line === '') { flush(); continue; }
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data += line.slice(5).trim();
    }
  }
  flush();
}
const FA = '۰۱۲۳۴۵۶۷۸۹';
export const fa = (s: string | number) => String(s).replace(/[0-9]/g, (d) => FA[Number(d)]);
export const en = (s: string) => s.replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)));
export const toman = (n: number) => fa(Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '٬')) + ' تومان';
export const STATUS: Record<string, { label: string; cls: 'ok' | 'bad' | 'wait' | '' }> = {
  draft: { label: 'پیش‌نویس', cls: '' }, awaiting: { label: 'در انتظار امضای شما', cls: 'wait' }, signed: { label: 'امضا شد', cls: 'ok' }, executing: { label: 'در حال اجرا', cls: 'wait' },
  settled: { label: 'اجرا شد', cls: 'ok' }, rejected: { label: 'رد شد', cls: 'bad' }, expired: { label: 'منقضی شد', cls: 'bad' }, cancelled: { label: 'لغو شد', cls: 'bad' },
  disputed: { label: 'در اختلاف', cls: 'bad' }, refunded: { label: 'برگشت خورد', cls: '' }, failed: { label: 'ناموفق', cls: 'bad' },
};
