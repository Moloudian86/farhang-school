// Shapes of the data returned by /api/v1/panel/... and /api/v1/auth/...
export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
/** phone: admin / teacher / parent login name. studentCode: student login name. The other one is null. */
export interface AuthUser { id: number; phone: string | null; studentCode: string | null; role: Role; firstName: string; lastName: string }

export type Weekday = "SATURDAY" | "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
export type ExamType = "QUIZ" | "MIDTERM" | "FINAL" | "CLASSWORK";

export interface ScheduleItem { id: number; weekday: Weekday | null; startTime: string | null; endTime: string | null; subject: string; teacher: string | null }
export interface GradeItem { id: number; subjectId: number; subject: string; term: number; examType: ExamType; score: number; createdAt: string }
export interface HomeworkItem { id: number; title: string; description: string | null; dueDate: string; subject: string; teacher: string | null }
export interface AttendanceRecord { id: number; date: string; status: AttendanceStatus; note: string | null }

export interface StudentOverview {
  student: {
    id: number; firstName: string; lastName: string; nationalCode: string; birthDate: string; gradeLevel: number; fatherName: string;
    class: { id: number; name: string; academicYear: string; homeroomTeacher: string | null } | null;
  };
  schedule: ScheduleItem[];
  grades: GradeItem[];
  reportCard: { subjects: { subject: string; term1: number | null; term2: number | null }[]; term1Average: number | null; term2Average: number | null };
  attendance: { records: AttendanceRecord[]; summary: { present: number; absent: number; late: number; excused: number } };
  homeworks: HomeworkItem[];
}

export interface ChildSummary { id: number; firstName: string; lastName: string; gradeLevel: number; className: string | null; relationship: string }

export interface AdminStats {
  pendingEnrollments: number; totalEnrollments: number; unreadMessages: number; publishedNews: number;
  draftNews: number; teachers: number; students: number; upcomingEvents: number;
}
export type EnrollmentStatus = "PENDING" | "APPROVED" | "REJECTED";
export interface EnrollmentRow {
  id: number; firstName: string; lastName: string; nationalCode: string; birthDate: string; gradeLevel: number; fatherName: string;
  parentPhone: string; address: string; previousEducation: string | null; notes: string | null; status: EnrollmentStatus;
  adminNote: string | null; createdAt: string;
}
export interface ContactMessageRow { id: number; name: string; email: string; phone: string | null; subject: string; message: string; isRead: boolean; createdAt: string }

export interface TeacherClass {
  id: number; name: string; gradeLevel: number; academicYear: string; studentCount: number; isHomeroom: boolean;
  subjects: { id: number; title: string }[];
}
export interface ClassStudent { id: number; firstName: string; lastName: string }
export interface TeacherScheduleItem { id: number; weekday: Weekday | null; startTime: string | null; endTime: string | null; subject: string; className: string }
export interface GradeSheetRow { studentId: number; firstName: string; lastName: string; scores: Partial<Record<ExamType, number>> }
export interface TeacherHomework { id: number; title: string; description: string | null; dueDate: string; subject: string; className: string }
