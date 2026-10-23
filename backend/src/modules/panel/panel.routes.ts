import { Router } from "express";
import { adminPanelRouter } from "./admin.routes";
import { parentPanelRouter } from "./parent.routes";
import { studentPanelRouter } from "./student.routes";
import { teacherPanelRouter } from "./teacher.routes";

/** Each role gets its own folder of URLs. The role check happens inside each router. */
export const panelRouter = Router();

panelRouter.use("/admin", adminPanelRouter);
panelRouter.use("/teacher", teacherPanelRouter);
panelRouter.use("/student", studentPanelRouter);
panelRouter.use("/parent", parentPanelRouter);
