/** رابط اپ‌ها با سکو (بدون نشست کاربر): رویدادهای امضاشده و اجرای زیر وکالت. */
import { Hono } from 'hono';
import { z } from 'zod';
import * as engine from '../contracts/engine.js';
import { executeUnderDelegation } from '../contracts/delegation.js';
import { getApp } from '../gateway/registry.js';

export const appsApi = new Hono();
appsApi.post('/app-events', async (c) => {
  const b = await c.req.json().catch(() => null);
  const s = z.object({ app_id: z.string(), contract_id: z.string(), type: z.enum(['delivered', 'cancelled', 'refunded', 'failed', 'note']), text: z.string().optional(), payload: z.record(z.unknown()).optional(), ts: z.string(), signature: z.string() }).safeParse(b);
  if (!s.success) return c.json({ error: 'bad_request', message: s.error.message }, 400);
  const { app_id, contract_id, type, text, payload, ts, signature } = s.data;
  const row = engine.getContract(contract_id);
  if (!row || row.app_id !== app_id) return c.json({ error: 'not_found', message: 'قرارداد این اپ نیست' }, 404);
  if (Math.abs(Date.now() - new Date(ts).getTime()) > 5 * 60_000) return c.json({ error: 'stale', message: 'زمان رویداد قدیمی است' }, 400);
  if (!engine.verifyEventSignature(app_id, { contract_id, type, text, payload, ts }, signature)) return c.json({ error: 'signature', message: 'امضای اپ معتبر نیست' }, 403);
  if (!['executing', 'settled'].includes(row.status)) return c.json({ error: 'status', message: `قرارداد در وضعیت ${row.status} است` }, 409);
  try { const r = engine.recordEvent(contract_id, type, 'app', app_id, text ?? '', payload ?? {}, signature); return c.json({ ok: true, status: r.status }); } catch (e: any) { return c.json({ error: e.code ?? 'error', message: e.message }, 400); }
});
appsApi.post('/app-actions/delegated', async (c) => {
  const b = await c.req.json().catch(() => null);
  const s = z.object({ app_id: z.string(), delegation_id: z.string(), contract: z.any(), app_signature: z.string() }).safeParse(b);
  if (!s.success) return c.json({ error: 'bad_request', message: s.error.message }, 400);
  if (!getApp(s.data.app_id)) return c.json({ error: 'not_found' }, 404);
  try { const r = executeUnderDelegation(s.data.app_id, s.data.delegation_id, s.data.contract, s.data.app_signature); return c.json({ ok: true, contract_id: r.contract.id, status: r.contract.status, delegation: { spent: r.delegation.spent, cap: r.delegation.cap, status: r.delegation.status } }); }
  catch (e: any) { return c.json({ error: e.code ?? 'error', message: e.message }, e.status ?? 400); }
});
