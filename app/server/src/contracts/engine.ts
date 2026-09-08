import { z } from 'zod';
import { config } from '../config.js';
import { q, json } from '../db.js';
import { id, now } from '../util/ids.js';
import { hmacHex } from '../util/crypto.js';
import { toman } from '../util/persian.js';
import { formatJalaliDateTime } from '../util/jalali.js';
import { ledgerAppend } from '../ledger.js';
import { wallet, WalletError } from '../wallet/service.js';
import * as chats from '../chats/service.js';
import { ContractDoc, ContractStatus, Rung, Effect, contractAmount, EVENT_LABELS } from './model.js';
import { contractHash } from './hash.js';
import { ensureKey, platformSign, verifySig } from './keys.js';
import { canonicalJson } from '../util/canonical.js';

export class ContractError extends Error { constructor(public code: string, message: string, public status = 400) { super(message); } }

// ───────────────────────── validation ─────────────────────────
const clauseSchema = z.object({ key: z.string().min(1), label: z.string().min(1), value: z.union([z.string(), z.number(), z.null()]), kind: z.enum(['text', 'amount', 'date', 'phone', 'number', 'list', 'note']).optional(), visible_to: z.array(z.string()).optional() });
const partySchema = z.object({ id: z.string().min(1), kind: z.enum(['app', 'user', 'platform']), role: z.string(), label: z.string(), must_sign: z.boolean(), visible_clauses: z.array(z.string()).optional() });
const effectSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('wallet.pay'), amount: z.number().int().positive(), payee_app_id: z.string(), memo: z.string().optional() }),
  z.object({ type: z.literal('wallet.topup'), amount: z.number().int().positive() }),
  z.object({ type: z.literal('app.install'), app_id: z.string(), permissions: z.array(z.string()) }),
  z.object({ type: z.literal('permission.grant'), app_id: z.string(), permissions: z.array(z.string()) }),
  z.object({ type: z.literal('delegation.grant'), app_id: z.string(), scope: z.string().min(1), label: z.string().min(1), cap: z.number().int().positive(), per_use_cap: z.number().int().positive().optional(), expires_at: z.string() }),
  z.object({ type: z.literal('genesis'), system_apps: z.array(z.string()) }),
  z.object({ type: z.literal('app.action'), action: z.string(), params: z.record(z.unknown()) }),
]);
export const contractDocSchema = z.object({
  vista: z.literal('1'),
  id: z.string().min(4), version: z.number().int().positive(), prev_version_id: z.string().nullable(),
  type: z.string().min(1), template_ref: z.string(), app_id: z.string().min(1), title: z.string().min(1),
  parties: z.array(partySchema).min(2), clauses: z.array(clauseSchema), open_clauses: z.array(z.object({ key: z.string(), owner: z.string(), label: z.string(), kind: z.string().optional() })),
  conditions: z.array(z.object({ type: z.string() }).passthrough()), effects: z.array(effectSchema), fees: z.array(z.object({ beneficiary: z.string(), amount: z.number().int().nonnegative(), label: z.string().optional(), visible: z.boolean().optional() })),
  policy: z.object({ min_rung: z.number().int().min(1).max(5), quorum: z.literal('all'), settlement: z.enum(['immediate', 'on_delivery']) }),
  appearance: z.object({ color: z.string(), logo: z.string(), display_name: z.string() }),
  nonce: z.string().min(8), created_at: z.string(), expires_at: z.string(), delegation_id: z.string().optional(),
});

export interface ContractRow {
  id: string; user_id: string; app_id: string; version: number; prev_version_id: string | null; type: string; template_ref: string | null;
  title: string; amount: number; status: ContractStatus; doc_json: string; canonical_hash: string; nonce: string; required_rung: number;
  expires_at: string | null; share_token: string | null; origin: string; delegation_id: string | null; created_at: string; executed_at: string | null; settled_at: string | null;
}
export const docOf = (row: ContractRow): ContractDoc => JSON.parse(row.doc_json);

