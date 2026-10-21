import { Router } from "express";
import { adminOnly } from "../../middlewares/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { idParam } from "../../utils/validators";
import { adminListNewsQuery, createNewsSchema, listNewsQuery, updateNewsSchema } from "./news.schema";
import * as service from "./news.service";

export const newsRouter = Router();

// NOTE: fixed words ("categories", "admin/all") must come BEFORE "/:slug".
newsRouter.get("/categories", asyncHandler(async (_req, res) => sendSuccess(res, await service.listCategories())));

newsRouter.get(
  "/admin/all",
  adminOnly,
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.adminList(adminListNewsQuery.parse(req.query));
    sendSuccess(res, items, { meta });
  })
);

newsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.listPublished(listNewsQuery.parse(req.query));
    sendSuccess(res, items, { meta });
  })
);

newsRouter.get(
  "/:slug",
  asyncHandler(async (req, res) => sendSuccess(res, await service.getPublishedBySlug(req.params.slug)))
);

newsRouter.post(
  "/",
  adminOnly,
  asyncHandler(async (req, res) => {
    const input = createNewsSchema.parse(req.body);

    const news = await service.create({
      ...input,
      slug: input.slug ?? `news-${Date.now()}`
    });

    sendSuccess(res, news, { status: 201, message: "خبر ثبت شد" });
  })
);

newsRouter.put(
  "/:id",
  adminOnly,
  asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    sendSuccess(res, await service.update(id, updateNewsSchema.parse(req.body)), { message: "خبر ویرایش شد" });
  })
);

newsRouter.delete(
  "/:id",
  adminOnly,
  asyncHandler(async (req, res) => {
    await service.remove(idParam.parse(req.params).id);
    sendSuccess(res, null, { message: "خبر حذف شد" });
  })
);