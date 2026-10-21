import { Router } from "express";
import { adminOnly } from "../../middlewares/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { idParam } from "../../utils/validators";
import { createEventSchema, listEventsQuery, updateEventSchema } from "./events.schema";
import * as service from "./events.service";

export const eventsRouter = Router();

eventsRouter.get("/categories", asyncHandler(async (_req, res) => sendSuccess(res, await service.listCategories())));

eventsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { items, meta } = await service.list(listEventsQuery.parse(req.query));
    sendSuccess(res, items, { meta });
  })
);

eventsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => sendSuccess(res, await service.getById(idParam.parse(req.params).id)))
);

eventsRouter.post(
  "/",
  adminOnly,
  asyncHandler(async (req, res) => {
    sendSuccess(res, await service.create(createEventSchema.parse(req.body)), { status: 201, message: "رویداد ثبت شد" });
  })
);

eventsRouter.put(
  "/:id",
  adminOnly,
  asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    sendSuccess(res, await service.update(id, updateEventSchema.parse(req.body)), { message: "رویداد ویرایش شد" });
  })
);

eventsRouter.delete(
  "/:id",
  adminOnly,
  asyncHandler(async (req, res) => {
    await service.remove(idParam.parse(req.params).id);
    sendSuccess(res, null, { message: "رویداد حذف شد" });
  })
);
