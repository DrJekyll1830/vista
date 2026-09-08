import { randomBytes } from 'node:crypto';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
export function id(prefix = '', len = 16): string {
  const bytes = randomBytes(len);
  let s = '';
  for (let i = 0; i < len; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return prefix ? `${prefix}_${s}` : s;
}
export const now = () => new Date().toISOString();
export const plusMinutes = (m: number) => new Date(Date.now() + m * 60_000).toISOString();
export const plusDays = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();
