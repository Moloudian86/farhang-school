import { FormEvent, useState } from "react";
import FormField, { inputClass } from "../../../components/ui/FormField";
import JalaliDateSelect from "../../../components/ui/JalaliDateSelect";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useToast } from "../../../components/ui/Toast";
import { Card, PanelTitle } from "../../../components/panel/PanelUi";
import { useCreateHomework, useDeleteHomework, useTeacherClasses, useTeacherHomeworks } from "../../../hooks/usePanelApi";
import { FormError } from "../../../lib/api";
import { formatDate } from "../../../lib/format";
import { todayIso } from "../../../lib/jalali";
import ClassPicker from "./ClassPicker";

export default function TeacherHomework() {
  const classes = useTeacherClasses();
  const list = useTeacherHomeworks();
  const create = useCreateHomework();
  const remove = useDeleteHomework();
  const toast = useToast();

  const [pickedClass, setPickedClass] = useState<number | null>(null);
  const [pickedSubject, setPickedSubject] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(todayIso());
  const [error, setError] = useState("");

  const cls = classes.data?.find((c) => c.id === pickedClass) ?? classes.data?.[0];
  const subjectId = cls?.subjects.find((s) => s.id === pickedSubject)?.id ?? cls?.subjects[0]?.id ?? null;

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!cls || subjectId === null) return;
    if (title.trim().length < 3) return setError("عنوان تکلیف را بنویسید (حداقل ۳ حرف)");
    setError("");
    try {
      await create.mutateAsync({ classId: cls.id, subjectId, title: title.trim(), description: description.trim() || undefined, dueDate });
      toast("success", "تکلیف ثبت شد");
      setTitle(""); setDescription("");
    } catch (err) {
      toast("error", err instanceof FormError ? err.message : "ثبت تکلیف انجام نشد");
    }
  }

  async function onDelete(id: number) {
    if (!window.confirm("این تکلیف حذف شود؟")) return;
    try { await remove.mutateAsync(id); toast("success", "تکلیف حذف شد"); } catch (err) { toast("error", err instanceof FormError ? err.message : "حذف انجام نشد"); }
  }

  if (classes.isLoading) return <Skeleton className="h-64" />;
  if (classes.isError) return <ErrorState onRetry={() => classes.refetch()} />;
  if (!classes.data?.length) return <EmptyState>هنوز کلاسی به شما اختصاص داده نشده است.</EmptyState>;

  return (
    <>
      <PanelTitle title="تکالیف" subtitle="تکلیف جدید برای کلاس بفرستید؛ دانش‌آموزان و والدین آن را در پنل خود می‌بینند." />
      <form onSubmit={onSubmit} noValidate className="mb-8 space-y-4 rounded-2xl bg-white p-5 ring-1 ring-primary/10">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="hw-class" label="کلاس"><ClassPicker id="hw-class" classes={classes.data} value={cls?.id ?? null} onChange={(id) => { setPickedClass(id); setPickedSubject(null); }} /></FormField>
          <FormField id="hw-subject" label="درس">
            <select id="hw-subject" value={subjectId ?? ""} onChange={(e) => setPickedSubject(Number(e.target.value))} className={`${inputClass(false)} appearance-none`}>
              {cls?.subjects.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </FormField>
        </div>
        <FormField id="hw-title" label="عنوان تکلیف" required error={error}><input id="hw-title" className={inputClass(!!error)} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} /></FormField>
        <FormField id="hw-desc" label="توضیحات (اختیاری)"><textarea id="hw-desc" rows={3} maxLength={2000} className={inputClass(false)} value={description} onChange={(e) => setDescription(e.target.value)} /></FormField>
        <div className="max-w-xs"><span className="mb-1.5 block text-sm font-bold text-primary">مهلت تحویل</span><JalaliDateSelect label="مهلت تحویل" value={dueDate} onChange={setDueDate} /></div>
        {!cls?.subjects.length ? <p className="text-sm text-red-600">شما در این کلاس درسی تدریس نمی‌کنید.</p> : (
          <button type="submit" disabled={create.isPending} className="rounded-xl bg-primary px-7 py-3 font-bold text-white hover:bg-primary/90 disabled:opacity-60">{create.isPending ? "در حال ثبت..." : "ثبت تکلیف"}</button>
        )}
      </form>

      <h2 className="mb-3 text-lg font-extrabold text-primary">تکالیف ثبت‌شده</h2>
      {list.isLoading ? <Skeleton className="h-32" /> : list.isError ? <ErrorState onRetry={() => list.refetch()} /> : !list.data?.length ? <EmptyState>هنوز تکلیفی ثبت نکرده‌اید.</EmptyState> : (
        <ul className="space-y-3">
          {list.data.map((h) => (
            <li key={h.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 className="font-extrabold">{h.title}</h3><p className="mt-1 text-sm text-ink/65">{h.className} — {h.subject} — مهلت: {formatDate(h.dueDate)}</p></div>
                  <button onClick={() => onDelete(h.id)} disabled={remove.isPending} className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 ring-1 ring-red-300 hover:bg-red-50 disabled:opacity-60">حذف</button>
                </div>
                {h.description && <p className="mt-2 text-sm leading-7 text-ink/80">{h.description}</p>}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
