import { toEnDigits } from './persian.js';

/** Iranian national code checksum validation. */
export function isValidNationalId(input: string): boolean {
  const s = toEnDigits(input).trim();
  if (!/^\d{10}$/.test(s)) return false;
  if (/^(\d)\1{9}$/.test(s)) return false;
  const check = Number(s[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(s[i]) * (10 - i);
  const r = sum % 11;
  return r < 2 ? check === r : check === 11 - r;
}
