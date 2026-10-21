import { z } from "zod";

/** Turns Persian (۱۲۳) and Arabic (١٢٣) digits into English digits (123). */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

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
