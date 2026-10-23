import { Link } from "react-router-dom";
import { Badge, Card, PanelTitle } from "../../../components/panel/PanelUi";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useTeacherClasses } from "../../../hooks/usePanelApi";
import { formatNumber } from "../../../lib/format";

export default function TeacherClasses() {
  const { data, isLoading, isError, error, refetch } = useTeacherClasses();
  return (
    <>
      <PanelTitle title="کلاس‌های من" subtitle="کلاس‌هایی که معلم راهنما یا مدرس یکی از درس‌های آن هستید" />
      {isLoading ? <Skeleton className="h-40" /> : isError || !data ? <ErrorState message={(error as Error | null)?.message} onRetry={() => refetch()} /> : !data.length ? <EmptyState>هنوز کلاسی به شما اختصاص داده نشده است.</EmptyState> : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-2">
                <div><h2 className="text-lg font-extrabold">{c.name}</h2><p className="text-sm text-ink/60">سال تحصیلی {c.academicYear}</p></div>
                {c.isHomeroom && <Badge className="bg-primary-tint text-primary">معلم راهنما</Badge>}
              </div>
              <p className="mt-3 text-sm">{formatNumber(c.studentCount)} دانش‌آموز</p>
              <p className="mt-1 text-sm text-ink/70">دروس شما: {c.subjects.length ? c.subjects.map((s) => s.title).join("، ") : "—"}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
                <Link to="/panel/teacher/attendance" className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">حضور و غیاب</Link>
                <Link to="/panel/teacher/grades" className="rounded-lg px-4 py-2 text-primary ring-1 ring-primary/30 hover:bg-primary/10">ثبت نمره</Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
