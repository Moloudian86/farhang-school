import { useState } from "react";
import { Link } from "react-router-dom";
import Chips from "../../../components/ui/Chips";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { Badge, Card, PanelTitle, PlannedFeature, StatCard } from "../../../components/panel/PanelUi";
import { useOverview } from "../../../components/panel/OverviewContext";
import WeeklySchedule from "../../../components/panel/WeeklySchedule";
import { useLatestNews } from "../../../hooks/useApi";
import { formatDate, formatNumber, formatTime } from "../../../lib/format";
import { ATTENDANCE_LABEL, ATTENDANCE_STYLE, EXAM_LABEL, formatScore, GRADE_LEVEL_LABEL } from "../../../lib/labels";

// These pages are used by BOTH the student panel and the parent panel (the parent sees his child's data).

export function ProfilePage() {
  const { student } = useOverview();
  const rows: [string, string][] = [
    ["نام و نام خانوادگی", `${student.firstName} ${student.lastName}`],
    ["کد ملی", formatTime(student.nationalCode)],
    ["تاریخ تولد", formatDate(student.birthDate)],
    ["پایهٔ تحصیلی", `پایهٔ ${GRADE_LEVEL_LABEL[student.gradeLevel]}`],
    ["نام پدر", student.fatherName],
    ["کلاس", student.class ? `${student.class.name} (${student.class.academicYear})` : "هنوز به کلاسی اختصاص داده نشده"],
    ["معلم کلاس", student.class?.homeroomTeacher ?? "—"],
  ];
  return (
    <>
      <PanelTitle title="پروفایل" />
      <Card>
        <dl className="grid gap-5 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k}><dt className="text-sm text-ink/60">{k}</dt><dd className="mt-1 font-bold">{v}</dd></div>
          ))}
        </dl>
      </Card>
    </>
  );
}

export function SchedulePage() {
  const { schedule } = useOverview();
  return (
    <>
      <PanelTitle title="برنامهٔ هفتگی" />
      <WeeklySchedule lessons={schedule.map((s) => ({ id: s.id, weekday: s.weekday, startTime: s.startTime, endTime: s.endTime, title: s.subject, detail: s.teacher }))} />
    </>
  );
}

