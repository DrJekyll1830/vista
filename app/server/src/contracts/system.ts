/**
 * قراردادهای سیستمی — ساخته‌شده توسط خودِ سکو: قرارداد آغاز، شارژ کیف پول، استارت اپ، اعطای مجوز.
 * ماژول سیستمی از اجازه گرفتن معاف است، نه از قرارداد دادن.
 */
import { q, json } from '../db.js';
import { id, now, plusMinutes, plusDays } from '../util/ids.js';
import { toman } from '../util/persian.js';
import { isoToJalali } from '../util/jalali.js';
import { ContractDoc, Effect } from './model.js';
import { contractHash } from './hash.js';
import { signWithKey, platformSign } from './keys.js';
import { createContract, ContractRow, onEffect, getContract, docOf, setStatus, recordEvent } from './engine.js';
import { ledgerAppend } from '../ledger.js';
import * as chats from '../chats/service.js';
import { wallet } from '../wallet/service.js';
import type { User } from '../auth/service.js';

export const SYSTEM_APPS = ['assistant', 'showcase', 'wallet', 'contracts', 'support', 'settings'];
const userLabel = (u: User) => (u.first_name ? `${u.first_name} ${u.last_name ?? ''}`.trim() : u.phone);
const app = (appId: string) => q.get<any>('SELECT * FROM apps WHERE id=?', appId);

function base(appId: string, u: User, type: string, title: string, ttlMinutes: number): ContractDoc {
  const a = app(appId);
  return {
    vista: '1', id: id('ctr'), version: 1, prev_version_id: null, type, template_ref: `vista/${type}`, app_id: appId, title,
    parties: [
      { id: `app:${appId}`, kind: appId === 'vista' ? 'platform' : 'app', role: 'provider', label: a?.name ?? 'ویستا', must_sign: true },
      { id: `user:${u.id}`, kind: 'user', role: 'initiator', label: userLabel(u), must_sign: true },
    ],
    clauses: [], open_clauses: [], conditions: [], effects: [], fees: [],
    policy: { min_rung: 1, quorum: 'all', settlement: 'immediate' },
    appearance: { color: a?.color ?? '#2C5FA8', logo: a?.logo ?? 'و', display_name: a?.name ?? 'ویستا' },
    nonce: id('n', 20), created_at: now(), expires_at: plusMinutes(ttlMinutes),
  };
}
function submit(u: User, doc: ContractDoc, origin: 'assistant' | 'app' | 'system' = 'system'): ContractRow {
  const hash = contractHash(doc);
  const sig = doc.app_id === 'vista' ? platformSign(hash) : signWithKey(doc.app_id, hash);
  return createContract(u.id, doc, sig, { origin });
}

/** قرارداد آغاز — نخستین اجرا: شش اپ سیستمی و کار هر کدام. */
export function buildGenesis(u: User): ContractRow {
  const doc = base('vista', u, 'genesis', 'قرارداد آغاز', 24 * 60);
  const apps = SYSTEM_APPS.map((a) => app(a)).filter(Boolean);
  doc.clauses = [
    { key: 'subject', label: 'موضوع', value: 'نصب ویستا و اپ‌های سیستمی' },
    { key: 'apps', label: 'اپ‌های سیستمی', value: apps.map((a) => `${a.name}: ${a.description}`).join('\n'), kind: 'list' },
    { key: 'rule', label: 'قاعده', value: 'اپ سیستمی از اجازه گرفتن معاف است، نه از قرارداد دادن. هیچ پولی بدون قرارداد امضاشده جابه‌جا نمی‌شود و هیچ اپی بدون قرارداد استارت نصب نمی‌شود.', kind: 'note' },
    { key: 'assistant', label: 'دستیار', value: 'می‌خواند، می‌فهمد و قرارداد می‌آورد؛ هرگز امضا نمی‌کند و به اجرا دسترسی ندارد.', kind: 'note' },
    { key: 'wallet', label: 'کیف پول', value: 'در این نسخه، کیف پول نزد ویستا نگهداری می‌شود و در نسخهٔ بعد به حساب شما نزد بانک سینا منتقل می‌شود.', kind: 'note' },
    { key: 'identity', label: 'هویت', value: `شمارهٔ ${u.phone} · کد ملی ${u.national_id?.slice(0, 3)}****${u.national_id?.slice(-3)} · تطبیق شاهکار: ${u.shahkar_matched ? 'انجام شد' : 'انجام نشد'}` },
  ];
  doc.effects = [{ type: 'genesis', system_apps: SYSTEM_APPS }];
  return submit(u, doc);
}

