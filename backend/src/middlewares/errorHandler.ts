import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import multer from "multer";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`آدرس ${req.method} ${req.originalUrl} وجود ندارد`));
}

/** The ONE place that turns any error into a clean JSON answer (no secrets leak out). */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "اطلاعات ارسال‌شده نامعتبر است",
      errors: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return res.status(409).json({ success: false, message: "این مقدار قبلاً ثبت شده است" });
    if (err.code === "P2025") return res.status(404).json({ success: false, message: "مورد درخواستی پیدا نشد" });
    if (err.code === "P2003")
      return res.status(400).json({ success: false, message: "مورد مرتبط (مثل دسته‌بندی) وجود ندارد" });
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "حجم تصویر نباید بیشتر از ۵ مگابایت باشد" : "آپلود فایل ناموفق بود";
    return res.status(400).json({ success: false, message });
  }

  const e = err as { type?: string; message?: string };
  if (e?.type === "entity.parse.failed") return res.status(400).json({ success: false, message: "قالب JSON نامعتبر است" });
  if (e?.type === "entity.too.large") return res.status(413).json({ success: false, message: "حجم درخواست زیاد است" });

  console.error(err);
  res.status(500).json({
    success: false,
    message: "خطای داخلی سرور",
    ...(env.isProd ? {} : { debug: e?.message }),
  });
}
