import { q, json } from '../db.js';
import { id, now } from '../util/ids.js';

export interface Message {
  id: string; conversation_id: string; kind: string; text: string; contract_id: string | null;
  reply_to_contract_id: string | null; meta_json: string | null; created_at: string;
}
export async function conversation(userId: string, appId: string) {
  let c = await q.get<any>('SELECT * FROM conversations WHERE user_id=? AND app_id=?', userId, appId);
  if (!c) {
    const cid = id('cnv');
    await q.run('INSERT INTO conversations (id, user_id, app_id, last_message_at, last_preview, unread) VALUES (?,?,?,?,?,0)', cid, userId, appId, null, '');
    c = await q.get<any>('SELECT * FROM conversations WHERE id=?', cid);
  }
  return c;
}
export async function post(userId: string, appId: string, kind: Message['kind'], text: string, opts: { contractId?: string; replyToContractId?: string; meta?: Record<string, unknown>; unread?: boolean } = {}) {
  const c = await conversation(userId, appId);
  const mid = id('msg');
  await q.run('INSERT INTO messages (id, conversation_id, kind, text, contract_id, reply_to_contract_id, meta_json, created_at) VALUES (?,?,?,?,?,?,?,?)',
    mid, c.id, kind, text, opts.contractId ?? null, opts.replyToContractId ?? null, opts.meta ? JSON.stringify(opts.meta) : null, now());
  const preview = kind === 'contract' ? `قرارداد: ${text}` : text;
  await q.run('UPDATE conversations SET last_message_at=?, last_preview=?, unread = unread + ? WHERE id=?', now(), preview.slice(0, 80), opts.unread === false || kind === 'user' ? 0 : 1, c.id);
  return (await q.get<Message>('SELECT * FROM messages WHERE id=?', mid))!;
}
export async function history(userId: string, appId: string, limit = 200): Promise<Message[]> {
  const c = await conversation(userId, appId);
  return q.all<Message>('SELECT * FROM messages WHERE conversation_id=? ORDER BY created_at ASC, id ASC LIMIT ?', c.id, limit);
}
export async function markRead(userId: string, appId: string) {
  await q.run('UPDATE conversations SET unread=0 WHERE user_id=? AND app_id=?', userId, appId);
}
export function listConversations(userId: string) {
  return q.all<any>('SELECT * FROM conversations WHERE user_id=?', userId);
}
export { json };
