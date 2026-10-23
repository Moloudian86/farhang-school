import { Router } from "express";
import { prisma } from "../../config/prisma";
import { studentOnly } from "../../middlewares/auth";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { getStudentOverview } from "./studentOverview.service";

export const studentPanelRouter = Router();
studentPanelRouter.use(studentOnly);

// A student can only ever see HIS OWN data: the student row is found from the logged-in user, never from the URL.
studentPanelRouter.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const me = await prisma.student.findUnique({ where: { userId: req.user!.id }, select: { id: true } });
    if (!me) throw ApiError.notFound("پروندهٔ دانش‌آموزی برای این حساب ثبت نشده است");
    sendSuccess(res, await getStudentOverview(me.id));
  })
);
