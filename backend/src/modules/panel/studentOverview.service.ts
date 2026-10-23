import { Weekday } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

const WEEKDAY_ORDER: Weekday[] = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];
const teacherName = { select: { firstName: true, lastName: true } };

const average = (values: number[]) =>
  values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100 : null;

/**
 * Everything the student panel (and the parent panel, for one child) shows.
 * The caller must already have checked that the person is allowed to see this student.
 */
export async function getStudentOverview(studentId: number) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: { include: { homeroomTeacher: teacherName } } },
  });
  if (!student) throw ApiError.notFound("دانش‌آموز پیدا نشد");

  const classId = student.classId;

  const scheduleRows = classId
    ? await prisma.classSubject.findMany({ where: { classId }, include: { subject: true, teacher: teacherName } })
    : [];
  const schedule = scheduleRows
    .map((r) => ({
      id: r.id,
      weekday: r.weekday,
      startTime: r.startTime,
      endTime: r.endTime,
      subject: r.subject.title,
      teacher: r.teacher ? `${r.teacher.firstName} ${r.teacher.lastName}` : null,
    }))
    .sort(
      (a, b) =>
        WEEKDAY_ORDER.indexOf(a.weekday ?? "THURSDAY") - WEEKDAY_ORDER.indexOf(b.weekday ?? "THURSDAY") ||
        (a.startTime ?? "").localeCompare(b.startTime ?? "")
    );

  const gradeRows = await prisma.grade.findMany({
    where: { studentId },
    include: { subject: true },
    orderBy: { createdAt: "desc" },
  });
  const grades = gradeRows.map((g) => ({
    id: g.id,
    subjectId: g.subjectId,
    subject: g.subject.title,
    term: g.term,
    examType: g.examType,
    score: Number(g.score),
    createdAt: g.createdAt,
  }));

  // Report card: average score per subject for each term.
  const bySubject = new Map<number, { subject: string; t1: number[]; t2: number[] }>();
  for (const g of grades) {
    const row = bySubject.get(g.subjectId) ?? { subject: g.subject, t1: [], t2: [] };
    (g.term === 1 ? row.t1 : row.t2).push(g.score);
    bySubject.set(g.subjectId, row);
  }
  const reportSubjects = [...bySubject.values()].map((r) => ({
    subject: r.subject,
    term1: average(r.t1),
    term2: average(r.t2),
  }));
  const reportCard = {
    subjects: reportSubjects,
    term1Average: average(reportSubjects.flatMap((r) => (r.term1 === null ? [] : [r.term1]))),
    term2Average: average(reportSubjects.flatMap((r) => (r.term2 === null ? [] : [r.term2]))),
  };

  const attendanceRows = await prisma.attendance.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
    take: 120,
  });
  const attendance = {
    records: attendanceRows.map((a) => ({ id: a.id, date: a.date, status: a.status, note: a.note })),
    summary: {
      present: attendanceRows.filter((a) => a.status === "PRESENT").length,
      absent: attendanceRows.filter((a) => a.status === "ABSENT").length,
      late: attendanceRows.filter((a) => a.status === "LATE").length,
      excused: attendanceRows.filter((a) => a.status === "EXCUSED").length,
    },
  };

  const homeworkRows = classId
    ? await prisma.homework.findMany({
        where: { classId },
        include: { subject: true, teacher: teacherName },
        orderBy: { dueDate: "desc" },
        take: 30,
      })
    : [];
  const homeworks = homeworkRows.map((h) => ({
    id: h.id,
    title: h.title,
    description: h.description,
    dueDate: h.dueDate,
    subject: h.subject.title,
    teacher: h.teacher ? `${h.teacher.firstName} ${h.teacher.lastName}` : null,
  }));

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      nationalCode: student.nationalCode,
      birthDate: student.birthDate,
      gradeLevel: student.gradeLevel,
      fatherName: student.fatherName,
      class: student.class
        ? {
            id: student.class.id,
            name: student.class.name,
            academicYear: student.class.academicYear,
            homeroomTeacher: student.class.homeroomTeacher
              ? `${student.class.homeroomTeacher.firstName} ${student.class.homeroomTeacher.lastName}`
              : null,
          }
        : null,
    },
    schedule,
    grades,
    reportCard,
    attendance,
    homeworks,
  };
}
