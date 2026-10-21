// The database stores Gregorian dates; the website shows them in the Persian (Jalali) calendar.
const longDate = new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeZone: "UTC" });
const faNumber = new Intl.NumberFormat("fa-IR");

export const formatDate = (iso: string) => longDate.format(new Date(iso));
export const formatNumber = (n: number) => faNumber.format(n);
export const formatTime = (hhmm: string) => hhmm.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
