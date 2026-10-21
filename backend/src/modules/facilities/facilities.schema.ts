import { z } from "zod";
import { imageUrlSchema } from "../../utils/validators";

const facilityBase = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(3000),
  icon: z.string().trim().max(50).nullish(),
  imageUrl: imageUrlSchema.nullish(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const createFacilitySchema = facilityBase;
export const updateFacilitySchema = facilityBase.partial();
