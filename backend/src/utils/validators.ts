import { z } from "zod";
import { normalizeDigits, normalizeMobile } from "./identifiers";

// Same function as before, now living in identifiers.ts (pure code, shared with the seed).
export { normalizeDigits };

/** Official Iranian national code (کد ملی) check. */
export function isValidNationalCode(code: string): boolean {
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false; // 1111111111 etc.
  const d = code.split("").map(Number);
  const sum = d.slice(0, 9).reduce((acc, digit, i) => acc + digit * (10 - i), 0);
  const r = sum % 11;
  return r < 2 ? d[9] === r : d[9] === 11 - r;
}

const withDigits = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (typeof v === "string" ? normalizeDigits(v.trim()) : v), schema);

export const nationalCodeSchema = withDigits(z.string().refine(isValidNationalCode, "کد ملی نامعتبر است"));

export const phoneSchema = withDigits(
  z.string().regex(/^0\d{10}$/, "شمارهٔ تلفن باید ۱۱ رقم باشد و با صفر شروع شود (مثل 09121234567)")
);

/**
 * Mobile number used as a LOGIN name (ADMIN / TEACHER / PARENT). Stricter than phoneSchema:
 * only 09xxxxxxxxx is accepted, but common spellings (+98, spaces, Persian digits) are cleaned to that form.
 */
export const mobileSchema = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const mobile = normalizeMobile(v);
    if (!mobile) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "شمارهٔ موبایل نامعتبر است (مثل 09121234567)" });
      return z.NEVER;
    }
    return mobile;
  });

// Shared little schemas
export const idParam = z.object({ id: z.coerce.number().int().positive() });

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد");

/** Image address: a full https link (Unsplash...) or a file we uploaded (/uploads/...). */
export const imageUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => /^https?:\/\/\S+$/.test(v) || /^\/uploads\/[\w.\-]+$/.test(v), "آدرس تصویر نامعتبر است");

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "ساعت را به شکل 09:30 وارد کنید");
