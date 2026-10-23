import { useState } from "react";
import Chips from "../../../components/ui/Chips";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useToast } from "../../../components/ui/Toast";
import { PanelTitle } from "../../../components/panel/PanelUi";
import { useClassGrades, useSaveGrade, useTeacherClasses } from "../../../hooks/usePanelApi";
import { FormError } from "../../../lib/api";
import { EXAM_LABEL, EXAM_ORDER } from "../../../lib/labels";
import { normalizeDigits } from "../../../lib/validators";
import { ExamType } from "../../../panelTypes";
import ClassPicker from "./ClassPicker";

/** One score box. The score is saved when the teacher leaves the box (and the value really changed). */
function ScoreCell({ initial, label, onSave }: { initial: number | undefined; label: string; onSave: (score: number) => Promise<void> }) {
  const [text, setText] = useState(initial === undefined ? "" : String(initial));
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");

  async function commit() {
    const raw = normalizeDigits(text.trim()).replace("٫", ".").replace(",", ".");
    if (raw === "" || raw === String(initial ?? "")) return;
    const score = Number(raw);
    if (Number.isNaN(score) || score < 0 || score > 20) { setState("error"); return; }
    setState("saving");
    try { await onSave(score); setState("idle"); } catch { setState("error"); }
  }

  return (
    <input
      aria-label={label} inputMode="decimal" dir="ltr" value={text} placeholder="—"
      onChange={(e) => { setText(e.target.value); setState("idle"); }} onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      className={`w-20 rounded-lg px-2 py-1.5 text-center text-sm ring-1 focus:outline-none focus:ring-2 ${state === "error" ? "ring-red-400" : state === "saving" ? "opacity-60 ring-primary/20" : "ring-primary/20 focus:ring-primary-soft"}`}
    />
  );
}

export default function TeacherGrades() {
  const classes = useTeacherClasses();
  const toast = useToast();
  const saveGrade = useSaveGrade();
  const [pickedClass, setPickedClass] = useState<number | null>(null);
  const [pickedSubject, setPickedSubject] = useState<number | null>(null);
  const [term, setTerm] = useState("1");

  const cls = classes.data?.find((c) => c.id === pickedClass) ?? classes.data?.[0];
  const classId = cls?.id ?? null;
  const subjectId = cls?.subjects.find((s) => s.id === pickedSubject)?.id ?? cls?.subjects[0]?.id ?? null;
  const sheet = useClassGrades(classId, subjectId, Number(term));

  if (classes.isLoading) return <Skeleton className="h-64" />;
  if (classes.isError) return <ErrorState onRetry={() => classes.refetch()} />;
  if (!classes.data?.length) return <EmptyState>هنوز کلاسی به شما اختصاص داده نشده است.</EmptyState>;

  async function save(studentId: number, examType: ExamType, score: number) {
    try {
      await saveGrade.mutateAsync({ studentId, subjectId: subjectId!, term: Number(term), examType, score });
    } catch (err) {
      toast("error", err instanceof FormError ? err.message : "ثبت نمره انجام نشد");
      throw err;
    }
  }

  return (
    <>
      <PanelTitle title="ثبت نمره" subtitle="نمره را بنویسید و روی جای دیگری کلیک کنید (یا Enter بزنید) تا ذخیره شود. نمره‌ها از ۲۰ هستند." />
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <div><label htmlFor="class-picker" className="mb-1 block text-sm font-bold text-primary">کلاس</label><ClassPicker classes={classes.data} value={classId} onChange={(id) => { setPickedClass(id); setPickedSubject(null); }} /></div>
        <div>
          <label htmlFor="subject-picker" className="mb-1 block text-sm font-bold text-primary">درس</label>
          <select id="subject-picker" value={subjectId ?? ""} onChange={(e) => setPickedSubject(Number(e.target.value))} className="rounded-xl bg-white px-4 py-2.5 text-sm ring-1 ring-primary/20">
            {cls?.subjects.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
        <Chips label="نیمسال" active={term} onChange={setTerm} items={[{ value: "1", label: "نیمسال اول" }, { value: "2", label: "نیمسال دوم" }]} />
      </div>

      {!cls?.subjects.length ? <EmptyState>شما در این کلاس درسی تدریس نمی‌کنید.</EmptyState> : sheet.isLoading ? <Skeleton className="h-64" /> : sheet.isError ? <ErrorState message={(sheet.error as Error).message} onRetry={() => sheet.refetch()} /> : !sheet.data?.length ? <EmptyState>این کلاس دانش‌آموزی ندارد.</EmptyState> : (
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-primary/10">
          <table className="w-full min-w-[34rem] text-sm">
            <thead className="bg-primary-tint text-primary"><tr><th className="p-3 text-start">دانش‌آموز</th>{EXAM_ORDER.map((t) => <th key={t} className="p-3 text-center">{EXAM_LABEL[t]}</th>)}</tr></thead>
            <tbody>
              {sheet.data.map((row) => (
                <tr key={`${row.studentId}-${subjectId}-${term}`} className="border-t border-primary/10">
                  <td className="p-3 font-bold">{row.firstName} {row.lastName}</td>
                  {EXAM_ORDER.map((t) => (
                    <td key={t} className="p-3 text-center">
                      <ScoreCell initial={row.scores[t]} label={`${EXAM_LABEL[t]} ${row.firstName} ${row.lastName}`} onSave={(score) => save(row.studentId, t, score)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
