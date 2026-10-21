import { Router } from "express";
import { authRouter } from "./modules/auth/auth.routes";
import { contactRouter } from "./modules/contact/contact.routes";
import { enrollmentsRouter } from "./modules/enrollments/enrollments.routes";
import { eventsRouter } from "./modules/events/events.routes";
import { facilitiesRouter } from "./modules/facilities/facilities.routes";
import { galleryRouter } from "./modules/gallery/gallery.routes";
import { newsRouter } from "./modules/news/news.routes";
import { schoolInfoRouter } from "./modules/school-info/schoolInfo.routes";
import { statisticsRouter } from "./modules/statistics/statistics.routes";
import { teachersRouter } from "./modules/teachers/teachers.routes";
import { uploadsRouter } from "./modules/uploads/uploads.routes";

/** The table of contents of the API. Every URL below starts with /api/v1 */
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/school-info", schoolInfoRouter);
apiRouter.use("/statistics", statisticsRouter);
apiRouter.use("/facilities", facilitiesRouter);
apiRouter.use("/teachers", teachersRouter);
apiRouter.use("/news", newsRouter);
apiRouter.use("/events", eventsRouter);
apiRouter.use("/gallery", galleryRouter);
apiRouter.use("/enrollments", enrollmentsRouter);
apiRouter.use("/contact", contactRouter);
apiRouter.use("/uploads", uploadsRouter);