/** پله‌ای که سکو برای این قرارداد لازم می‌داند: کف قالب، بالا برده‌شده با سقف مبلغ و نوع اثر. */
export function requiredRung(doc: ContractDoc): Rung {
  let r: number = doc.policy.min_rung;
  const amt = contractAmount(doc);
  if (amt > config.ceilings.rung1) r = Math.max(r, 2);
  if (amt > config.ceilings.rung2) r = Math.max(r, 3);
  if (doc.effects.some((e) => e.type === 'delegation.grant')) r = Math.max(r, 2);
  if (doc.effects.some((e) => (e.type === 'app.install' || e.type === 'permission.grant') && e.permissions.some((p) => p.startsWith('financial:')))) r = Math.max(r, 2);
  return r as Rung;
}

function appRow(appId: string) { return q.get<any>('SELECT * FROM apps WHERE id=?', appId); }

/** Verify an app's signature over a hash. In-process apps (system, sample) use app_keys; external apps use the pinned manifest key. */
export function verifyAppSignature(appId: string, hash: string, signature: string | undefined): { ok: boolean; signer: string } {
  const app = appRow(appId);
  if (!app) return { ok: false, signer: 'unknown' };
  if (!signature) return { ok: false, signer: 'none' };
  const local = q.get<{ public_key: string }>('SELECT public_key FROM app_keys WHERE app_id=?', appId);
  if (local && verifySig(local.public_key, hash, signature)) return { ok: true, signer: `app:${appId}` };
  if (app.public_key && verifySig(app.public_key, hash, signature)) return { ok: true, signer: `app:${appId}` };
  if (verifySig(ensureKey('platform').publicKey, hash, signature)) return { ok: true, signer: 'platform-on-behalf' };
  return { ok: false, signer: 'invalid' };
}

/**
 * ثبت قرارداد تازه. اپ قبلاً امضا کرده (یا سکو از طرف اپ بی‌کلید). کاربر آخر امضا می‌کند.
 * If the doc has open clauses it is stored as a draft with no signatures.
 */
