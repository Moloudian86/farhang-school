import { Router } from "express";
import { adminOnly } from "../../middlewares/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { idParam } from "../../utils/validators";
import { createFacilitySchema, updateFacilitySchema } from "./facilities.schema";
import * as service from "./facilities.service";

export const facilitiesRouter = Router();

facilitiesRouter.get("/", asyncHandler(async (_req, res) => sendSuccess(res, await service.listPublic())));

facilitiesRouter.get("/admin/all", adminOnly, asyncHandler(async (_req, res) => sendSuccess(res, await service.listAll())));

facilitiesRouter.post(
  "/",
  adminOnly,
  asyncHandler(async (req, res) => {
    sendSuccess(res, await service.create(createFacilitySchema.parse(req.body)), { status: 201, message: "امکانات ثبت شد" });
  })
);

facilitiesRouter.put(
  "/:id",
  adminOnly,
  asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    sendSuccess(res, await service.update(id, updateFacilitySchema.parse(req.body)), { message: "ویرایش شد" });
  })
);

facilitiesRouter.delete(
  "/:id",
  adminOnly,
  asyncHandler(async (req, res) => {
    await service.remove(idParam.parse(req.params).id);
    sendSuccess(res, null, { message: "حذف شد" });
  })
);
