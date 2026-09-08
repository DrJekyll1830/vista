import { q } from '../db.js';
import { id, now } from '../util/ids.js';
import { ledgerAppend } from '../ledger.js';

export class WalletError extends Error { constructor(public code: string, message: string) { super(message); } }

export interface Wallet { user_id: string; balance: number; held: number; updated_at: string }
export async function getWallet(userId: string): Promise<Wallet> {
  let w = await q.get<Wallet>('SELECT * FROM wallets WHERE user_id=?', userId);
  if (!w) {
    await q.run('INSERT INTO wallets (user_id, balance, held, updated_at) VALUES (?,0,0,?)', userId, now());
    w = (await q.get<Wallet>('SELECT * FROM wallets WHERE user_id=?', userId))!;
  }
  return w;
}
export const available = (w: Wallet) => w.balance - w.held;

async function txn(userId: string, kind: string, amount: number, w: Wallet, contractId?: string, appId?: string, memo?: string) {
  await q.run('UPDATE wallets SET balance=?, held=?, updated_at=? WHERE user_id=?', w.balance, w.held, now(), userId);
  await q.run('INSERT INTO wallet_txns (id, user_id, kind, amount, balance_after, held_after, contract_id, app_id, memo, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    id('txn'), userId, kind, amount, w.balance, w.held, contractId ?? null, appId ?? null, memo ?? null, now());
  await ledgerAppend(`wallet.${kind}`, { userId, amount, balance: w.balance, held: w.held, contractId, appId, memo }, { refType: 'contract', refId: contractId, userId, appId });
}

/** کیف پول نزد ویستا (بعداً: حساب کاربر نزد بانک سینا). */
export const wallet = {
  async credit(userId: string, amount: number, contractId?: string, memo?: string) {
    const w = await getWallet(userId); w.balance += amount; await txn(userId, 'topup', amount, w, contractId, 'wallet', memo); return w;
  },
  async hold(userId: string, amount: number, contractId: string, appId: string) {
    const w = await getWallet(userId);
    if (available(w) < amount) throw new WalletError('insufficient', 'موجودی کیف پول کافی نیست.');
    w.held += amount; await txn(userId, 'hold', amount, w, contractId, appId); return w;
  },
  async capture(userId: string, amount: number, contractId: string, appId: string, memo?: string) {
    const w = await getWallet(userId);
    if (w.held < amount) throw new WalletError('hold_missing', 'مسدودی متناظر یافت نشد.');
    w.held -= amount; w.balance -= amount; await txn(userId, 'capture', amount, w, contractId, appId, memo); return w;
  },
  async release(userId: string, amount: number, contractId: string, appId: string) {
    const w = await getWallet(userId);
    w.held = Math.max(0, w.held - amount); await txn(userId, 'release', amount, w, contractId, appId); return w;
  },
  async refund(userId: string, amount: number, contractId: string, appId: string, memo?: string) {
    const w = await getWallet(userId); w.balance += amount; await txn(userId, 'refund', amount, w, contractId, appId, memo); return w;
  },
  async transactions(userId: string, limit = 100) {
    return q.all('SELECT * FROM wallet_txns WHERE user_id=? ORDER BY created_at DESC LIMIT ?', userId, limit);
  },
};
