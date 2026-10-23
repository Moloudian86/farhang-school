import { Router } from "express";
import { teacherOnly } from "../../middlewares/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { idParam } from "../../utils/validators";
import {
  attendanceQuery, classIdParam, createHomeworkSchema, gradesQuery, saveAttendanceSchema, saveGradeSchema,
} from "./teacher.schema";
import * as service from "./teacher.service";

export const teacherPanelRouter = Router();
teacherPanelRouter.use(teacherOnly);

// Small helper: every handler needs the id of the logged-in teacher.
const me = (userId: number) => service.getMyTeacherId(userId);

teacherPanelRouter.get("/classes", asyncHandler(async (req, res) => sendSuccess(res, await service.listMyClasses(await me(req.user!.id)))));

teacherPanelRouter.get("/schedule", asyncHandler(async (req, res) => sendSuccess(res, await service.mySchedule(await me(req.user!.id)))));

teacherPanelRouter.get(
  "/classes/:classId/students",
  asyncHandler(async (req, res) => {
    const { classId } = classIdParam.parse(req.params);
    sendSuccess(res, await service.listClassStudents(await me(req.user!.id), classId));
  })
);

teacherPanelRouter.get(
  "/classes/:classId/attendance",
  asyncHandler(async (req, res) => {
    const { classId } = classIdParam.parse(req.params);
    const { date } = attendanceQuery.parse(req.query);
    sendSuccess(res, await service.getAttendance(await me(req.user!.id), classId, date));
  })
);

teacherPanelRouter.put(
  "/classes/:classId/attendance",
  asyncHandler(async (req, res) => {
    const { classId } = classIdParam.parse(req.params);
    const input = saveAttendanceSchema.parse(req.body);
    sendSuccess(res, await service.saveAttendance(await me(req.user!.id), classId, input), { message: "حضور و غیاب ثبت شد" });
  })
);

teacherPanelRouter.get(
  "/classes/:classId/grades",
  asyncHandler(async (req, res) => {
    const { classId } = classIdParam.parse(req.params);
    const { subjectId, term } = gradesQuery.parse(req.query);
    sendSuccess(res, await service.listGrades(await me(req.user!.id), classId, subjectId, term));
  })
);

teacherPanelRouter.put(
  "/grades",
  asyncHandler(async (req, res) => {
    sendSuccess(res, await service.saveGrade(await me(req.user!.id), saveGradeSchema.parse(req.body)), { message: "نمره ثبت شد" });
  })
);

teacherPanelRouter.get("/homeworks", asyncHandler(async (req, res) => sendSuccess(res, await service.listMyHomeworks(await me(req.user!.id)))));

teacherPanelRouter.post(
  "/homeworks",
  asyncHandler(async (req, res) => {
    const input = createHomeworkSchema.parse(req.body);
    sendSuccess(res, await service.createHomework(await me(req.user!.id), input), { status: 201, message: "تکلیف ثبت شد" });
  })
);

teacherPanelRouter.delete(
  "/homeworks/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    await service.deleteHomework(await me(req.user!.id), id);
    sendSuccess(res, null, { message: "تکلیف حذف شد" });
  })
);
