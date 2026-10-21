import { EnrollmentStatus } from "@prisma/client";
import { z } from "zod";
import { paginationQuery } from "../../utils/pagination";
import { nationalCodeSchema, phoneSchema } from "../../utils/validators";

export const createEnrollmentSchema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  nationalCode: nationalCodeSchema,
  // Send a Gregorian date like "2018-05-10". The website converts the Persian date before sending.
  birthDate: z.coerce.date().refine((d) => {
    const years = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
    return years >= 4 && years <= 15;
  }, "تاریخ تولد معتبر نیست (سن باید بین ۴ تا ۱۵ سال باشد)"),
  gradeLevel: z.coerce.number().int().min(1).max(6),
  fatherName: z.string().trim().min(2).max(100),
  parentPhone: phoneSchema,
  address: z.string().trim().min(10).max(1000),
  previousEducation: z.string().trim().max(1000).nullish(),
  notes: z.string().trim().max(1000).nullish(),
});

export const listEnrollmentsQuery = paginationQuery.extend({
  status: z.nativeEnum(EnrollmentStatus).optional(),
  search: z.string().trim().max(100).optional(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(EnrollmentStatus),
  adminNote: z.string().trim().max(1000).nullish(),
});