/** شارژ کیف پول — قرارداد میان کاربر و «مالی»؛ پس از تأیید درگاه اجرا می‌شود. */
export function buildTopup(u: User, amount: number, origin: 'assistant' | 'system' = 'system'): ContractRow {
  if (!Number.isInteger(amount) || amount < 10_000 || amount > 50_000_000) throw new Error('مبلغ شارژ باید میان ۱۰ هزار و ۵۰ میلیون تومان باشد.');
  const doc = base('wallet', u, 'wallet.topup', `شارژ کیف پول · ${toman(amount)}`, 30);
  doc.clauses = [
    { key: 'subject', label: 'موضوع', value: 'شارژ کیف پول' },
    { key: 'amount', label: 'مبلغ', value: amount, kind: 'amount' },
    { key: 'source', label: 'از', value: 'کارت بانکی شما، از راه درگاه پرداخت' },
    { key: 'destination', label: 'به', value: 'کیف پول شما نزد ویستا' },
    { key: 'gateway', label: 'درگاه', value: 'درگاه آزمایشی (بعداً با درگاه واقعی جایگزین می‌شود)', kind: 'note' },
  ];
  doc.effects = [{ type: 'wallet.topup', amount }];
  return submit(u, doc, origin);
}

/** استارت — نخستین قرارداد میان کاربر و اپ؛ مجوزها همین‌جا داده می‌شوند. */
export function buildStart(u: User, appId: string, permissions: string[], origin: 'assistant' | 'system' = 'system'): ContractRow {
  const a = app(appId);
  if (!a) throw new Error('اپ یافت نشد.');
  const declared: any[] = json.parse(a.permissions_json, []);
  const financial: any[] = json.parse(a.financial_permissions_json, []);
  const chosen = permissions.filter((p) => declared.some((d) => d.key === p) || financial.some((d) => `financial:${d.key}` === p));
  if (chosen.some((p) => p.startsWith('financial:')) && !a.verified) throw new Error('فقط اپ احرازشده می‌تواند اختیار مالی بخواهد.');
  const doc = base(appId, u, 'start', `قرارداد استارت · ${a.name}`, 60);
  const permLabels = chosen.map((p) => (p.startsWith('financial:') ? financial.find((d) => `financial:${d.key}` === p)?.label : declared.find((d) => d.key === p)?.label) ?? p);
  const toolsInfo = json.parse<any[]>(a.tools_json, []);
  doc.clauses = [
    { key: 'subject', label: 'موضوع', value: 'استارت اپ و اعطای مجوزها' },
    { key: 'app', label: 'اپ', value: `${a.name}${a.company ? ` — ${a.company}` : ''}` },
    { key: 'address', label: 'آدرس', value: a.url ?? '—' },
    { key: 'status', label: 'وضعیت احراز', value: a.verified ? 'احرازشده ✓' : 'احرازنشده — می‌تواند بخواند و قرارداد بیاورد، اما اختیار مالی نمی‌گیرد' },
    { key: 'permissions', label: 'مجوزها', value: permLabels.length ? permLabels.join('\n') : 'هیچ مجوزی', kind: 'list' },
    { key: 'capabilities', label: 'قابلیت‌های قابل خواندن', value: toolsInfo.filter((t) => t.exposed).length ? `${toolsInfo.filter((t) => t.exposed).length} قابلیت` : 'هنوز خوانده نشده' },
    { key: 'signer', label: 'امضاکنندهٔ اپ', value: a.public_key || q.get('SELECT 1 FROM app_keys WHERE app_id=?', appId) ? 'کلید خودِ اپ' : 'این اپ کلید امضا ندارد؛ ویترین از طرف سکو امضا می‌کند', kind: 'note' },
    { key: 'revoke', label: 'لغو', value: 'پس گرفتن هر مجوز یک‌طرفه و فوری است و به موافقت اپ نیاز ندارد.', kind: 'note' },
  ];
  doc.effects = [{ type: 'app.install', app_id: appId, permissions: chosen }];
  const hash = contractHash(doc);
  const hasKey = !!q.get('SELECT 1 FROM app_keys WHERE app_id=?', appId);
  const sig = hasKey ? signWithKey(appId, hash) : platformSign(hash);
  return createContract(u.id, doc, sig, { origin });
}

