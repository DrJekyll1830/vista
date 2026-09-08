/**
 * مدل قرارداد — ساختار دقیق فصل «مدل قرارداد» کتاب.
 * This file is the source of truth for both the platform and the partner
 * skill (skills/vista-app/reference/contract.md mirrors it).
 */
export type PartyKind = 'app' | 'user' | 'platform';
export type Rung = 1 | 2 | 3 | 4 | 5;

export interface Party {
  /** app:<app_id> | user:<user_id> | phone:<09…> (unresolved user) | platform */
  id: string;
  kind: PartyKind;
  /** initiator | payer | payee | provider | approver | participant | witness */
  role: string;
  label: string;
  must_sign: boolean;
  /** clause keys visible to this party; omitted = all */
  visible_clauses?: string[];
}
export interface Clause {
  key: string;
  label: string;
  value: string | number | null;
  kind?: 'text' | 'amount' | 'date' | 'phone' | 'number' | 'list' | 'note';
  /** parties (ids or roles) allowed to see this clause; omitted = everyone */
  visible_to?: string[];
}
export interface OpenClause { key: string; owner: string; label: string; kind?: Clause['kind'] }

export type Condition =
  | { type: 'wallet.sufficient' }
  | { type: 'delegation.active'; delegation_id: string }
  | { type: 'app.installed'; app_id: string };

export type Effect =
  | { type: 'wallet.pay'; amount: number; payee_app_id: string; memo?: string }
  | { type: 'wallet.topup'; amount: number }
  | { type: 'app.install'; app_id: string; permissions: string[] }
  | { type: 'permission.grant'; app_id: string; permissions: string[] }
  | { type: 'delegation.grant'; app_id: string; scope: string; label: string; cap: number; per_use_cap?: number; expires_at: string }
  | { type: 'genesis'; system_apps: string[] }
  | { type: 'app.action'; action: string; params: Record<string, unknown> };

export interface Fee { beneficiary: string; amount: number; label?: string; visible?: boolean }
export interface Policy {
  /** floor rung declared by the template; the platform may raise it */
  min_rung: Rung;
  quorum: 'all';
  /** immediate: deduct at execution · on_delivery: hold at execution, deduct on "delivered" */
  settlement: 'immediate' | 'on_delivery';
}
export interface Appearance { color: string; logo: string; display_name: string }

export interface ContractDoc {
  vista: '1';
  id: string;
  version: number;
  prev_version_id: string | null;
  type: string;
  template_ref: string;
  app_id: string;
  title: string;
  parties: Party[];
  clauses: Clause[];
  open_clauses: OpenClause[];
  conditions: Condition[];
  effects: Effect[];
  fees: Fee[];
  policy: Policy;
  appearance: Appearance;
  nonce: string;
  created_at: string;
  expires_at: string;
  /** delegation this contract is executed under (app-initiated, user absent) */
  delegation_id?: string;
}

export type ContractStatus =
  | 'draft' | 'awaiting' | 'signed' | 'executing' | 'settled'
  | 'rejected' | 'expired' | 'cancelled' | 'disputed' | 'refunded' | 'failed';

export const EVENT_LABELS: Record<string, string> = {
  held: 'مبلغ مسدود شد',
  deducted: 'مبلغ از کیف پول شما کسر شد',
  credited: 'کیف پول شما شارژ شد',
  delivered: 'تحویل داده شد',
  cancelled: 'لغو شد و مسدودی آزاد شد',
  released: 'مسدودی آزاد شد',
  refunded: 'مبلغ برگشت داده شد',
  disputed: 'اعتراض ثبت شد',
  failed: 'اجرا ناموفق بود',
  delegated_use: 'با وکالت شما اجرا شد',
  note: 'یادداشت',
};

/** Fields covered by the canonical hash — everything a party commits to. Appearance is cosmetic and excluded. */
export function hashableView(doc: ContractDoc) {
  const { appearance: _a, ...rest } = doc;
  return rest;
}
/** Sum of money effects, in toman. */
export function contractAmount(doc: ContractDoc): number {
  let sum = 0;
  for (const e of doc.effects) {
    if (e.type === 'wallet.pay' || e.type === 'wallet.topup') sum += e.amount;
    if (e.type === 'delegation.grant') sum = Math.max(sum, e.cap);
  }
  return sum;
}
