/**
 * وکالت — کاربر یک بار اجازه می‌دهد اپ در غیاب او و در محدوده‌ای مشخص عمل کند.
 * شش قاعده: سقف و انقضای اجباری · اعطا با پلهٔ بالاتر · واگذاری ممنوع · لغو یک‌طرفه و فوری ·
 * همه در یک صفحه · اطلاع بر هر مصرف.
 */
import { q } from '../db.js';
import { now } from '../util/ids.js';
import { toman } from '../util/persian.js';
import { isoToJalali } from '../util/jalali.js';
import { ledgerAppend } from '../ledger.js';
import * as chats from '../chats/service.js';
import { ContractDoc, contractAmount } from './model.js';
import { contractHash } from './hash.js';
import { createContract, ContractError, execute, setStatus, getContract, verifyAppSignature } from './engine.js';

export interface Delegation {
  id: string; user_id: string; app_id: string; contract_id: string; scope: string; label: string; cap: number; per_use_cap: number | null;
  spent: number; expires_at: string; status: string; created_at: string; revoked_at: string | null;
}
export function listDelegations(userId: string): Delegation[] {
  expire();
  return q.all<Delegation>('SELECT * FROM delegations WHERE user_id=? ORDER BY created_at DESC', userId);
}
export function expire() {
  q.run("UPDATE delegations SET status='expired' WHERE status='active' AND expires_at < ?", now());
}
export function revoke(userId: string, delegationId: string) {
  const d = q.get<Delegation>('SELECT * FROM delegations WHERE id=? AND user_id=?', delegationId, userId);
  if (!d) throw new ContractError('not_found', 'وکالت یافت نشد.', 404);
  if (d.status !== 'active') return d;
  q.run("UPDATE delegations SET status='revoked', revoked_at=? WHERE id=?", now(), delegationId);
  ledgerAppend('delegation.revoked', { delegationId, userId, appId: d.app_id }, { refType: 'delegation', refId: delegationId, userId, appId: d.app_id });
  chats.post(userId, d.app_id, 'system', `وکالت «${d.label}» لغو شد. از این لحظه اپ نمی‌تواند به نیابت از شما عمل کند.`, { unread: false });
  return q.get<Delegation>('SELECT * FROM delegations WHERE id=?', delegationId)!;
}

/**
 * اجرای اپ به نیابت از کاربر — کاربر حاضر نیست؛ امنیت از خودِ قرارداد وکالت می‌آید.
 * The app builds and signs a normal contract; the processor checks it against the delegation.
 */
export function executeUnderDelegation(appId: string, delegationId: string, doc: ContractDoc, appSignature: string) {
  expire();
  const d = q.get<Delegation>('SELECT * FROM delegations WHERE id=?', delegationId);
  if (!d) throw new ContractError('delegation', 'وکالت یافت نشد.', 404);
  if (d.app_id !== appId) throw new ContractError('delegation', 'وکیل نمی‌تواند وکالت را واگذار کند؛ این وکالت مال اپ دیگری است.', 403);
  if (d.status !== 'active') throw new ContractError('delegation', `وکالت ${d.status === 'revoked' ? 'لغو شده' : d.status === 'expired' ? 'منقضی شده' : 'تمام شده'} است.`, 403);
  if (doc.app_id !== appId) throw new ContractError('delegation', 'قرارداد باید از سوی همان اپ باشد.');
  if (!doc.parties.some((p) => p.id === `user:${d.user_id}`)) throw new ContractError('delegation', 'کاربر طرف قرارداد نیست.');
  if (doc.effects.some((e) => e.type !== 'wallet.pay' && e.type !== 'app.action')) throw new ContractError('delegation', 'زیر وکالت فقط پرداخت و اجرای خدمت مجاز است؛ مجوز یا وکالت تازه نمی‌شود داد.');
  if (doc.template_ref !== d.scope && doc.type !== d.scope) throw new ContractError('delegation', `این قرارداد خارج از محدودهٔ وکالت (${d.scope}) است.`);
  const amount = contractAmount(doc);
  if (d.per_use_cap && amount > d.per_use_cap) throw new ContractError('delegation', `مبلغ از سقف هر بار مصرف (${toman(d.per_use_cap)}) بیشتر است.`);
  if (d.spent + amount > d.cap) throw new ContractError('delegation', `سقف وکالت کافی نیست (باقی‌مانده ${toman(d.cap - d.spent)}).`);
  // The app must have built the contract in its final delegated form BEFORE signing:
  // delegation_id set, the delegation condition present, and the absent user not required to sign.
  if (doc.delegation_id !== delegationId) throw new ContractError('delegation', 'قرارداد باید به همین وکالت اشاره کند (delegation_id).');
  if (!doc.conditions.some((c: any) => c.type === 'delegation.active' && c.delegation_id === delegationId)) throw new ContractError('delegation', 'شرط delegation.active در قرارداد نیست.');
  if (doc.parties.some((p) => p.id === `user:${d.user_id}` && p.must_sign)) throw new ContractError('delegation', 'در اجرای زیر وکالت، کاربر غایب است و نباید امضاکننده باشد (must_sign=false).');
  const hash = contractHash(doc);
  if (!verifyAppSignature(appId, hash, appSignature).ok) throw new ContractError('app_signature', 'امضای اپ معتبر نیست.');
  const row = createContract(d.user_id, doc, appSignature, { origin: 'delegated', delegationId });
  setStatus(row.id, 'signed');
  let executed;
  try {
    executed = execute(row.id);
  } catch (e) {
    throw e;
  }
  q.run('UPDATE delegations SET spent = spent + ? WHERE id=?', amount, delegationId);
  q.run("INSERT INTO delegation_uses (id, delegation_id, contract_id, amount, created_at) VALUES (?,?,?,?,?)", 'use_' + row.id, delegationId, row.id, amount, now());
  const fresh = q.get<Delegation>('SELECT * FROM delegations WHERE id=?', delegationId)!;
  if (fresh.spent >= fresh.cap) q.run("UPDATE delegations SET status='exhausted' WHERE id=?", delegationId);
  ledgerAppend('delegation.used', { delegationId, contractId: row.id, amount, spent: fresh.spent, cap: fresh.cap }, { refType: 'delegation', refId: delegationId, userId: d.user_id, appId });
  // every use is announced — silent spending is what makes abuse invisible
  chats.post(d.user_id, appId, 'contract', doc.title, { contractId: row.id, unread: true, meta: { delegated: true } });
  chats.post(d.user_id, appId, 'event', `با وکالت «${d.label}» اجرا شد · ${toman(amount)} · باقی‌ماندهٔ سقف ${toman(Math.max(0, fresh.cap - fresh.spent))} · انقضا ${isoToJalali(fresh.expires_at)}`, { replyToContractId: row.id, unread: true });
  return { contract: getContract(row.id)!, delegation: fresh, executed };
}
