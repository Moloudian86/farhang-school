import { z } from "zod";
import { paginationQuery } from "../../utils/pagination";
import { phoneSchema } from "../../utils/validators";

export const createContactSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().toLowerCase().email().max(191),
  // Phone is optional: an empty box ("") counts as "not provided".
  phone: z.preprocess((v) => (v === "" || v === null ? undefined : v), phoneSchema.optional()),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(3000),
});

export const listContactQuery = paginationQuery.extend({
  isRead: z.enum(["true", "false"]).optional(),
});

export const markReadSchema = z.object({ isRead: z.boolean().default(true) });
