import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiSend } from "../lib/api";
import {
  AdminStats, AttendanceStatus, ChildSummary, ClassStudent, ContactMessageRow, EnrollmentRow, EnrollmentStatus, ExamType,
  GradeSheetRow, StudentOverview, TeacherClass, TeacherHomework, TeacherScheduleItem,
} from "../panelTypes";

const get = <T,>(path: string) => api<T>(path).then((r) => r.data);

// ---- Student / parent ----
export const useStudentOverview = () =>
  useQuery({ queryKey: ["panel", "student", "overview"], queryFn: () => get<StudentOverview>("/panel/student/overview") });

export const useParentChildren = () =>
  useQuery({ queryKey: ["panel", "parent", "children"], queryFn: () => get<ChildSummary[]>("/panel/parent/children") });

export const useChildOverview = (childId: number | null) =>
  useQuery({
    queryKey: ["panel", "parent", "child", childId],
    queryFn: () => get<StudentOverview>(`/panel/parent/children/${childId}/overview`),
    enabled: childId !== null,
  });

// ---- Admin ----
export const useAdminStats = () => useQuery({ queryKey: ["panel", "admin", "stats"], queryFn: () => get<AdminStats>("/panel/admin/stats") });

export const useEnrollments = (p: { page: number; status: string }) =>
  useQuery({
    queryKey: ["panel", "admin", "enrollments", p],
    queryFn: () => api<EnrollmentRow[]>(`/enrollments?limit=10&page=${p.page}${p.status ? `&status=${p.status}` : ""}`),
    placeholderData: keepPreviousData,
  });

export function useUpdateEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: number; status: EnrollmentStatus; adminNote?: string }) =>
      apiSend("PATCH", `/enrollments/${v.id}/status`, { status: v.status, adminNote: v.adminNote || null }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["panel", "admin"] }),
  });
}

export const useContactMessages = (page: number) =>
  useQuery({
    queryKey: ["panel", "admin", "messages", page],
    queryFn: () => api<{ messages: ContactMessageRow[]; unread: number }>(`/contact?limit=10&page=${page}`),
    placeholderData: keepPreviousData,
  });

export function useMarkMessageRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: number; isRead: boolean }) => apiSend("PATCH", `/contact/${v.id}/read`, { isRead: v.isRead }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["panel", "admin"] }),
  });
}

// ---- Teacher ----
export const useTeacherClasses = () => useQuery({ queryKey: ["panel", "teacher", "classes"], queryFn: () => get<TeacherClass[]>("/panel/teacher/classes") });
export const useTeacherSchedule = () => useQuery({ queryKey: ["panel", "teacher", "schedule"], queryFn: () => get<TeacherScheduleItem[]>("/panel/teacher/schedule") });

export const useClassStudents = (classId: number | null) =>
  useQuery({ queryKey: ["panel", "teacher", "students", classId], queryFn: () => get<ClassStudent[]>(`/panel/teacher/classes/${classId}/students`), enabled: classId !== null });

export const useClassAttendance = (classId: number | null, date: string) =>
  useQuery({
    queryKey: ["panel", "teacher", "attendance", classId, date],
    queryFn: () => get<{ studentId: number; status: AttendanceStatus; note: string | null }[]>(`/panel/teacher/classes/${classId}/attendance?date=${date}`),
    enabled: classId !== null,
  });

export function useSaveAttendance(classId: number | null, date: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (records: { studentId: number; status: AttendanceStatus }[]) =>
      apiSend("PUT", `/panel/teacher/classes/${classId}/attendance`, { date, records }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["panel", "teacher", "attendance", classId, date] }),
  });
}

export const useClassGrades = (classId: number | null, subjectId: number | null, term: number) =>
  useQuery({
    queryKey: ["panel", "teacher", "grades", classId, subjectId, term],
    queryFn: () => get<GradeSheetRow[]>(`/panel/teacher/classes/${classId}/grades?subjectId=${subjectId}&term=${term}`),
    enabled: classId !== null && subjectId !== null,
  });

export function useSaveGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { studentId: number; subjectId: number; term: number; examType: ExamType; score: number }) => apiSend("PUT", "/panel/teacher/grades", v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["panel", "teacher", "grades"] }),
  });
}

export const useTeacherHomeworks = () => useQuery({ queryKey: ["panel", "teacher", "homeworks"], queryFn: () => get<TeacherHomework[]>("/panel/teacher/homeworks") });

export function useCreateHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { classId: number; subjectId: number; title: string; description?: string; dueDate: string }) => apiSend("POST", "/panel/teacher/homeworks", v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["panel", "teacher", "homeworks"] }),
  });
}

export function useDeleteHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiSend("DELETE", `/panel/teacher/homeworks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["panel", "teacher", "homeworks"] }),
  });
}
