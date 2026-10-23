import { EmptyState } from "../ui/States";
import { WEEKDAY_LABEL, WEEKDAY_ORDER } from "../../lib/labels";
import { formatTime } from "../../lib/format";
import { Weekday } from "../../panelTypes";

export interface Lesson { id: number; weekday: Weekday | null; startTime: string | null; endTime: string | null; title: string; detail: string | null }

/** One card per school day, lessons listed in time order (rows are already sorted by the backend or here). */
export default function WeeklySchedule({ lessons }: { lessons: Lesson[] }) {
  if (!lessons.length) return <EmptyState>هنوز برنامهٔ هفتگی ثبت نشده است.</EmptyState>;
  const days = WEEKDAY_ORDER.filter((d) => lessons.some((l) => l.weekday === d));
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {days.map((day) => (
        <section key={day} className="rounded-2xl bg-white p-4 ring-1 ring-primary/10" aria-label={WEEKDAY_LABEL[day]}>
          <h2 className="mb-3 font-extrabold text-primary">{WEEKDAY_LABEL[day]}</h2>
          <ul className="space-y-2">
            {lessons
              .filter((l) => l.weekday === day)
              .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""))
              .map((l) => (
                <li key={l.id} className="rounded-xl bg-primary-tint/60 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">{l.title}</span>
                    {l.startTime && <span className="text-xs text-ink/60">{formatTime(l.startTime)} تا {formatTime(l.endTime ?? "")}</span>}
                  </div>
                  {l.detail && <p className="mt-0.5 text-xs text-ink/65">{l.detail}</p>}
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
