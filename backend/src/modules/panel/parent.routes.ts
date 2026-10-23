import { Router } from "express";
import { prisma } from "../../config/prisma";
import { parentOnly } from "../../middlewares/auth";
import { ApiError } from "../../utils/ApiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { idParam } from "../../utils/validators";
import { getStudentOverview } from "./studentOverview.service";

export const parentPanelRouter = Router();
parentPanelRouter.use(parentOnly);

async function myParentId(userId: number) {
  const parent = await prisma.parent.findUnique({ where: { userId }, select: { id: true } });
  if (!parent) throw ApiError.notFound("پروندهٔ والد برای این حساب ثبت نشده است");
  return parent.id;
}

parentPanelRouter.get(
  "/children",
  asyncHandler(async (req, res) => {
    const parentId = await myParentId(req.user!.id);
    const links = await prisma.parentStudent.findMany({
      where: { parentId },
      include: { student: { include: { class: { select: { name: true } } } } },
    });
    sendSuccess(
      res,
      links.map((l) => ({
        id: l.student.id,
        firstName: l.student.firstName,
        lastName: l.student.lastName,
        gradeLevel: l.student.gradeLevel,
        className: l.student.class?.name ?? null,
        relationship: l.relationship,
      }))
    );
  })
);

// The URL contains the child id, so we MUST check that this child really belongs to this parent.
parentPanelRouter.get(
  "/children/:id/overview",
  asyncHandler(async (req, res) => {
    const parentId = await myParentId(req.user!.id);
    const { id: studentId } = idParam.parse(req.params);
    const link = await prisma.parentStudent.findUnique({ where: { parentId_studentId: { parentId, studentId } } });
    if (!link) throw ApiError.forbidden("این دانش‌آموز فرزند شما نیست");
    sendSuccess(res, await getStudentOverview(studentId));
  })
);
