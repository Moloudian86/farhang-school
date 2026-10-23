/**
 * Login identifiers.
 *
 *   ADMIN / TEACHER / PARENT  ->  mobile number   (09121234567)
 *   STUDENT                   ->  student code    (1405-1-001)
 *
 * This file has NO imports on purpose: it is pure logic, easy to test and safe to use from the seed.
 *
 * Student code = <entry year>-<entry grade>-<sequence>
 *   - entry year  : school year the student first entered the school (Jalali, 4 digits)
 *   - entry grade : grade (1-6) when he entered. It is NOT the current grade, so the code never changes
 *                   when the student moves up. The current grade lives in Student.gradeLevel / Student.classId.
 *   - sequence    : counter inside (entry year + entry grade), at least 3 digits (001, 002, ...)
 */

/** Turns Persian (۱۲۳) and Arabic (١٢٣) digits into English digits (123). */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

// Invisible characters (zero-width non-joiner, RTL/LTR marks) often sneak in when copying from Persian text.
const INVISIBLE = /[\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g;

// ---------------------------------------------------------------------------
// Mobile number
// ---------------------------------------------------------------------------

const MOBILE_RE = /^09\d{9}$/;

export const isMobile = (value: string) => MOBILE_RE.test(value);

/**
 * "۰۹۱۲ ۳۴۵-۶۷۸۹", "+98 912 345 6789", "00989123456789", "9123456789"  ->  "09123456789".
 * Returns null when the text is not an Iranian mobile number.
 */
export function normalizeMobile(raw: string): string | null {
  let v = normalizeDigits(raw).replace(INVISIBLE, "").replace(/[\s\-().]/g, "");
  if (v.startsWith("+98")) v = `0${v.slice(3)}`;
  else if (v.startsWith("0098")) v = `0${v.slice(4)}`;
  else if (/^98\d{10}$/.test(v)) v = `0${v.slice(2)}`;
  else if (/^9\d{9}$/.test(v)) v = `0${v}`;
  return MOBILE_RE.test(v) ? v : null;
}

// ---------------------------------------------------------------------------
// Student code
// ---------------------------------------------------------------------------

const STUDENT_CODE_RE = /^(\d{4})-([1-6])-(\d{3,6})$/;

export const isValidEntryYear = (year: number) => Number.isInteger(year) && year >= 1300 && year <= 1700;
export const isValidEntryGrade = (grade: number) => Number.isInteger(grade) && grade >= 1 && grade <= 6;
export const isValidEntrySequence = (seq: number) => Number.isInteger(seq) && seq >= 1 && seq <= 999999;

/** (1405, 1, 7) -> "1405-1-007". Throws on impossible values, so a bad code can never be built by mistake. */
export function formatStudentCode(entryYear: number, entryGrade: number, entrySequence: number): string {
  if (!isValidEntryYear(entryYear)) throw new Error(`Invalid entry year: ${entryYear}`);
  if (!isValidEntryGrade(entryGrade)) throw new Error(`Invalid entry grade: ${entryGrade}`);
  if (!isValidEntrySequence(entrySequence)) throw new Error(`Invalid entry sequence: ${entrySequence}`);
  return `${entryYear}-${entryGrade}-${String(entrySequence).padStart(3, "0")}`;
}

export interface ParsedStudentCode { entryYear: number; entryGrade: number; entrySequence: number }

/** "1405-1-007" -> { entryYear: 1405, entryGrade: 1, entrySequence: 7 }. Returns null if it is not exactly the canonical format. */
export function parseStudentCode(code: string): ParsedStudentCode | null {
  const m = STUDENT_CODE_RE.exec(code);
  if (!m) return null;
  const parsed = { entryYear: Number(m[1]), entryGrade: Number(m[2]), entrySequence: Number(m[3]) };
  if (!isValidEntryYear(parsed.entryYear) || !isValidEntrySequence(parsed.entrySequence)) return null;
  // Only canonical codes are accepted (e.g. "1405-1-0007" would never match a stored code).
  return formatStudentCode(parsed.entryYear, parsed.entryGrade, parsed.entrySequence) === code ? parsed : null;
}

/** Cleans what a person typed ("۱۴۰۵ - ۱ - ۰۰۱", en-dash, spaces) into "1405-1-001". Returns null if it is not a valid code. */
export function normalizeStudentCode(raw: string): string | null {
  const v = normalizeDigits(raw)
    .replace(INVISIBLE, "")
    .replace(/\s+/g, "")
    .replace(/[\u2010-\u2015\u2212\u0640]/g, "-"); // hyphen look-alikes: ‐ ‑ ‒ – — ― − ـ
  return parseStudentCode(v) ? v : null;
}

// ---------------------------------------------------------------------------
// Login identifier = one text box that accepts either of the two
// ---------------------------------------------------------------------------

export type LoginIdentifier = { kind: "PHONE"; phone: string } | { kind: "STUDENT_CODE"; code: string };

/**
 * Decides what the person typed. A student code can never look like a mobile number
 * (it has at most 11 digits and always starts with a year like 14xx), so the order below is safe.
 */
export function parseLoginIdentifier(raw: string): LoginIdentifier | null {
  const phone = normalizeMobile(raw);
  if (phone) return { kind: "PHONE", phone };
  const code = normalizeStudentCode(raw);
  if (code) return { kind: "STUDENT_CODE", code };
  return null;
}
