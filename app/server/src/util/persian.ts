const FA = '۰۱۲۳۴۵۶۷۸۹';
const AR = '٠١٢٣٤٥٦٧٨٩';

/** Convert Persian/Arabic digits to ASCII digits. */
export function toEnDigits(s: string): string {
  return s.replace(/[۰-۹]/g, (d) => String(FA.indexOf(d))).replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)));
}
export function toFaDigits(s: string | number): string {
  return String(s).replace(/[0-9]/g, (d) => FA[Number(d)]);
}
/** Format toman with Persian digits and thousands separators. */
export function toman(n: number): string {
  const sign = n < 0 ? '−' : '';
  const s = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  return `${sign}${toFaDigits(s)} تومان`;
}
/** Normalise an Iranian mobile number to 09xxxxxxxxx. */
export function normalizePhone(input: string): string | null {
  let s = toEnDigits(input).replace(/[\s\-()]/g, '');
  if (s.startsWith('+98')) s = '0' + s.slice(3);
  else if (s.startsWith('0098')) s = '0' + s.slice(4);
  else if (s.startsWith('98') && s.length === 12) s = '0' + s.slice(2);
  else if (s.startsWith('9') && s.length === 10) s = '0' + s;
  if (!/^09\d{9}$/.test(s)) return null;
  return s;
}
