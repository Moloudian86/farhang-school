import { AttendanceStatus, ExamType, Role, Weekday } from "../panelTypes";

export const ROLE_LABEL: Record<Role, string> = { ADMIN: "مدیر", TEACHER: "معلم", STUDENT: "دانش‌آموز", PARENT: "والد" };

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  SATURDAY: "شنبه", SUNDAY: "یکشنبه", MONDAY: "دوشنبه", TUESDAY: "سه‌شنبه", WEDNESDAY: "چهارشنبه", THURSDAY: "پنجشنبه",
};
export const WEEKDAY_ORDER: Weekday[] = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];

export const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = { PRESENT: "حاضر", ABSENT: "غایب", LATE: "تأخیر", EXCUSED: "غیبت موجه" };
export const ATTENDANCE_STYLE: Record<AttendanceStatus, string> = {
  PRESENT: "bg-ok/15 text-emerald-700", ABSENT: "bg-red-100 text-red-700", LATE: "bg-accent/20 text-accent-dark", EXCUSED: "bg-primary-tint text-primary",
};

export const EXAM_LABEL: Record<ExamType, string> = { QUIZ: "آزمونک", CLASSWORK: "فعالیت کلاسی", MIDTERM: "میان‌ترم", FINAL: "پایان‌ترم" };
export const EXAM_ORDER: ExamType[] = ["QUIZ", "CLASSWORK", "MIDTERM", "FINAL"];

export const GRADE_LEVEL_LABEL = ["", "اول", "دوم", "سوم", "چهارم", "پنجم", "ششم"];

const score = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });
export const formatScore = (n: number | null) => (n === null ? "—" : score.format(n));
