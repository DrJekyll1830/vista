declare module 'jalaali-js' {
  const j: {
    toJalaali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number };
    toGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number };
    isValidJalaaliDate(jy: number, jm: number, jd: number): boolean;
  };
  export default j;
}
