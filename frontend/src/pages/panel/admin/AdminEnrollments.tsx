import { useState } from "react";
import Chips from "../../../components/ui/Chips";
import Modal from "../../../components/ui/Modal";
import Pagination from "../../../components/ui/Pagination";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useToast } from "../../../components/ui/Toast";
import { inputClass } from "../../../components/ui/FormField";
import { Badge, PanelTitle } from "../../../components/panel/PanelUi";
import { useEnrollments, useUpdateEnrollment } from "../../../hooks/usePanelApi";
import { FormError } from "../../../lib/api";
import { formatDate, formatTime } from "../../../lib/format";
import { GRADE_LEVEL_LABEL } from "../../../lib/labels";
import { EnrollmentRow, EnrollmentStatus } from "../../../panelTypes";

const STATUS_LABEL: Record<EnrollmentStatus, string> = { PENDING: "در انتظار بررسی", APPROVED: "تأییدشده", REJECTED: "ردشده" };
const STATUS_STYLE: Record<EnrollmentStatus, string> = { PENDING: "bg-accent/20 text-accent-dark", APPROVED: "bg-ok/15 text-emerald-700", REJECTED: "bg-red-100 text-red-700" };

function Detail({ row, onClose }: { row: EnrollmentRow; onClose: () => void }) {
  const update = useUpdateEnrollment();
  const toast = useToast();
  const [note, setNote] = useState(row.adminNote ?? "");

  async function decide(status: EnrollmentStatus) {
    try {
      await update.mutateAsync({ id: row.id, status, adminNote: note.trim() });
      toast("success", "وضعیت درخواست تغییر کرد");
      onClose();
    } catch (err) {
      toast("error", err instanceof FormError ? err.message : "تغییر وضعیت انجام نشد");
    }
  }

  const fields: [string, string][] = [
    ["نام", `${row.firstName} ${row.lastName}`], ["کد ملی", formatTime(row.nationalCode)], ["تاریخ تولد", formatDate(row.birthDate)],
    ["پایه", `پایهٔ ${GRADE_LEVEL_LABEL[row.gradeLevel]}`], ["نام پدر", row.fatherName], ["تلفن والد", formatTime(row.parentPhone)],
    ["نشانی", row.address], ["سوابق تحصیلی", row.previousEducation ?? "—"], ["توضیحات", row.notes ?? "—"], ["تاریخ ثبت", formatDate(row.createdAt)],
  ];
  return (
    <Modal title={`درخواست ${row.firstName} ${row.lastName}`} onClose={onClose}>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {fields.map(([k, v]) => <div key={k} className={k === "نشانی" || k === "سوابق تحصیلی" || k === "توضیحات" ? "sm:col-span-2" : ""}><dt className="text-ink/60">{k}</dt><dd className="mt-0.5 font-bold">{v}</dd></div>)}
      </dl>
      <label htmlFor="admin-note" className="mt-5 block text-sm font-bold text-primary">یادداشت مدیر (اختیاری)</label>
      <textarea id="admin-note" rows={3} maxLength={1000} className={`${inputClass(false)} mt-1`} value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="mt-5 flex flex-wrap gap-3">
        <button disabled={update.isPending} onClick={() => decide("APPROVED")} className="rounded-xl bg-ok px-6 py-2.5 font-bold text-white hover:opacity-90 disabled:opacity-60">تأیید</button>
        <button disabled={update.isPending} onClick={() => decide("REJECTED")} className="rounded-xl bg-red-600 px-6 py-2.5 font-bold text-white hover:opacity-90 disabled:opacity-60">رد</button>
        <button disabled={update.isPending} onClick={() => decide("PENDING")} className="rounded-xl px-6 py-2.5 font-bold text-primary ring-1 ring-primary/30 hover:bg-primary/10 disabled:opacity-60">بازگرداندن به «در انتظار»</button>
      </div>
    </Modal>
  );
}

export default function AdminEnrollments() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<EnrollmentRow | null>(null);
  const { data, isLoading, isError, refetch } = useEnrollments({ page, status });

  return (
    <>
      <PanelTitle title="درخواست‌های ثبت‌نام" subtitle="درخواست‌هایی که والدین از سایت فرستاده‌اند" />
      <div className="mb-4">
        <Chips label="فیلتر وضعیت" active={status} onChange={(v) => { setStatus(v); setPage(1); }}
          items={[{ value: "", label: "همه" }, { value: "PENDING", label: "در انتظار" }, { value: "APPROVED", label: "تأییدشده" }, { value: "REJECTED", label: "ردشده" }]} />
      </div>
      {isLoading ? <Skeleton className="h-64" /> : isError || !data ? <ErrorState onRetry={() => refetch()} /> : !data.data.length ? <EmptyState>درخواستی پیدا نشد.</EmptyState> : (
        <>
          <ul className="divide-y divide-primary/10 rounded-2xl bg-white ring-1 ring-primary/10">
            {data.data.map((r) => (
              <li key={r.id}>
                <button onClick={() => setOpen(r)} className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 text-start hover:bg-primary-tint/50">
                  <span><span className="font-bold">{r.firstName} {r.lastName}</span><span className="ms-3 text-sm text-ink/60">پایهٔ {GRADE_LEVEL_LABEL[r.gradeLevel]} — {formatDate(r.createdAt)}</span></span>
                  <Badge className={STATUS_STYLE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </button>
              </li>
            ))}
          </ul>
          <Pagination meta={data.meta} onPage={setPage} />
        </>
      )}
      {open && <Detail row={open} onClose={() => setOpen(null)} />}
    </>
  );
}
