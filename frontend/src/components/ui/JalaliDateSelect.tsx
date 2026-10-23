import { currentJalaliYear, daysInJalaliMonth, isoToJalali, JALALI_MONTHS, jalaliToGregorian, toIsoDate } from "../../lib/jalali";
import { formatNumber } from "../../lib/format";
import { inputClass } from "./FormField";

/**
 * Day / month / year dropdowns in the Persian calendar.
 * `value` and `onChange` use the Gregorian ISO format ("2026-10-21") that the backend understands.
 */
export default function JalaliDateSelect({ value, onChange, label }: { value: string; onChange: (iso: string) => void; label: string }) {
  const [jy, jm, jd] = isoToJalali(value);
  const thisYear = currentJalaliYear();
  const years = [thisYear - 1, thisYear, thisYear + 1];

  const update = (y: number, m: number, d: number) => {
    const day = Math.min(d, daysInJalaliMonth(y, m)); // e.g. 31 Shahrivar -> 30 Mehr is clamped
    onChange(toIsoDate(jalaliToGregorian(y, m, day)));
  };
  const cls = `${inputClass(false)} appearance-none`;

  return (
    <div role="group" aria-label={label} className="grid grid-cols-3 gap-2">
      <select aria-label="روز" className={cls} value={jd} onChange={(e) => update(jy, jm, Number(e.target.value))}>
        {Array.from({ length: daysInJalaliMonth(jy, jm) }, (_, i) => <option key={i + 1} value={i + 1}>{formatNumber(i + 1)}</option>)}
      </select>
      <select aria-label="ماه" className={cls} value={jm} onChange={(e) => update(jy, Number(e.target.value), jd)}>
        {JALALI_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </select>
      <select aria-label="سال" className={cls} value={jy} onChange={(e) => update(Number(e.target.value), jm, jd)}>
        {(years.includes(jy) ? years : [...years, jy]).map((y) => (
          <option key={y} value={y}>{new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(y)}</option>
        ))}
      </select>
    </div>
  );
}
