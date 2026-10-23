import { z } from "zod";
import { parseLoginIdentifier } from "../../utils/identifiers";

export const IDENTIFIER_HINT = "شمارهٔ موبایل (مثل 09121234567) یا کد دانش‌آموزی (مثل 1405-1-001) را درست وارد کنید";

/**
 * ONE box for both kinds of login:
 *   mobile number  -> admin / teacher / parent
 *   student code   -> student
 * The client never says which ROLE it wants; the role always comes from the database (see auth.service).
 */
export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .transform((raw, ctx) => {
      const parsed = parseLoginIdentifier(raw);
      if (!parsed) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: IDENTIFIER_HINT });
        return z.NEVER;
      }
      return parsed;
    }),
  password: z.string().min(1).max(200),
});
