import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { z } from "zod";
import { createHomeworkSchema, saveAttendanceSchema, saveGradeSchema, toDate } from "./teacher.schema";
import { ExamType } from "@prisma/client";

/** The teacher row that belongs to the logged-in user. */
export async function getMyTeacherId(userId: number) {
  const t = await prisma.teacher.findUnique({ where: { userId }, select: { id: true } });
  if (!t) throw ApiError.notFound("پروندهٔ معلم برای این حساب ثبت نشده است");
  return t.id;
}

/** A teacher may open a class if he is its homeroom teacher OR teaches any subject in it. */
async function assertClassAccess(teacherId: number, classId: number) {
  const cls = await prisma.schoolClass.findFirst({
    where: { id: classId, OR: [{ homeroomTeacherId: teacherId }, { classSubjects: { some: { teacherId } } }] },
    select: { id: true },
  });
  if (!cls) throw ApiError.forbidden("شما به این کلاس دسترسی ندارید");
}

/** Grades and homework are only allowed for subjects this teacher really teaches in that class. */
async function assertTeachesSubject(teacherId: number, classId: number, subjectId: number) {
  const row = await prisma.classSubject.findFirst({ where: { classId, subjectId, teacherId }, select: { id: true } });
  if (!row) throw ApiError.forbidden("شما این درس را در این کلاس تدریس نمی‌کنید");
}

export async function listMyClasses(teacherId: number) {
  const classes = await prisma.schoolClass.findMany({
    where: { OR: [{ homeroomTeacherId: teacherId }, { classSubjects: { some: { teacherId } } }] },
    include: {
      _count: { select: { students: true } },
      classSubjects: { where: { teacherId }, include: { subject: true } },
    },
    orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
  });
  return classes.map((c) => {
    const subjects = new Map(c.classSubjects.map((cs) => [cs.subjectId, cs.subject.title]));
    return {
      id: c.id,
      name: c.name,
      gradeLevel: c.gradeLevel,
      academicYear: c.academicYear,
      studentCount: c._count.students,
      isHomeroom: c.homeroomTeacherId === teacherId,
      subjects: [...subjects].map(([id, title]) => ({ id, title })),
    };
  });
}

export async function listClassStudents(teacherId: number, classId: number) {
  await assertClassAccess(teacherId, classId);
  return prisma.student.findMany({
    where: { classId, isActive: true },
    select: { id: true, firstName: true, lastName: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

export async function mySchedule(teacherId: number) {
  const rows = await prisma.classSubject.findMany({ where: { teacherId }, include: { subject: true, class: true } });
  return rows.map((r) => ({
    id: r.id,
    weekday: r.weekday,
    startTime: r.startTime,
    endTime: r.endTime,
    subject: r.subject.title,
    className: r.class.name,
  }));
}

export async function getAttendance(teacherId: number, classId: number, date: string) {
  await assertClassAccess(teacherId, classId);
  return prisma.attendance.findMany({
    where: { date: toDate(date), student: { classId } },
    select: { studentId: true, status: true, note: true },
  });
}

export async function saveAttendance(teacherId: number, classId: number, input: z.infer<typeof saveAttendanceSchema>) {
  await assertClassAccess(teacherId, classId);

  // Every student in the request must really be in this class.
  const ids = [...new Set(input.records.map((r) => r.studentId))];
  const inClass = await prisma.student.count({ where: { id: { in: ids }, classId } });
  if (inClass !== ids.length) throw ApiError.badRequest("دانش‌آموزی در این کلاس نیست");

  const date = toDate(input.date);
  await prisma.$transaction(
    input.records.map((r) =>
      prisma.attendance.upsert({
        where: { studentId_date: { studentId: r.studentId, date } },
        create: { studentId: r.studentId, date, status: r.status, note: r.note ?? null },
        update: { status: r.status, note: r.note ?? null },
      })
    )
  );
  return { saved: input.records.length };
}

export async function listGrades(teacherId: number, classId: number, subjectId: number, term: number) {
  await assertClassAccess(teacherId, classId);
  await assertTeachesSubject(teacherId, classId, subjectId);

  const students = await prisma.student.findMany({
    where: { classId, isActive: true },
    select: { id: true, firstName: true, lastName: true, grades: { where: { subjectId, term } } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return students.map((s) => {
    const scores: Partial<Record<ExamType, number>> = {};
    for (const g of s.grades) scores[g.examType] = Number(g.score);
    return { studentId: s.id, firstName: s.firstName, lastName: s.lastName, scores };
  });
}

/** One score per student / subject / term / exam type: saving again simply changes it. */
export async function saveGrade(teacherId: number, input: z.infer<typeof saveGradeSchema>) {
  const student = await prisma.student.findUnique({ where: { id: input.studentId }, select: { classId: true } });
  if (!student?.classId) throw ApiError.notFound("دانش‌آموز پیدا نشد");
  await assertTeachesSubject(teacherId, student.classId, input.subjectId);

  const existing = await prisma.grade.findFirst({
    where: { studentId: input.studentId, subjectId: input.subjectId, term: input.term, examType: input.examType },
  });
  const row = existing
    ? await prisma.grade.update({ where: { id: existing.id }, data: { score: input.score, recordedById: teacherId } })
    : await prisma.grade.create({ data: { ...input, recordedById: teacherId } });
  return { id: row.id, score: Number(row.score) };
}

export async function listMyHomeworks(teacherId: number) {
  const rows = await prisma.homework.findMany({
    where: { teacherId },
    include: { subject: true, class: true },
    orderBy: { dueDate: "desc" },
    take: 50,
  });
  return rows.map((h) => ({
    id: h.id,
    title: h.title,
    description: h.description,
    dueDate: h.dueDate,
    subject: h.subject.title,
    className: h.class.name,
  }));
}

export async function createHomework(teacherId: number, input: z.infer<typeof createHomeworkSchema>) {
  await assertTeachesSubject(teacherId, input.classId, input.subjectId);
  const row = await prisma.homework.create({
    data: {
      classId: input.classId,
      subjectId: input.subjectId,
      teacherId,
      title: input.title,
      description: input.description ?? null,
      dueDate: toDate(input.dueDate),
    },
  });
  return { id: row.id };
}

export async function deleteHomework(teacherId: number, id: number) {
  // Only the teacher who created it can delete it.
  const res = await prisma.homework.deleteMany({ where: { id, teacherId } });
  if (res.count === 0) throw ApiError.notFound("تکلیف پیدا نشد");
}
