import { z } from "zod";
import { paginationQuery } from "../../utils/pagination";
import { imageUrlSchema } from "../../utils/validators";

export const listGalleryQuery = paginationQuery.extend({
  limit: z.coerce.number().int().min(1).max(50).default(30),
  category: z.string().trim().max(120).optional(), // category slug
});

const imageBase = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(500).nullish(),
  imageUrl: imageUrlSchema,
  takenAt: z.coerce.date().nullish(),
  categoryId: z.coerce.number().int().positive(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const createImageSchema = imageBase;
export const updateImageSchema = imageBase.partial();
