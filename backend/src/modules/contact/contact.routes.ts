import { Router } from "express";
import { adminOnly } from "../../middlewares/auth";
import { formLimiter } from "../../middlewares/rateLimit";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { idParam } from "../../utils/validators";
import { createContactSchema, listContactQuery, markReadSchema } from "./contact.schema";
import * as service from "./contact.service";

export const contactRouter = Router();

// Public: the "contact us" form.
contactRouter.post(
  "/",
  formLimiter,
  asyncHandler(async (req, res) => {
    if (req.body?.website) return sendSuccess(res, { id: 0 }, { status: 201 }); // honeypot (bots only)

    const receipt = await service.create(createContactSchema.parse(req.body));
    sendSuccess(res, receipt, { status: 201, message: "پیام شما ارسال شد. به‌زودی پاسخ می‌دهیم" });
  })
);

// Admin only
contactRouter.get(
  "/",
  adminOnly,
  asyncHandler(async (req, res) => {
    const { items, meta, unread } = await service.adminList(listContactQuery.parse(req.query));
    sendSuccess(res, { messages: items, unread }, { meta });
  })
);

contactRouter.patch(
  "/:id/read",
  adminOnly,
  asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const { isRead } = markReadSchema.parse(req.body ?? {});
    sendSuccess(res, await service.markRead(id, isRead), { message: "وضعیت پیام تغییر کرد" });
  })
);
