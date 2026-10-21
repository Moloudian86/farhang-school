import { z } from "zod";
import { imageUrlSchema } from "../../utils/validators";

const teacherBase = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  position: z.string().trim().min(2).max(150),
  subject: z.string().trim().min(2).max(150),
  degree: z.string().trim().min(2).max(150),
  experienceYears: z.coerce.number().int().min(0).max(60).default(0),
  bio: z.string().trim().max(3000).nullish(),
  imageUrl: imageUrlSchema.nullish(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const createTeacherSchema = teacherBase;
export const updateTeacherSchema = teacherBase.partial();
