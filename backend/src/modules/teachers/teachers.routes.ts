import { Router } from "express";
import { adminOnly } from "../../middlewares/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { idParam } from "../../utils/validators";
import { createTeacherSchema, updateTeacherSchema } from "./teachers.schema";
import * as service from "./teachers.service";

export const teachersRouter = Router();

teachersRouter.get("/", asyncHandler(async (_req, res) => sendSuccess(res, await service.listPublic())));

teachersRouter.get("/admin/all", adminOnly, asyncHandler(async (_req, res) => sendSuccess(res, await service.listAll())));

teachersRouter.post(
  "/",
  adminOnly,
  asyncHandler(async (req, res) => {
    sendSuccess(res, await service.create(createTeacherSchema.parse(req.body)), { status: 201, message: "معلم ثبت شد" });
  })
);

teachersRouter.put(
  "/:id",
  adminOnly,
  asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    sendSuccess(res, await service.update(id, updateTeacherSchema.parse(req.body)), { message: "اطلاعات معلم ویرایش شد" });
  })
);

teachersRouter.delete(
  "/:id",
  adminOnly,
  asyncHandler(async (req, res) => {
    await service.remove(idParam.parse(req.params).id);
    sendSuccess(res, null, { message: "معلم حذف شد" });
  })
);
