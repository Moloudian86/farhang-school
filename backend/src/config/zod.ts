import { z } from "zod";

/**
 * Persian validation messages.
 * Any message written directly inside a schema wins over these defaults.
 */
z.setErrorMap((issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      return { message: issue.received === "undefined" ? "این فیلد الزامی است" : "نوع مقدار نامعتبر است" };
    case z.ZodIssueCode.too_small:
      if (issue.type === "string") {
        return { message: Number(issue.minimum) <= 1 ? "این فیلد الزامی است" : `حداقل ${issue.minimum} کاراکتر وارد کنید` };
      }
      if (issue.type === "number") return { message: `مقدار باید حداقل ${issue.minimum} باشد` };
      break;
    case z.ZodIssueCode.too_big:
      if (issue.type === "string") return { message: `حداکثر ${issue.maximum} کاراکتر مجاز است` };
      if (issue.type === "number") return { message: `مقدار باید حداکثر ${issue.maximum} باشد` };
      break;
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "email") return { message: "ایمیل نامعتبر است" };
      if (issue.validation === "url") return { message: "آدرس اینترنتی نامعتبر است" };
      return { message: "قالب مقدار نامعتبر است" };
    case z.ZodIssueCode.invalid_enum_value:
      return { message: "مقدار انتخاب‌شده معتبر نیست" };
    case z.ZodIssueCode.invalid_date:
      return { message: "تاریخ نامعتبر است" };
  }
  return { message: ctx.defaultError };
});
