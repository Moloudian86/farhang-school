import { Router } from "express";
import { adminOnly } from "../../middlewares/auth";
import { formLimiter } from "../../middlewares/rateLimit";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { idParam } from "../../utils/validators";
import { createEnrollmentSchema, listEnrollmentsQuery, updateStatusSchema } from "./enrollments.schema";
import * as service from "./enrollments.service";

export const enrollmentsRouter = Router();

// Public: parents send the enrollment form.
enrollmentsRouter.post(
  "/",
  formLimiter,
  asyncHandler(async (req, res) => {
    // Honeypot: real people never see/fill the hidden "website" field, bots do. We silently ignore them.
    if (req.body?.website) return sendSuccess(res, { id: 0, status: "PENDING" }, { status: 201 });

    const receipt = await service.create(createEnrollmentSchema.parse(req.body));
    sendSuccess(res, receipt, { status: 201, message: "درخواست ثبت‌نام شما با موفقیت ثبت شد" });
  })
);

// Admin only
enrollmentsRouter.get(
  "/",
  adminOnly,
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.adminList(listEnrollmentsQuery.parse(req.query));
    sendSuccess(res, items, { meta });
  })
);

enrollmentsRouter.get(
  "/:id",
  adminOnly,
  asyncHandler(async (req, res) => sendSuccess(res, await service.adminGet(idParam.parse(req.params).id)))
);

enrollmentsRouter.patch(
  "/:id/status",
  adminOnly,
  asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const { status, adminNote } = updateStatusSchema.parse(req.body);
    sendSuccess(res, await service.updateStatus(id, status, adminNote), { message: "وضعیت درخواست تغییر کرد" });
  })
);
