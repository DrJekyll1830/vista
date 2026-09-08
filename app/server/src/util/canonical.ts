import { createHash } from 'node:crypto';

/**
 * Canonical JSON: keys sorted recursively, no whitespace, undefined dropped,
 * numbers as plain decimals. This is the exact form that contract hashes are
 * computed over — apps must reproduce it byte-for-byte (see skill reference).
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) throw new Error('non-finite number in canonical json');
      return JSON.stringify(value);
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return '[' + value.map((v) => canonicalJson(v === undefined ? null : v)).join(',') + ']';
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).filter((k) => obj[k] !== undefined).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') + '}';
}
export function sha256Hex(s: string | Buffer): string {
  return createHash('sha256').update(s).digest('hex');
}
