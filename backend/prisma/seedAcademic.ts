/**
 * Demo data for the user panels: a class, subjects, weekly timetable, students,
 * grades, attendance, homework and demo student/parent accounts.
 * Called from seed.ts. Safe to run more than once (it skips if the class already exists).
 */
import { AttendanceStatus, ExamType, PrismaClient, Role, Subject, Student, Weekday } from "@prisma/client";
import bcrypt from "bcryptjs";
import { allocateStudentCode } from "../src/utils/studentCode";
import { DEMO, DEMO_ENTRY } from "./demoAccounts";

const DAY = 24 * 60 * 60 * 1000;
const dayOffset = (n: number) => {
  const d = new Date(Date.now() + n * DAY);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/** Builds a VALID Iranian national code from 9 digits (adds the check digit). */
function nationalCode(base: string): string {
  const sum = base.split("").reduce((acc, d, i) => acc + Number(d) * (10 - i), 0);
  const r = sum % 11;
  return base + (r < 2 ? r : 11 - r);
}

/** Same "random" numbers every run, so the demo always looks the same. */
function makeRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const SUBJECTS = ["ریاضی", "علوم تجربی", "فارسی", "قرآن", "هدیه‌های آسمان", "مطالعات اجتماعی", "هنر", "ورزش"];
const DAYS: Weekday[] = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY"];
const SLOTS: [string, string][] = [["07:45", "08:30"], ["08:40", "09:25"], ["09:50", "10:35"], ["10:45", "11:30"]];

const STUDENTS: [string, string, string][] = [
  ["آرمین", "رضایی", "حسن"], ["سینا", "محمدی", "جواد"], ["پارسا", "کریمی", "مجید"], ["آرین", "حسینی", "رضا"],
  ["امیرعلی", "نوری", "علی"], ["مهیار", "صادقی", "کاظم"], ["پویا", "اکبری", "بهرام"], ["ایلیا", "موسوی", "سعید"],
];

/** A phone-login user (ADMIN / TEACHER / PARENT): found by phone, created if missing. */
async function ensurePhoneUser(prisma: PrismaClient, phone: string, password: string, role: Role, firstName: string, lastName: string) {
  const found = await prisma.user.findUnique({ where: { phone } });
  if (found) return found;
  return prisma.user.create({ data: { phone, passwordHash: await bcrypt.hash(password, 10), role, firstName, lastName } });
}

/** A student's user has NO phone: the student logs in with Student.studentCode. Does nothing if the student already has a user. */
async function ensureStudentUser(prisma: PrismaClient, student: Student, password: string) {
  if (student.userId) return;
  const user = await prisma.user.create({
    data: { passwordHash: await bcrypt.hash(password, 10), role: Role.STUDENT, firstName: student.firstName, lastName: student.lastName },
  });
  await prisma.student.update({ where: { id: student.id }, data: { userId: user.id } });
}

export async function seedAcademic(prisma: PrismaClient, log: (ok: boolean, text: string) => void) {
  const academicYear = "1405-1406";
  if (await prisma.schoolClass.findFirst({ where: { name: "ششم الف", academicYear } })) {
    return log(false, "academic demo data already exists");
  }

  const teachers = await prisma.teacher.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  const homeroom = teachers.find((t) => t.userId !== null) ?? teachers[0];
  if (!homeroom) return log(false, "academic demo data skipped (no teachers yet)");

  // Subjects
  const subjects: Subject[] = [];
  for (const title of SUBJECTS) {
    subjects.push((await prisma.subject.findFirst({ where: { title } })) ?? (await prisma.subject.create({ data: { title } })));
  }
  log(true, `subjects (${subjects.length})`);

  // Class
  const cls = await prisma.schoolClass.create({
    data: { name: "ششم الف", gradeLevel: 6, academicYear, homeroomTeacherId: homeroom.id },
  });

  // Timetable: the demo teacher teaches math; other subjects rotate between the other teachers.
  const others = teachers.filter((t) => t.id !== homeroom.id);
  const teacherOf = (i: number) => (i === 0 ? homeroom : others[(i - 1) % Math.max(others.length, 1)] ?? homeroom);
  const timetable = DAYS.flatMap((weekday, d) =>
    SLOTS.map(([startTime, endTime], s) => {
      const subjectIndex = (d * SLOTS.length + s) % subjects.length;
      return { classId: cls.id, subjectId: subjects[subjectIndex].id, teacherId: teacherOf(subjectIndex).id, weekday, startTime, endTime };
    })
  );
  await prisma.classSubject.createMany({ data: timetable });
  log(true, `timetable (${timetable.length} lessons)`);

  // Students. Every student gets a permanent code "<entry year>-<entry grade>-<sequence>", e.g. 1405-6-001.
  // The first student also gets the demo login (student code + password; students have no phone or e-mail).
  const students: Student[] = [];
  for (let i = 0; i < STUDENTS.length; i++) {
    const [firstName, lastName, fatherName] = STUDENTS[i];
    const code = nationalCode(`00${(1234500 + i * 37).toString()}`.slice(-9));

    let student = await prisma.student.findUnique({ where: { nationalCode: code } });
    if (!student) {
      student = await prisma.student.create({
        data: {
          firstName, lastName, fatherName,
          nationalCode: code,
          birthDate: new Date(Date.UTC(2014, i % 12, 5 + i)),
          gradeLevel: 6,
          classId: cls.id,
          ...(await allocateStudentCode(prisma, DEMO_ENTRY.year, DEMO_ENTRY.grade)),
        },
      });
    }
    if (i === 0) await ensureStudentUser(prisma, student, DEMO.student.password);
    students.push(student);
  }
  log(true, `students (${students.length}), demo login code: ${students[0].studentCode}`);

  // Demo parent of the first student (phone + password)
  const parentUser = await ensurePhoneUser(prisma, DEMO.parent.phone, DEMO.parent.password, Role.PARENT, "حسن", "رضایی");
  const parent =
    (await prisma.parent.findUnique({ where: { phone: DEMO.parent.phone } })) ??
    (await prisma.parent.create({
      data: { userId: parentUser.id, firstName: "حسن", lastName: "رضایی", phone: DEMO.parent.phone, address: "اصفهان، خیابان چهارباغ بالا" },
    }));
  if (!parent.userId) await prisma.parent.update({ where: { id: parent.id }, data: { userId: parentUser.id } });
  await prisma.parentStudent.upsert({
    where: { parentId_studentId: { parentId: parent.id, studentId: students[0].id } },
    update: {},
    create: { parentId: parent.id, studentId: students[0].id, relationship: "FATHER" },
  });
  log(true, "parent account linked to the first student");

  // Grades (term 1: a quiz and a classwork score per subject, one score per type)
  const rnd = makeRandom(42);
  const gradeRows = students.flatMap((st) =>
    subjects.flatMap((sub, si) =>
      ([ExamType.QUIZ, ExamType.CLASSWORK] as ExamType[]).map((examType) => ({
        studentId: st.id,
        subjectId: sub.id,
        term: 1,
        examType,
        score: Math.round((14 + rnd() * 6) * 4) / 4, // 14 .. 20 in steps of 0.25
        recordedById: teacherOf(si).id,
      }))
    )
  );
  await prisma.grade.createMany({ data: gradeRows });
  log(true, `grades (${gradeRows.length})`);

  // Attendance: last 24 days, skipping Thursday and Friday (weekend in Iran)
  const attendanceRows: { studentId: number; date: Date; status: AttendanceStatus; note: string | null }[] = [];
  for (let back = 1; back <= 24; back++) {
    const date = dayOffset(-back);
    const dow = date.getUTCDay(); // 4 = Thursday, 5 = Friday
    if (dow === 4 || dow === 5) continue;
    for (const st of students) {
      const x = rnd();
      const status: AttendanceStatus = x < 0.05 ? "ABSENT" : x < 0.09 ? "LATE" : x < 0.11 ? "EXCUSED" : "PRESENT";
      attendanceRows.push({ studentId: st.id, date, status, note: status === "EXCUSED" ? "مراجعه به پزشک" : null });
    }
  }
  await prisma.attendance.createMany({ data: attendanceRows });
  log(true, `attendance (${attendanceRows.length} records)`);

  // Homework
  const homeworks = [
    { s: 0, title: "حل تمرین‌های صفحهٔ ۴۲", description: "مسئله‌های ۱ تا ۸ کتاب ریاضی را در دفتر حل کنید.", due: 2 },
    { s: 1, title: "گزارش آزمایش گیاه و نور", description: "نتیجهٔ آزمایش کلاس را در پنج جمله بنویسید.", due: 4 },
    { s: 2, title: "نوشتن متن «یک روز بهاری»", description: "یک متن ده‌سطری با رعایت نگارش بنویسید.", due: 5 },
    { s: 3, title: "حفظ آیه‌های درس سوم", description: "آیه‌ها را با روخوانی صحیح حفظ کنید.", due: 7 },
    { s: 5, title: "تحقیق دربارهٔ شهر اصفهان", description: "دربارهٔ سه جای دیدنی شهر تحقیق کنید و به کلاس بیاورید.", due: -3 },
  ];
  await prisma.homework.createMany({
    data: homeworks.map((h) => ({
      classId: cls.id,
      subjectId: subjects[h.s].id,
      teacherId: teacherOf(h.s).id,
      title: h.title,
      description: h.description,
      dueDate: dayOffset(h.due),
    })),
  });
  log(true, `homeworks (${homeworks.length})`);
}
