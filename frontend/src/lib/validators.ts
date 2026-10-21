/** Client-side checks. The backend repeats every check (never trust the browser), these just give instant feedback. */

/** Persian (۱۲۳) and Arabic (١٢٣) digits -> English digits. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

/** Official Iranian national code check (same algorithm as the backend). */
export function isValidNationalCode(raw: string): boolean {
  const code = normalizeDigits(raw.trim());
  if (!/^\d{10}$/.test(code) || /^(\d)\1{9}$/.test(code)) return false;
  const d = code.split("").map(Number);
  const sum = d.slice(0, 9).reduce((acc, digit, i) => acc + digit * (10 - i), 0);
  const r = sum % 11;
  return r < 2 ? d[9] === r : d[9] === 11 - r;
}

export const isValidPhone = (raw: string) => /^0\d{10}$/.test(normalizeDigits(raw.trim()));
export const isValidEmail = (raw: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw.trim());

export type Errors<T extends string> = Partial<Record<T, string>>;
