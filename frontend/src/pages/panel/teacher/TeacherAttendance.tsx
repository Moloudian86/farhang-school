import { useEffect, useState } from "react";
import JalaliDateSelect from "../../../components/ui/JalaliDateSelect";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useToast } from "../../../components/ui/Toast";
import { PanelTitle } from "../../../components/panel/PanelUi";
import { useClassAttendance, useClassStudents, useSaveAttendance, useTeacherClasses } from "../../../hooks/usePanelApi";
import { FormError } from "../../../lib/api";
import { todayIso } from "../../../lib/jalali";
import { ATTENDANCE_LABEL } from "../../../lib/labels";
import { AttendanceStatus } from "../../../panelTypes";
import ClassPicker from "./ClassPicker";

const STATUSES: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];
const ACTIVE: Record<AttendanceStatus, string> = {
  PRESENT: "bg-ok text-white", ABSENT: "bg-red-600 text-white", LATE: "bg-accent text-ink", EXCUSED: "bg-primary text-white",
};

export default function TeacherAttendance() {
  const classes = useTeacherClasses();
  const toast = useToast();
  const [pickedClass, setPickedClass] = useState<number | null>(null);
  const [date, setDate] = useState(todayIso());
  const classId = pickedClass ?? classes.data?.[0]?.id ?? null;

  const students = useClassStudents(classId);
  const existing = useClassAttendance(classId, date);
  const save = useSaveAttendance(classId, date);
  const [marks, setMarks] = useState<Record<number, AttendanceStatus>>({});

  // Start from what is already saved for this day; students without a record default to "present".
  useEffect(() => {
    if (!students.data || !existing.data) return;
    const next: Record<number, AttendanceStatus> = {};
    students.data.forEach((s) => { next[s.id] = existing.data.find((a) => a.studentId === s.id)?.status ?? "PRESENT"; });
    setMarks(next);
  }, [students.data, existing.data]);

  async function onSave() {
    try {
      const res = await save.mutateAsync(Object.entries(marks).map(([id, status]) => ({ studentId: Number(id), status })));
      toast("success", res.message ?? "حضور و غیاب ثبت شد");
    } catch (err) {
      toast("error", err instanceof FormError ? err.message : "ثبت انجام نشد");
    }
  }

  if (classes.isLoading) return <Skeleton className="h-64" />;
  if (classes.isError) return <ErrorState onRetry={() => classes.refetch()} />;
  if (!classes.data?.length) return <EmptyState>هنوز کلاسی به شما اختصاص داده نشده است.</EmptyState>;

  const setAll = (status: AttendanceStatus) => setMarks((m) => Object.fromEntries(Object.keys(m).map((k) => [k, status])));

  return (
    <>
      <PanelTitle title="ثبت حضور و غیاب" />
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <div><label htmlFor="class-picker" className="mb-1 block text-sm font-bold text-primary">کلاس</label><ClassPicker classes={classes.data} value={classId} onChange={setPickedClass} /></div>
        <div className="w-72 max-w-full"><span className="mb-1 block text-sm font-bold text-primary">تاریخ</span><JalaliDateSelect label="تاریخ حضور و غیاب" value={date} onChange={setDate} /></div>
      </div>

      {students.isLoading || existing.isLoading ? <Skeleton className="h-64" /> : students.isError || existing.isError ? <ErrorState onRetry={() => { void students.refetch(); void existing.refetch(); }} /> : !students.data?.length ? <EmptyState>این کلاس دانش‌آموزی ندارد.</EmptyState> : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-ink/65">همه را قرار بده:</span>
            {STATUSES.map((s) => <button key={s} onClick={() => setAll(s)} className="rounded-lg px-3 py-1 text-primary ring-1 ring-primary/30 hover:bg-primary/10">{ATTENDANCE_LABEL[s]}</button>)}
          </div>
          <ul className="divide-y divide-primary/10 rounded-2xl bg-white ring-1 ring-primary/10">
            {students.data.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="font-bold">{s.firstName} {s.lastName}</span>
                <div role="radiogroup" aria-label={`وضعیت ${s.firstName} ${s.lastName}`} className="flex flex-wrap gap-1.5">
                  {STATUSES.map((st) => (
                    <button key={st} role="radio" aria-checked={marks[s.id] === st} onClick={() => setMarks((m) => ({ ...m, [s.id]: st }))}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${marks[s.id] === st ? ACTIVE[st] : "bg-paper text-ink/70 hover:bg-primary/10"}`}>
                      {ATTENDANCE_LABEL[st]}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <button onClick={onSave} disabled={save.isPending} className="mt-5 rounded-xl bg-primary px-8 py-3 font-bold text-white hover:bg-primary/90 disabled:opacity-60">
            {save.isPending ? "در حال ثبت..." : "ثبت حضور و غیاب"}
          </button>
        </>
      )}
    </>
  );
}
