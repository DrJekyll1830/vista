import { db, q } from './db.js';
import { canonicalJson, sha256Hex } from './util/canonical.js';
import { now } from './util/ids.js';

/**
 * دفتر — append-only, hash-chained. Every effectful thing lands here:
 * contract versions, signatures, what the user saw, executions, events,
 * permission changes, delegation changes, sensitive disclosures.
 */
export function ledgerAppend(kind: string, payload: Record<string, unknown>, opts: { refType?: string; refId?: string; userId?: string; appId?: string } = {}) {
  const prev = q.get<{ hash: string }>('SELECT hash FROM ledger ORDER BY seq DESC LIMIT 1')?.hash ?? 'genesis';
  const createdAt = now();
  const body = canonicalJson({ kind, payload, prev, createdAt });
  const hash = sha256Hex(body);
  q.run(
    'INSERT INTO ledger (kind, ref_type, ref_id, user_id, app_id, payload_json, prev_hash, hash, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
    kind, opts.refType ?? null, opts.refId ?? null, opts.userId ?? null, opts.appId ?? null, JSON.stringify(payload), prev, hash, createdAt,
  );
  return hash;
}
export function ledgerVerify(): { ok: boolean; count: number; brokenAt?: number } {
  const rows = q.all<{ seq: number; kind: string; payload_json: string; prev_hash: string; hash: string; created_at: string }>('SELECT * FROM ledger ORDER BY seq');
  let prev = 'genesis';
  for (const r of rows) {
    const expected = sha256Hex(canonicalJson({ kind: r.kind, payload: JSON.parse(r.payload_json), prev, createdAt: r.created_at }));
    if (r.prev_hash !== prev || expected !== r.hash) return { ok: false, count: rows.length, brokenAt: r.seq };
    prev = r.hash;
  }
  return { ok: true, count: rows.length };
}
export { db };