/** اعطای مجوز تازه به اپی که قبلاً استارت شده. */
export function buildPermissionGrant(u: User, appId: string, permissions: string[]): ContractRow {
  const a = app(appId);
  if (!a) throw new Error('اپ یافت نشد.');
  const declared: any[] = json.parse(a.permissions_json, []);
  const chosen = permissions.filter((p) => declared.some((d) => d.key === p));
  if (!chosen.length) throw new Error('مجوزی انتخاب نشده است.');
  const doc = base(appId, u, 'permission.grant', `اعطای مجوز · ${a.name}`, 60);
  doc.clauses = [
    { key: 'subject', label: 'موضوع', value: 'اعطای مجوز' },
    { key: 'app', label: 'اپ', value: a.name },
    { key: 'permissions', label: 'مجوزها', value: chosen.map((p) => declared.find((d) => d.key === p)?.label ?? p).join('\n'), kind: 'list' },
  ];
  doc.effects = [{ type: 'permission.grant', app_id: appId, permissions: chosen }];
  const hash = contractHash(doc);
  const hasKey = !!q.get('SELECT 1 FROM app_keys WHERE app_id=?', appId);
  return createContract(u.id, doc, hasKey ? signWithKey(appId, hash) : platformSign(hash), { origin: 'system' });
}

// ───────────────────────── effect hooks ─────────────────────────
onEffect('genesis', (row) => {
  q.run('UPDATE users SET onboarded_at=?, kyc_level=MAX(kyc_level,3) WHERE id=?', now(), row.user_id);
  for (const a of SYSTEM_APPS) {
    q.run('INSERT OR IGNORE INTO installs (user_id, app_id, installed_at, start_contract_id, permissions_json) VALUES (?,?,?,?,?)', row.user_id, a, now(), row.id, '["system"]');
    chats.conversation(row.user_id, a);
  }
  chats.post(row.user_id, 'assistant', 'system', 'قرارداد آغاز امضا شد. خوش آمدید — چه کاری برایتان انجام دهم؟', { replyToContractId: row.id, unread: false });
  chats.post(row.user_id, 'showcase', 'system', 'از اینجا اپ‌های تازه پیدا و نصب می‌شوند. پیش از نصب، مجوزهایی که هر اپ می‌خواهد را می‌بینید.', { unread: false });
  chats.post(row.user_id, 'wallet', 'system', 'کیف پول شما آماده است. برای شارژ، مبلغ را بگویید یا از صفحهٔ مالی اقدام کنید.', { unread: false });
  chats.post(row.user_id, 'contracts', 'system', 'هر قراردادی که امضا می‌کنید این‌جا می‌ماند: با چه کسی، کِی، با چه امضایی، و بعدش چه شد.', { unread: false });
  chats.post(row.user_id, 'support', 'system', 'اگر چیزی درست پیش نرفت، همین‌جا بنویسید. اعتراض به هر قرارداد از صفحهٔ همان قرارداد ثبت می‌شود.', { unread: false });
  chats.post(row.user_id, 'settings', 'system', 'احراز هویت، کلید مدل دلخواه، ظاهر و صفحهٔ پیش‌فرض این‌جاست.', { unread: false });
});
onEffect('app.install', (row, e) => {
  if (e.type !== 'app.install') return;
  const existing = q.get<any>('SELECT * FROM installs WHERE user_id=? AND app_id=?', row.user_id, e.app_id);
  if (existing) q.run('UPDATE installs SET removed_at=NULL, installed_at=?, start_contract_id=?, permissions_json=? WHERE user_id=? AND app_id=?', now(), row.id, JSON.stringify(e.permissions), row.user_id, e.app_id);
  else q.run('INSERT INTO installs (user_id, app_id, installed_at, start_contract_id, permissions_json) VALUES (?,?,?,?,?)', row.user_id, e.app_id, now(), row.id, JSON.stringify(e.permissions));
  ledgerAppend('permission.granted', { userId: row.user_id, appId: e.app_id, permissions: e.permissions, contractId: row.id }, { refType: 'contract', refId: row.id, userId: row.user_id, appId: e.app_id });
  const a = app(e.app_id);
  chats.post(row.user_id, e.app_id, 'system', `${a?.name ?? 'اپ'} به فهرست اپ‌های شما اضافه شد${e.permissions.some((p) => p.startsWith('financial:')) ? ' · با اختیار مالی سقف‌دار' : ' · بدون اختیار مالی'}`, { replyToContractId: row.id, unread: false });
});
onEffect('permission.grant', (row, e) => {
  if (e.type !== 'permission.grant') return;
  const inst = q.get<any>('SELECT * FROM installs WHERE user_id=? AND app_id=?', row.user_id, e.app_id);
  const cur: string[] = json.parse(inst?.permissions_json, []);
  const next = Array.from(new Set([...cur, ...e.permissions]));
  q.run('UPDATE installs SET permissions_json=? WHERE user_id=? AND app_id=?', JSON.stringify(next), row.user_id, e.app_id);
  ledgerAppend('permission.granted', { userId: row.user_id, appId: e.app_id, permissions: e.permissions, contractId: row.id }, { refType: 'contract', refId: row.id, userId: row.user_id, appId: e.app_id });
});
onEffect('delegation.grant', (row, e) => {
  if (e.type !== 'delegation.grant') return;
  const did = id('dlg');
  q.run('INSERT INTO delegations (id, user_id, app_id, contract_id, scope, label, cap, per_use_cap, spent, expires_at, status, created_at) VALUES (?,?,?,?,?,?,?,?,0,?,?,?)',
    did, row.user_id, e.app_id, row.id, e.scope, e.label, e.cap, e.per_use_cap ?? null, e.expires_at, 'active', now());
  ledgerAppend('delegation.granted', { delegationId: did, userId: row.user_id, appId: e.app_id, scope: e.scope, cap: e.cap, expiresAt: e.expires_at, contractId: row.id }, { refType: 'delegation', refId: did, userId: row.user_id, appId: e.app_id });
  chats.post(row.user_id, e.app_id, 'system', `وکالت «${e.label}» تا سقف ${toman(e.cap)} و تا ${isoToJalali(e.expires_at)} فعال شد. هر مصرف به شما اطلاع داده می‌شود و لغو آن یک‌طرفه و فوری است.`, { replyToContractId: row.id, unread: false });
});

