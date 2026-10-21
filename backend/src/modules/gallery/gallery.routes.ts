import { Router } from "express";
import { adminOnly } from "../../middlewares/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { idParam } from "../../utils/validators";
import { createImageSchema, listGalleryQuery, updateImageSchema } from "./gallery.schema";
import * as service from "./gallery.service";

export const galleryRouter = Router();

galleryRouter.get("/categories", asyncHandler(async (_req, res) => sendSuccess(res, await service.listCategories())));

galleryRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.list(listGalleryQuery.parse(req.query));
    sendSuccess(res, items, { meta });
  })
);

galleryRouter.post(
  "/",
  adminOnly,
  asyncHandler(async (req, res) => {
    sendSuccess(res, await service.create(createImageSchema.parse(req.body)), { status: 201, message: "تصویر ثبت شد" });
  })
);

galleryRouter.put(
  "/:id",
  adminOnly,
  asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    sendSuccess(res, await service.update(id, updateImageSchema.parse(req.body)), { message: "تصویر ویرایش شد" });
  })
);

galleryRouter.delete(
  "/:id",
  adminOnly,
  asyncHandler(async (req, res) => {
    await service.remove(idParam.parse(req.params).id);
    sendSuccess(res, null, { message: "تصویر حذف شد" });
  })
);
