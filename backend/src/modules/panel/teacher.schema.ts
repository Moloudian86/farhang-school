import { AttendanceStatus, ExamType } from "@prisma/client";
import { z } from "zod";

/** "2026-10-21" -> Date at midnight UTC (our DATE columns are stored without time). */
export const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "تاریخ باید به شکل 2026-10-21 باشد")
  .refine((v) => !Number.isNaN(new Date(`${v}T00:00:00.000Z`).getTime()), "تاریخ نامعتبر است");
export const toDate = (v: string) => new Date(`${v}T00:00:00.000Z`);

const id = z.coerce.number().int().positive();

export const classIdParam = z.object({ classId: id });
export const attendanceQuery = z.object({ date: dateString });

export const saveAttendanceSchema = z.object({
  date: dateString,
  records: z
    .array(
      z.object({
        studentId: id,
        status: z.nativeEnum(AttendanceStatus),
        note: z.string().trim().max(255).nullish(),
      })
    )
    .min(1)
    .max(60),
});

export const gradesQuery = z.object({
  subjectId: id,
  term: z.coerce.number().int().min(1).max(2).default(1),
});

export const saveGradeSchema = z.object({
  studentId: id,
  subjectId: id,
  term: z.coerce.number().int().min(1).max(2),
  examType: z.nativeEnum(ExamType),
  score: z.coerce.number().min(0, "نمره نمی‌تواند منفی باشد").max(20, "نمره حداکثر ۲۰ است"),
});

export const createHomeworkSchema = z.object({
  classId: id,
  subjectId: id,
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000).nullish(),
  dueDate: dateString,
});
