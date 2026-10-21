import { NewsStatus } from "@prisma/client";
import { z } from "zod";
import { paginationQuery } from "../../utils/pagination";
import { imageUrlSchema, slugSchema } from "../../utils/validators";

export const listNewsQuery = paginationQuery.extend({
  category: z.string().trim().max(120).optional(), // category slug
  search: z.string().trim().max(100).optional(),
});

export const adminListNewsQuery = paginationQuery.extend({
  status: z.nativeEnum(NewsStatus).optional(),
  search: z.string().trim().max(100).optional(),
});

const newsBase = z.object({
  title: z.string().trim().min(3).max(255),
  slug: slugSchema.optional(), // if empty we generate one
  summary: z.string().trim().min(10).max(500),
  content: z.string().trim().min(20),
  imageUrl: imageUrlSchema.nullish(),
  author: z.string().trim().min(2).max(150),
  categoryId: z.coerce.number().int().positive(),
  status: z.nativeEnum(NewsStatus).default(NewsStatus.DRAFT),
  publishedAt: z.coerce.date().nullish(),
});

export const createNewsSchema = newsBase;
export const updateNewsSchema = newsBase.partial();
