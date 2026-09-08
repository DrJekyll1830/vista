import { q } from '../db.js';
import { id, now } from '../util/ids.js';
import { ledgerAppend } from '../ledger.js';

export class WalletError extends Error { constructor(public code: string, message: string) { super(message); } }

export interface Wallet { user_id: string; balance: number; held: number; updated_at: string }
export function getWallet(userId: string): Wallet {
  let w = q.get<Wallet>('SELECT * FROM wallets WHERE user_id=?', userId);
  if (!w) {
    q.run('INSERT INTO wallets (user_id, balance, held, updated_at) VALUES (?,0,0,?)', userId, now());
    w = q.get<Wallet>('SELECT * FROM wallets WHERE user_id=?', userId)!;
  }
  return w;
}
export const available = (w: Wallet) => w.balance - w.held;

function txn(userId: string, kind: string, amount: number, w: Wallet, contractId?: string, appId?: string, memo?: string) {
  q.run('UPDATE wallets SET balance=?, held=?, updated_at=? WHERE user_id=?', w.balance, w.held, now(), userId);
  q.run('INSERT INTO wallet_txns (id, user_id, kind, amount, balance_after, held_after, contract_id, app_id, memo, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    id('txn'), userId, kind, amount, w.balance, w.held, contractId ?? null, appId ?? null, memo ?? null, now());
  ledgerAppend(`wallet.${kind}`, { userId, amount, balance: w.balance, held: w.held, contractId, appId, memo }, { refType: 'contract', refId: contractId, userId, appId });
}

/** کیف پول نزد ویستا (بعداً: حساب کاربر نزد بانک سینا). */
export const wallet = {
  credit(userId: string, amount: number, contractId?: string, memo?: string) {
    const w = getWallet(userId); w.balance += amount; txn(userId, 'topup', amount, w, contractId, 'wallet', memo); return w;
  },
  hold(userId: string, amount: number, contractId: string, appId: string) {
    const w = getWallet(userId);
    if (available(w) < amount) throw new WalletError('insufficient', 'موجودی کیف پول کافی نیست.');
    w.held += amount; txn(userId, 'hold', amount, w, contractId, appId); return w;
  },
  capture(userId: string, amount: number, contractId: string, appId: string, memo?: string) {
    const w = getWallet(userId);
    if (w.held < amount) throw new WalletError('hold_missing', 'مسدودی متناظر یافت نشد.');
    w.held -= amount; w.balance -= amount; txn(userId, 'capture', amount, w, contractId, appId, memo); return w;
  },
  release(userId: string, amount: number, contractId: string, appId: string) {
    const w = getWallet(userId);
    w.held = Math.max(0, w.held - amount); txn(userId, 'release', amount, w, contractId, appId); return w;
  },
  refund(userId: string, amount: number, contractId: string, appId: string, memo?: string) {
    const w = getWallet(userId); w.balance += amount; txn(userId, 'refund', amount, w, contractId, appId, memo); return w;
  },
  transactions(userId: string, limit = 100) {
    return q.all('SELECT * FROM wallet_txns WHERE user_id=? ORDER BY created_at DESC LIMIT ?', userId, limit);
  },
};