/** لغو مجوز — یک‌طرفه، فوری، بدون قرارداد. */
export function revokePermission(u: User, appId: string, key: string) {
  const inst = q.get<any>('SELECT * FROM installs WHERE user_id=? AND app_id=? AND removed_at IS NULL', u.id, appId);
  if (!inst) throw new Error('اپ نصب نیست.');
  const cur: string[] = json.parse(inst.permissions_json, []);
  const next = cur.filter((p) => p !== key);
  q.run('UPDATE installs SET permissions_json=? WHERE user_id=? AND app_id=?', JSON.stringify(next), u.id, appId);
  ledgerAppend('permission.revoked', { userId: u.id, appId, permission: key }, { refType: 'app', refId: appId, userId: u.id, appId });
  chats.post(u.id, appId, 'system', `مجوز «${key}» پس گرفته شد.`, { unread: false });
}
/** حذف اپ — لغو همهٔ مجوزها و وکالت‌ها. */
export function removeApp(u: User, appId: string) {
  if (SYSTEM_APPS.includes(appId)) throw new Error('اپ سیستمی حذف نمی‌شود.');
  q.run('UPDATE installs SET removed_at=?, permissions_json=? WHERE user_id=? AND app_id=?', now(), '[]', u.id, appId);
  q.run("UPDATE delegations SET status='revoked', revoked_at=? WHERE user_id=? AND app_id=? AND status='active'", now(), u.id, appId);
  ledgerAppend('app.removed', { userId: u.id, appId }, { refType: 'app', refId: appId, userId: u.id, appId });
}

/** درگاه پرداخت — پس از تأیید، اثر شارژ اجرا می‌شود. */
export function completeTopup(paymentId: string, success: boolean, refNo?: string) {
  const p = q.get<any>('SELECT * FROM payments WHERE id=?', paymentId);
  if (!p || p.status !== 'pending') throw new Error('پرداخت یافت نشد یا قبلاً نهایی شده است.');
  const row = getContract(p.contract_id)!;
  const doc = docOf(row);
  const topup = doc.effects.find((e) => e.type === 'wallet.topup') as Extract<Effect, { type: 'wallet.topup' }>;
  q.run('UPDATE payments SET status=?, ref_no=?, completed_at=? WHERE id=?', success ? 'success' : 'failed', refNo ?? null, now(), paymentId);
  if (success) {
    wallet.credit(row.user_id, topup.amount, row.id, 'شارژ از درگاه');
    setStatus(row.id, 'settled');
    recordEvent(row.id, 'credited', 'platform', 'gateway', `${toman(topup.amount)} · شمارهٔ پیگیری ${refNo ?? '—'}`);
  } else {
    setStatus(row.id, 'failed');
    recordEvent(row.id, 'failed', 'platform', 'gateway', 'پرداخت در درگاه ناموفق بود');
  }
  return getContract(row.id)!;
}
