/** Jalali (Persian) <-> Gregorian conversion, so parents can type the birth date in the calendar they use. */

export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  jy += 1595;
  let days = -355668 + 365 * jy + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd;
  days += jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186;
  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const monthDays = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  while (gm < 13 && gd > monthDays[gm]) gd -= monthDays[gm++];
  return [gy, gm, gd];
}

export function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 355666 + 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + gdm[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

export const JALALI_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

export const daysInJalaliMonth = (jy: number, jm: number) => {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  // Esfand: 29 days, or 30 in a leap year. Check by converting day 30 and back.
  const [gy, gm, gd] = jalaliToGregorian(jy, 12, 30);
  return gregorianToJalali(gy, gm, gd)[1] === 12 ? 30 : 29;
};

export const currentJalaliYear = () => {
  const n = new Date();
  return gregorianToJalali(n.getFullYear(), n.getMonth() + 1, n.getDate())[0];
};

/** "2018-05-10" for the backend. */
export const toIsoDate = (g: [number, number, number]) => `${g[0]}-${String(g[1]).padStart(2, "0")}-${String(g[2]).padStart(2, "0")}`;

/** Today's date (in the user's own time zone) as "2026-10-21". */
export const todayIso = () => {
  const n = new Date();
  return toIsoDate([n.getFullYear(), n.getMonth() + 1, n.getDate()]);
};

/** "2026-10-21" -> [jy, jm, jd] */
export const isoToJalali = (iso: string): [number, number, number] => {
  const [y, m, d] = iso.split("-").map(Number);
  return gregorianToJalali(y, m, d);
};
