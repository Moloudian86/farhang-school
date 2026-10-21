import { Router } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";

export const statisticsRouter = Router();

statisticsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    sendSuccess(res, await prisma.schoolStatistic.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }));
  })
);