export function createContract(userId: string, rawDoc: unknown, appSignature: string | undefined, opts: { origin?: 'assistant' | 'app' | 'system' | 'delegated'; delegationId?: string } = {}): ContractRow {
  const parsed = contractDocSchema.safeParse(rawDoc);
  if (!parsed.success) throw new ContractError('doc_invalid', 'ساختار قرارداد نامعتبر است: ' + parsed.error.issues.slice(0, 3).map((i) => i.path.join('.') + ' ' + i.message).join('؛ '));
  const doc = parsed.data as ContractDoc;
  const app = appRow(doc.app_id);
  if (!app) throw new ContractError('app_unknown', 'اپ سازندهٔ قرارداد شناخته نشده است.');
  if (q.get('SELECT 1 FROM contracts WHERE id=?', doc.id)) throw new ContractError('dup', 'شناسهٔ قرارداد تکراری است.');
  if (q.get('SELECT 1 FROM contracts WHERE nonce=?', doc.nonce)) throw new ContractError('nonce', 'یکتای قرارداد قبلاً استفاده شده است.');
  // The user must be a party (unless a phone party will be resolved on share).
  const userParty = doc.parties.find((p) => p.id === `user:${userId}`);
  if (!userParty) throw new ContractError('party', 'شما طرف این قرارداد نیستید.');
  // Money effects must name this app as payee (an app cannot route money to another app).
  for (const e of doc.effects) {
    if (e.type === 'wallet.pay' && e.payee_app_id !== doc.app_id) throw new ContractError('payee', 'اپ نمی‌تواند پرداخت را به اپ دیگری هدایت کند.');
    if ((e.type === 'app.install' || e.type === 'permission.grant' || e.type === 'delegation.grant') && e.app_id !== doc.app_id) throw new ContractError('scope', 'اثر قرارداد خارج از محدودهٔ اپ است.');
    if (e.type === 'delegation.grant') {
      if (!app.verified) throw new ContractError('unverified', 'فقط اپ احرازشده می‌تواند اختیار مالی (وکالت) بخواهد.');
      if (new Date(e.expires_at).getTime() <= Date.now()) throw new ContractError('delegation_expiry', 'انقضای وکالت باید در آینده باشد.');
      if (new Date(e.expires_at).getTime() > Date.now() + 366 * 86_400_000) throw new ContractError('delegation_expiry', 'وکالت بیش از یک سال مجاز نیست.');
    }
  }
  if (new Date(doc.expires_at).getTime() <= Date.now()) throw new ContractError('expired', 'قرارداد پیش از ثبت منقضی شده است.');
  const hash = contractHash(doc);
  const isDraft = doc.open_clauses.length > 0;
  let status: ContractStatus = isDraft ? 'draft' : 'awaiting';
  let signer = 'none';
  if (!isDraft) {
    const v = verifyAppSignature(doc.app_id, hash, appSignature);
    if (!v.ok) throw new ContractError('app_signature', 'امضای اپ روی قرارداد معتبر نیست.');
    signer = v.signer;
  }
  const rung = requiredRung(doc);
  const amount = contractAmount(doc);
  q.tx(() => {
    q.run(`INSERT INTO contracts (id, user_id, app_id, version, prev_version_id, type, template_ref, title, amount, status, doc_json, canonical_hash, nonce, required_rung, expires_at, origin, delegation_id, created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      doc.id, userId, doc.app_id, doc.version, doc.prev_version_id, doc.type, doc.template_ref, doc.title, amount, status, JSON.stringify(doc), hash, doc.nonce, rung, doc.expires_at, opts.origin ?? 'app', opts.delegationId ?? null, now());
    if (!isDraft) {
      q.run('INSERT INTO signatures (id, contract_id, version, party_id, party_kind, rung, hash, signature, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
        id('sig'), doc.id, doc.version, `app:${doc.app_id}`, signer === 'platform-on-behalf' ? 'platform' : 'app', 1, hash, appSignature!, now());
    }
    ledgerAppend('contract.created', { contractId: doc.id, version: doc.version, hash, status, appId: doc.app_id, amount, requiredRung: rung, origin: opts.origin ?? 'app' }, { refType: 'contract', refId: doc.id, userId, appId: doc.app_id });
  });
  const row = getContract(doc.id)!;
  if (opts.origin !== 'delegated') chats.post(userId, doc.app_id, 'contract', doc.title, { contractId: doc.id, unread: opts.origin !== 'assistant' });
  return row;
}

export function getContract(cid: string): ContractRow | undefined { return q.get<ContractRow>('SELECT * FROM contracts WHERE id=?', cid); }
export function listContracts(userId: string, appId?: string) {
  return appId
    ? q.all<ContractRow>('SELECT * FROM contracts WHERE user_id=? AND app_id=? ORDER BY created_at DESC', userId, appId)
    : q.all<ContractRow>('SELECT * FROM contracts WHERE user_id=? ORDER BY created_at DESC', userId);
}
export function signaturesOf(cid: string) { return q.all<any>('SELECT id, party_id, party_kind, rung, hash, created_at, device FROM signatures WHERE contract_id=? ORDER BY created_at', cid); }
export function eventsOf(cid: string) { return q.all<any>('SELECT * FROM events WHERE contract_id=? ORDER BY created_at', cid); }

/** آنچه کاربر می‌بیند — چیدمان مال سکوست؛ اپ فقط رنگ و نشان و نام می‌دهد. */
export function projection(row: ContractRow, viewerPartyId: string) {
  const doc = docOf(row);
  const app = appRow(doc.app_id);
  const party = doc.parties.find((p) => p.id === viewerPartyId);
  const canSee = (c: ContractDoc['clauses'][number]) => {
    if (party?.visible_clauses && !party.visible_clauses.includes(c.key)) return false;
    if (c.visible_to && party && !c.visible_to.includes(party.id) && !c.visible_to.includes(party.role)) return false;
    return true;
  };
  const sigs = signaturesOf(row.id);
  const signedIds = new Set(sigs.map((s) => s.party_id));
  const amount = contractAmount(doc);
  const money = doc.effects.filter((e) => e.type === 'wallet.pay' || e.type === 'wallet.topup' || e.type === 'delegation.grant');
  return {
    id: row.id, version: doc.version, type: doc.type, title: doc.title, status: row.status,
    app: { id: doc.app_id, name: doc.appearance.display_name || app?.name, color: doc.appearance.color || app?.color, logo: doc.appearance.logo || app?.logo, verified: !!app?.verified },
    clauses: doc.clauses.filter(canSee).map((c) => ({ key: c.key, label: c.label, value: c.kind === 'amount' && typeof c.value === 'number' ? toman(c.value) : c.value, kind: c.kind ?? 'text' })),
    open_clauses: doc.open_clauses,
    amount, amount_label: amount ? toman(amount) : null,
    money_kind: money[0]?.type ?? null,
    fees: doc.fees.filter((f) => f.visible).map((f) => ({ label: f.label ?? f.beneficiary, amount: toman(f.amount) })),
    parties: doc.parties.map((p) => ({ id: p.id, label: p.label, role: p.role, must_sign: p.must_sign, signed: signedIds.has(p.id), is_me: p.id === viewerPartyId })),
    required_rung: row.required_rung, settlement: doc.policy.settlement,
    expires_at: doc.expires_at, expires_label: formatJalaliDateTime(doc.expires_at), created_label: formatJalaliDateTime(row.created_at),
    hash: row.canonical_hash, hash_short: row.canonical_hash.slice(0, 8),
    delegation_id: row.delegation_id, origin: row.origin,
    events: eventsOf(row.id).map((e) => ({ id: e.id, type: e.type, label: EVENT_LABELS[e.type] ?? e.type, text: e.text, actor: e.actor_kind, at: e.created_at, at_label: formatJalaliDateTime(e.created_at) })),
    signatures: sigs.map((s) => ({ party_id: s.party_id, kind: s.party_kind, rung: s.rung, at: s.created_at })),
  };
}

// ───────────────────────── signing ─────────────────────────
export interface SignInput { rung: Rung; otpId?: string; device?: string; sessionToken: string; viewed: unknown }

export function checkSignable(row: ContractRow, userId: string) {
  if (row.status !== 'awaiting') throw new ContractError('status', row.status === 'draft' ? 'این هنوز پیش‌نویس است و امضایی روی آن نمی‌نشیند.' : 'این قرارداد در وضعیت امضا نیست.');
  if (row.expires_at && row.expires_at < now()) { setStatus(row.id, 'expired'); throw new ContractError('expired', 'مهلت این قرارداد گذشته است.'); }
  const doc = docOf(row);
  const party = doc.parties.find((p) => p.id === `user:${userId}`);
  if (!party || !party.must_sign) throw new ContractError('party', 'شما امضاکنندهٔ این قرارداد نیستید.');
  if (q.get('SELECT 1 FROM signatures WHERE contract_id=? AND version=? AND party_id=?', row.id, row.version, party.id)) throw new ContractError('dup_sig', 'شما قبلاً این نسخه را امضا کرده‌اید.');
  if (row.required_rung >= 3) throw new ContractError('rung_unavailable', `این قرارداد به امضای پلهٔ ${row.required_rung} نیاز دارد که در این نسخه در دسترس نیست.`);
  const app = appRow(row.app_id);
  if (app && app.health === 'down' && app.kind !== 'system') throw new ContractError('app_down', 'این اپ در دسترس نیست و قراردادش فعلاً قابل امضا نیست.');
  return party;
}

/** امضای کاربر — پلهٔ ۱ (درخواست احرازشده) یا پلهٔ ۲ (رمز یک‌بارمصرف که به هش گره خورده). */
export function signContract(userId: string, cid: string, input: SignInput): ContractRow {
  const row = getContract(cid);
  if (!row) throw new ContractError('not_found', 'قرارداد یافت نشد.', 404);
  const party = checkSignable(row, userId);
  if (input.rung < row.required_rung) throw new ContractError('rung', `این قرارداد به امضای پلهٔ ${row.required_rung} نیاز دارد.`);
  if (input.rung === 2) {
    const otp = input.otpId ? q.get<any>('SELECT * FROM otps WHERE id=? AND purpose=? AND ref=? AND consumed_at IS NOT NULL', input.otpId, 'sign', row.canonical_hash) : null;
    if (!otp) throw new ContractError('otp', 'رمز یک‌بارمصرف این قرارداد تأیید نشده است.');
    if (q.get('SELECT 1 FROM signatures WHERE otp_id=?', input.otpId)) throw new ContractError('otp_reused', 'این رمز قبلاً برای امضا استفاده شده است.');
  }
  const ts = now();
  // rung-1 evidence: platform-keyed record binding hash × user × session × time
  const evidence = hmacHex(config.platformSecret, `sign|${row.canonical_hash}|${userId}|${input.sessionToken}|${ts}|r${input.rung}`);
  q.tx(() => {
    q.run('INSERT INTO signatures (id, contract_id, version, party_id, party_kind, rung, hash, signature, otp_id, session_hint, device, viewed_json, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      id('sig'), row.id, row.version, party.id, 'user', input.rung, row.canonical_hash, evidence, input.otpId ?? null, input.sessionToken.slice(-8), input.device ?? null, JSON.stringify(input.viewed ?? projection(row, party.id)), ts);
    ledgerAppend('contract.signed', { contractId: row.id, version: row.version, party: party.id, rung: input.rung, hash: row.canonical_hash, viewed: input.viewed ?? projection(row, party.id) }, { refType: 'contract', refId: row.id, userId, appId: row.app_id });
  });
  // quorum: all must_sign parties
  const doc = docOf(row);
  const signed = new Set(q.all<any>('SELECT party_id FROM signatures WHERE contract_id=? AND version=?', row.id, row.version).map((s) => s.party_id));
  const missing = doc.parties.filter((p) => p.must_sign && !signed.has(p.id));
  if (missing.length === 0) {
    setStatus(row.id, 'signed');
    return execute(row.id);
  }
  return getContract(cid)!;
}

export function rejectContract(userId: string, cid: string, reason?: string) {
  const row = getContract(cid);
  if (!row) throw new ContractError('not_found', 'قرارداد یافت نشد.', 404);
  if (row.user_id !== userId) throw new ContractError('party', 'شما طرف این قرارداد نیستید.');
  if (!['awaiting', 'draft'].includes(row.status)) throw new ContractError('status', 'این قرارداد دیگر قابل رد کردن نیست.');
  setStatus(cid, 'rejected');
  ledgerAppend('contract.rejected', { contractId: cid, reason }, { refType: 'contract', refId: cid, userId, appId: row.app_id });
  chats.post(userId, row.app_id, 'event', 'قرارداد رد شد', { replyToContractId: cid, unread: false });
  return getContract(cid)!;
}

export function setStatus(cid: string, status: ContractStatus) {
  const extra = status === 'executing' || status === 'settled' ? ', executed_at = COALESCE(executed_at, ?)' : '';
  if (extra) q.run(`UPDATE contracts SET status=?${extra}${status === 'settled' ? ', settled_at=?' : ''} WHERE id=?`, status, now(), ...(status === 'settled' ? [now()] : []), cid);
  else q.run('UPDATE contracts SET status=? WHERE id=?', status, cid);
}

// ───────────────────────── events ─────────────────────────
/** رویداد — امضاشده است اما امضا روی قرارداد نیست. Applies wallet consequences and posts a reply in the app's chat. */
export function recordEvent(cid: string, type: string, actorKind: 'app' | 'user' | 'platform', actorId: string, text = '', payload: Record<string, unknown> = {}, signature?: string) {
  const row = getContract(cid);
  if (!row) throw new ContractError('not_found', 'قرارداد یافت نشد.', 404);
  const doc = docOf(row);
  const pay = doc.effects.find((e) => e.type === 'wallet.pay') as Extract<Effect, { type: 'wallet.pay' }> | undefined;
  const held = eventsOf(cid).some((e) => e.type === 'held') && !eventsOf(cid).some((e) => ['deducted', 'released', 'cancelled', 'refunded'].includes(e.type));
  q.tx(() => {
    const eid = id('evt');
    q.run('INSERT INTO events (id, contract_id, type, actor_kind, actor_id, text, payload_json, signature, created_at) VALUES (?,?,?,?,?,?,?,?,?)', eid, cid, type, actorKind, actorId, text, JSON.stringify(payload), signature ?? null, now());
    ledgerAppend('contract.event', { contractId: cid, type, actorKind, actorId, text, payload }, { refType: 'contract', refId: cid, userId: row.user_id, appId: row.app_id });
    switch (type) {
      case 'delivered':
        if (pay && held) { wallet.capture(row.user_id, pay.amount, cid, row.app_id, doc.title); insertEvent(cid, 'deducted', 'platform', 'processor'); }
        setStatus(cid, 'settled');
        break;
      case 'cancelled':
        if (pay && held) wallet.release(row.user_id, pay.amount, cid, row.app_id);
        setStatus(cid, 'cancelled');
        break;
      case 'failed':
        if (pay && held) wallet.release(row.user_id, pay.amount, cid, row.app_id);
        setStatus(cid, 'failed');
        break;
      case 'refunded':
        if (pay) wallet.refund(row.user_id, Number(payload.amount ?? pay.amount), cid, row.app_id, doc.title);
        setStatus(cid, 'refunded');
        break;
      case 'disputed':
        setStatus(cid, 'disputed');
        break;
    }
  });
  const label = EVENT_LABELS[type] ?? type;
  chats.post(row.user_id, row.app_id, 'event', text ? `${label} — ${text}` : label, { replyToContractId: cid, unread: actorKind !== 'user' });
  if (type === 'delivered' && pay && held) chats.post(row.user_id, row.app_id, 'event', EVENT_LABELS.deducted, { replyToContractId: cid, unread: false });
  if (type === 'disputed') chats.post(row.user_id, 'support', 'system', `اعتراض شما دربارهٔ «${doc.title}» ثبت شد و قرارداد در وضعیت «در اختلاف» است. پشتیبانی رسیدگی می‌کند.`, { replyToContractId: cid, unread: true });
  return getContract(cid)!;
}
function insertEvent(cid: string, type: string, actorKind: string, actorId: string, text = '') {
  q.run('INSERT INTO events (id, contract_id, type, actor_kind, actor_id, text, payload_json, created_at) VALUES (?,?,?,?,?,?,?,?)', id('evt'), cid, type, actorKind, actorId, text, '{}', now());
}

// ───────────────────────── processor ─────────────────────────
export type Fulfiller = (row: ContractRow, doc: ContractDoc, platformSignature: string) => Promise<{ events: { type: string; text?: string; payload?: Record<string, unknown> }[] } | null>;
let fulfiller: Fulfiller | null = null;
export function setFulfiller(f: Fulfiller) { fulfiller = f; }
type EffectHook = (row: ContractRow, effect: Effect) => void;
const effectHooks: Partial<Record<Effect['type'], EffectHook>> = {};
export function onEffect(type: Effect['type'], hook: EffectHook) { effectHooks[type] = hook; }

/**
 * پردازشگر — کارش بررسی است، نه تصمیم: امضاها، حد نصاب، پله، سقف و انقضا، یکتایی؛ سپس اجرا.
 * The assistant has no path here.
 */
export function execute(cid: string): ContractRow {
  const row = getContract(cid)!;
  const doc = docOf(row);
  if (row.status !== 'signed') throw new ContractError('status', 'قرارداد در وضعیت اجرا نیست.');
  if (row.executed_at) throw new ContractError('replay', 'این قرارداد قبلاً اجرا شده است.');
  if (row.expires_at && row.expires_at < now()) { setStatus(cid, 'expired'); throw new ContractError('expired', 'قرارداد منقضی شده است.'); }
  // 1. signatures bind to this exact hash, 2. quorum, 3. rung
  const hash = contractHash(doc);
  if (hash !== row.canonical_hash) throw new ContractError('hash', 'هش قرارداد با نسخهٔ ثبت‌شده نمی‌خواند.');
  const sigs = q.all<any>('SELECT * FROM signatures WHERE contract_id=? AND version=?', cid, row.version);
  for (const p of doc.parties.filter((p) => p.must_sign)) {
    const s = sigs.find((x) => x.party_id === p.id);
    if (!s || s.hash !== hash) throw new ContractError('quorum', `امضای ${p.label} روی این نسخه نیست.`);
    if (p.kind === 'user' && s.rung < row.required_rung) throw new ContractError('rung', 'پلهٔ امضا کافی نیست.');
    if (p.kind === 'app' && !verifyAppSignature(doc.app_id, hash, s.signature).ok) throw new ContractError('app_signature', 'امضای اپ معتبر نیست.');
  }
  // 4. conditions
  for (const c of doc.conditions) {
    if (c.type === 'wallet.sufficient') {
      const amt = contractAmount(doc);
      const w = wallet.hold; void w;
    }
    if (c.type === 'delegation.active') {
      const d = q.get<any>('SELECT * FROM delegations WHERE id=?', c.delegation_id);
      if (!d || d.status !== 'active' || d.expires_at < now()) throw new ContractError('delegation', 'وکالت فعال نیست.');
    }
  }
  // 5. effects, atomically
  let pending = false;
  try {
    q.tx(() => {
      for (const e of doc.effects) {
        switch (e.type) {
          case 'wallet.pay': {
            wallet.hold(row.user_id, e.amount, cid, row.app_id);
            insertEvent(cid, 'held', 'platform', 'processor');
            if (doc.policy.settlement === 'immediate') {
              wallet.capture(row.user_id, e.amount, cid, row.app_id, doc.title);
              insertEvent(cid, 'deducted', 'platform', 'processor');
            }
            for (const f of doc.fees) ledgerAppend('fee.recorded', { contractId: cid, beneficiary: f.beneficiary, amount: f.amount }, { refType: 'contract', refId: cid, userId: row.user_id, appId: row.app_id });
            break;
          }
          case 'wallet.topup': pending = true; break; // credited when the gateway confirms
          case 'app.install': case 'permission.grant': case 'delegation.grant': case 'genesis': case 'app.action': {
            effectHooks[e.type]?.(row, e);
            break;
          }
        }
      }
      ledgerAppend('contract.executed', { contractId: cid, hash, effects: doc.effects.map((e) => e.type) }, { refType: 'contract', refId: cid, userId: row.user_id, appId: row.app_id });
      setStatus(cid, 'executing');
    });
  } catch (e: any) {
    const msg = e instanceof WalletError || e instanceof ContractError ? e.message : 'اجرا ناموفق بود';
    setStatus(cid, 'failed');
    insertEvent(cid, 'failed', 'platform', 'processor', msg);
    ledgerAppend('contract.failed', { contractId: cid, reason: msg }, { refType: 'contract', refId: cid, userId: row.user_id, appId: row.app_id });
    chats.post(row.user_id, row.app_id, 'event', `${EVENT_LABELS.failed} — ${msg}`, { replyToContractId: cid });
    throw new ContractError('exec_failed', msg);
  }
  const pay = doc.effects.find((e) => e.type === 'wallet.pay');
  if (pay) chats.post(row.user_id, row.app_id, 'event', doc.policy.settlement === 'immediate' ? EVENT_LABELS.deducted : EVENT_LABELS.held, { replyToContractId: cid, unread: false });
  // nothing more to wait for?
  const needsApp = !!fulfiller && doc.effects.some((e) => e.type === 'wallet.pay' || e.type === 'app.action' || e.type === 'delegation.grant');
  if (!needsApp && !pending) setStatus(cid, 'settled');
  if (needsApp) void fulfil(cid);
  return getContract(cid)!;
}

/** Ask the app to deliver, over MCP, with the platform's signature on the executed hash. */
export async function fulfil(cid: string) {
  const row = getContract(cid);
  if (!row || !fulfiller) return;
  const doc = docOf(row);
  const app = appRow(row.app_id);
  if (!app || app.kind === 'system') { if (row.status === 'executing' && !doc.effects.some((e) => e.type === 'wallet.topup')) setStatus(cid, 'settled'); return; }
  try {
    const res = await fulfiller(row, doc, platformSign(`executed|${row.canonical_hash}`));
    if (!res) { if (row.status === 'executing' && doc.policy.settlement === 'immediate') setStatus(cid, 'settled'); return; }
    for (const ev of res.events ?? []) recordEvent(cid, ev.type, 'app', row.app_id, ev.text ?? '', ev.payload ?? {});
    const fresh = getContract(cid)!;
    // Immediate settlement: money already moved; the app has answered, so the contract is settled (delivery events are informational).
    if (fresh.status === 'executing' && doc.policy.settlement === 'immediate') setStatus(cid, 'settled');
  } catch (e: any) {
    console.error('[fulfil]', cid, e?.message ?? e);
    insertEvent(cid, 'note', 'platform', 'processor', 'اپ در لحظهٔ اجرا پاسخ نداد؛ دوباره تلاش می‌شود.');
    chats.post(row.user_id, row.app_id, 'event', 'اپ در لحظهٔ اجرا پاسخ نداد؛ دوباره تلاش می‌شود.', { replyToContractId: cid, unread: false });
  }
}
/** Retry contracts still waiting on their app. */
export async function retryPending() {
  const rows = q.all<ContractRow>("SELECT * FROM contracts WHERE status='executing' AND executed_at < ? AND executed_at > ?", new Date(Date.now() - 60_000).toISOString(), new Date(Date.now() - 24 * 3_600_000).toISOString());
  for (const r of rows) {
    const doc = docOf(r);
    if (doc.effects.some((e) => e.type === 'wallet.topup')) continue;
    if (!doc.effects.some((e) => e.type === 'wallet.pay' || e.type === 'app.action')) { setStatus(r.id, 'settled'); continue; }
    await fulfil(r.id);
  }
}
/** Expire awaiting contracts past their deadline. */
export function expireStale() {
  const rows = q.all<ContractRow>("SELECT * FROM contracts WHERE status IN ('awaiting','draft') AND expires_at < ?", now());
  for (const r of rows) { setStatus(r.id, 'expired'); chats.post(r.user_id, r.app_id, 'event', 'مهلت قرارداد گذشت و منقضی شد', { replyToContractId: r.id, unread: false }); }
}

/** Signed event envelope check for app-posted events. */
export function verifyEventSignature(appId: string, body: { contract_id: string; type: string; text?: string; payload?: unknown; ts: string }, signature: string) {
  return verifyAppSignature(appId, canonicalJson({ contract_id: body.contract_id, type: body.type, text: body.text ?? '', payload: body.payload ?? {}, ts: body.ts }), signature).ok;
}
export { json, toman };
