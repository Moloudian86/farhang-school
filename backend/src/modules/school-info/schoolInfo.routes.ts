import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { adminOnly } from "../../middlewares/auth";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { imageUrlSchema } from "../../utils/validators";

export const schoolInfoRouter = Router();

const updateSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    slogan: z.string().trim().min(2).max(255),
    shortIntro: z.string().trim().min(10).max(3000),
    about: z.string().trim().min(10).max(10000),
    philosophy: z.string().trim().min(10).max(10000),
    address: z.string().trim().min(5).max(500),
    phone: z.string().trim().min(5).max(50),
    email: z.string().trim().toLowerCase().email().max(191),
    workingHours: z.string().trim().min(2).max(255),
    latitude: z.coerce.number().min(-90).max(90).nullish(),
    longitude: z.coerce.number().min(-180).max(180).nullish(),
    heroImageUrl: imageUrlSchema.nullish(),
    aboutImageUrl: imageUrlSchema.nullish(),
  })
  .partial();

// The school has exactly one "info" row.
schoolInfoRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const info = await prisma.schoolInfo.findFirst({ orderBy: { id: "asc" } });
    if (!info) throw ApiError.notFound("اطلاعات مدرسه هنوز ثبت نشده است");
    sendSuccess(res, info);
  })
);

schoolInfoRouter.put(
  "/",
  adminOnly,
  asyncHandler(async (req, res) => {
    const info = await prisma.schoolInfo.findFirst({ orderBy: { id: "asc" } });
    if (!info) throw ApiError.notFound("اطلاعات مدرسه هنوز ثبت نشده است");
    const updated = await prisma.schoolInfo.update({ where: { id: info.id }, data: updateSchema.parse(req.body) });
    sendSuccess(res, updated, { message: "اطلاعات مدرسه ویرایش شد" });
  })
);
