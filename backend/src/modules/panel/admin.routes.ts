import { Router } from "express";
import { prisma } from "../../config/prisma";
import { adminOnly } from "../../middlewares/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";

export const adminPanelRouter = Router();
adminPanelRouter.use(adminOnly);

// Numbers for the admin dashboard cards.
adminPanelRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [pendingEnrollments, totalEnrollments, unreadMessages, publishedNews, draftNews, teachers, students, upcomingEvents] =
      await prisma.$transaction([
        prisma.enrollment.count({ where: { status: "PENDING" } }),
        prisma.enrollment.count(),
        prisma.contactMessage.count({ where: { isRead: false } }),
        prisma.news.count({ where: { status: "PUBLISHED" } }),
        prisma.news.count({ where: { status: "DRAFT" } }),
        prisma.teacher.count({ where: { isActive: true } }),
        prisma.student.count({ where: { isActive: true } }),
        prisma.event.count({ where: { eventDate: { gte: new Date(new Date().toISOString().slice(0, 10)) } } }),
      ]);
    sendSuccess(res, { pendingEnrollments, totalEnrollments, unreadMessages, publishedNews, draftNews, teachers, students, upcomingEvents });
  })
);
