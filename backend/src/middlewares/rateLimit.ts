import rateLimit from "express-rate-limit";

const make = (max: number, message: string, extra: { skipSuccessfulRequests?: boolean; skipFailedRequests?: boolean } = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    ...extra,
  });

/** Whole API: very generous, only stops crazy bots. */
export const apiLimiter = make(1000, "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید");
/** Login: only FAILED attempts count, to slow down password guessing. */
export const loginLimiter = make(10, "تعداد تلاش‌های ناموفق زیاد است. ۱۵ دقیقه بعد دوباره تلاش کنید", {
  skipSuccessfulRequests: true,
});
/** Public forms (enrollment, contact). Mistakes in the form (errors) don't count, only accepted submissions. */
export const formLimiter = make(10, "تعداد ارسال‌ها زیاد است. کمی بعد دوباره تلاش کنید", { skipFailedRequests: true });
