import { z } from "zod";
import { paginationQuery } from "../../utils/pagination";
import { imageUrlSchema, timeSchema } from "../../utils/validators";

export const listEventsQuery = paginationQuery.extend({
  upcoming: z.enum(["true", "false"]).optional(), // ?upcoming=true -> only today and later
  category: z.string().trim().max(120).optional(), // category slug
});

const eventBase = z.object({
  title: z.string().trim().min(3).max(255),
  description: z.string().trim().min(10).max(5000),
  imageUrl: imageUrlSchema.nullish(),
  eventDate: z.coerce.date(), // send "2026-11-20"
  startTime: timeSchema,
  location: z.string().trim().min(2).max(200),
  categoryId: z.coerce.number().int().positive(),
});

export const createEventSchema = eventBase;
export const updateEventSchema = eventBase.partial();
