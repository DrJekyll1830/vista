import jalaali from 'jalaali-js';
import { toEnDigits, toFaDigits } from './persian.js';

/** Parse a Jalali date like ۱۳۷۵/۰۶/۱۵ or 1375-6-15. Returns ISO (Gregorian) date or null. */
export function parseJalali(input: string): { jy: number; jm: number; jd: number; iso: string } | null {
  const s = toEnDigits(input).trim().replace(/[.\-]/g, '/');
  const m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return null;
  const jy = Number(m[1]), jm = Number(m[2]), jd = Number(m[3]);
  if (!jalaali.isValidJalaaliDate(jy, jm, jd)) return null;
  const g = jalaali.toGregorian(jy, jm, jd);
  const iso = `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`;
  return { jy, jm, jd, iso };
}
export function formatJalali(jy: number, jm: number, jd: number): string {
  return toFaDigits(`${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`);
}
export function isoToJalali(iso: string): string {
  const d = new Date(iso);
  const j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return formatJalali(j.jy, j.jm, j.jd);
}
/** Jalali date + local time, e.g. ۱۴۰۵/۰۶/۱۷ · ۱۴:۲۳ */
export function formatJalaliDateTime(iso: string): string {
  const d = new Date(iso);
  const j = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatJalali(j.jy, j.jm, j.jd)} · ${toFaDigits(`${hh}:${mm}`)}`;
}
export function ageFromIso(iso: string): number {
  const b = new Date(iso), n = new Date();
  let age = n.getFullYear() - b.getFullYear();
  const m = n.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < b.getDate())) age--;
  return age;
}