export function GradesPage() {
  const { grades } = useOverview();
  const [term, setTerm] = useState("1");
  const list = grades.filter((g) => String(g.term) === term);
  return (
    <>
      <PanelTitle title="نمرات" subtitle="نمره‌ها از ۲۰ هستند." />
      <div className="mb-4"><Chips label="انتخاب نیمسال" active={term} onChange={setTerm} items={[{ value: "1", label: "نیمسال اول" }, { value: "2", label: "نیمسال دوم" }]} /></div>
      {!list.length ? <EmptyState>برای این نیمسال هنوز نمره‌ای ثبت نشده است.</EmptyState> : (
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-primary/10">
          <table className="w-full min-w-[28rem] text-sm">
            <thead className="bg-primary-tint text-primary"><tr><th className="p-3 text-start">درس</th><th className="p-3 text-start">نوع</th><th className="p-3 text-start">نمره</th><th className="p-3 text-start">تاریخ ثبت</th></tr></thead>
            <tbody>
              {list.map((g) => (
                <tr key={g.id} className="border-t border-primary/10">
                  <td className="p-3 font-bold">{g.subject}</td><td className="p-3">{EXAM_LABEL[g.examType]}</td>
                  <td className="p-3 font-bold">{formatScore(g.score)}</td><td className="p-3 text-ink/65">{formatDate(g.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function ReportCardPage() {
  const { reportCard, student } = useOverview();
  return (
    <>
      <PanelTitle title="کارنامه" subtitle={`${student.firstName} ${student.lastName} — میانگین نمره‌ها در هر درس`} />
      {!reportCard.subjects.length ? <EmptyState>هنوز نمره‌ای برای ساخت کارنامه ثبت نشده است.</EmptyState> : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <StatCard label="معدل نیمسال اول" value={formatScore(reportCard.term1Average)} tone="ok" />
            <StatCard label="معدل نیمسال دوم" value={formatScore(reportCard.term2Average)} />
          </div>
          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-primary/10">
            <table className="w-full min-w-[24rem] text-sm">
              <thead className="bg-primary-tint text-primary"><tr><th className="p-3 text-start">درس</th><th className="p-3 text-start">نیمسال اول</th><th className="p-3 text-start">نیمسال دوم</th></tr></thead>
              <tbody>
                {reportCard.subjects.map((r) => (
                  <tr key={r.subject} className="border-t border-primary/10">
                    <td className="p-3 font-bold">{r.subject}</td><td className="p-3">{formatScore(r.term1)}</td><td className="p-3">{formatScore(r.term2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

export function HomeworkPage() {
  const { homeworks } = useOverview();
  const now = Date.now();
  return (
    <>
      <PanelTitle title="تکالیف" />
      {!homeworks.length ? <EmptyState>تکلیفی ثبت نشده است.</EmptyState> : (
        <ul className="space-y-3">
          {homeworks.map((h) => {
            const overdue = new Date(h.dueDate).getTime() + 24 * 3600 * 1000 < now;
            return (
              <li key={h.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div><h2 className="font-extrabold">{h.title}</h2><p className="mt-1 text-sm text-ink/65">{h.subject}{h.teacher && ` — ${h.teacher}`}</p></div>
                    <Badge className={overdue ? "bg-ink/10 text-ink/70" : "bg-accent/20 text-accent-dark"}>{overdue ? "مهلت تمام شده" : "مهلت: "}{!overdue && formatDate(h.dueDate)}</Badge>
                  </div>
                  {h.description && <p className="mt-3 text-sm leading-7 text-ink/80">{h.description}</p>}
                  {overdue && <p className="mt-2 text-xs text-ink/55">مهلت: {formatDate(h.dueDate)}</p>}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export function AttendancePage() {
  const { attendance } = useOverview();
  const s = attendance.summary;
  return (
    <>
      <PanelTitle title="حضور و غیاب" subtitle="آخرین روزهای ثبت‌شده" />
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="حاضر" value={formatNumber(s.present)} tone="ok" />
        <StatCard label="غایب" value={formatNumber(s.absent)} tone="red" />
        <StatCard label="تأخیر" value={formatNumber(s.late)} tone="warm" />
        <StatCard label="غیبت موجه" value={formatNumber(s.excused)} />
      </div>
      {!attendance.records.length ? <EmptyState>هنوز حضور و غیابی ثبت نشده است.</EmptyState> : (
        <ul className="divide-y divide-primary/10 rounded-2xl bg-white ring-1 ring-primary/10">
          {attendance.records.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span>{formatDate(r.date)}</span>
              <span className="flex items-center gap-3">{r.note && <span className="text-xs text-ink/55">{r.note}</span>}<Badge className={ATTENDANCE_STYLE[r.status]}>{ATTENDANCE_LABEL[r.status]}</Badge></span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** School announcements = the public news list (same database table as the website). */
export function AnnouncementsPage() {
  const { data, isLoading, isError, refetch } = useLatestNews(10);
  return (
    <>
      <PanelTitle title="اطلاعیه‌ها" subtitle="آخرین اخبار و اطلاعیه‌های مدرسه" />
      {isLoading ? <Skeleton className="h-40" /> : isError ? <ErrorState onRetry={() => refetch()} /> : !data?.length ? <EmptyState>اطلاعیه‌ای وجود ندارد.</EmptyState> : (
        <ul className="space-y-3">
          {data.map((n) => (
            <li key={n.id}>
              <Link to={`/news/${n.slug}`} className="block rounded-2xl bg-white p-5 ring-1 ring-primary/10 transition hover:ring-primary/30">
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink/60"><Badge className="bg-primary-tint text-primary">{n.category.name}</Badge>{formatDate(n.publishedAt)}</div>
                <h2 className="mt-2 font-extrabold">{n.title}</h2><p className="mt-1 text-sm leading-7 text-ink/70">{n.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export const MessagesPage = () => <PlannedFeature title="پیام‌ها" text="گفت‌وگو بین معلم، دانش‌آموز و والدین به یک جدول پیام در دیتابیس نیاز دارد و در مرحلهٔ «پیام‌رسانی» اضافه می‌شود." />;
export const ExamsPage = () => <PlannedFeature title="برنامهٔ امتحانات" text="برنامهٔ امتحانات هنوز جدول مخصوص خودش را در دیتابیس ندارد. در مرحلهٔ «مدیریت امتحانات» همراه با پنل مدیر اضافه می‌شود." />;
