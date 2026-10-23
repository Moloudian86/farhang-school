import { Link } from "react-router-dom";
import { PanelTitle, StatCard } from "../../../components/panel/PanelUi";
import { ErrorState, Skeleton } from "../../../components/ui/States";
import { useAdminStats } from "../../../hooks/usePanelApi";
import { formatNumber } from "../../../lib/format";

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useAdminStats();
  return (
    <>
      <PanelTitle title="داشبورد مدیر" subtitle="خلاصهٔ وضعیت مدرسه" />
      {isLoading ? <Skeleton className="h-40" /> : isError || !data ? <ErrorState onRetry={() => refetch()} /> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link to="/panel/admin/enrollments"><StatCard label="ثبت‌نام‌های در انتظار بررسی" value={formatNumber(data.pendingEnrollments)} tone="warm" /></Link>
          <Link to="/panel/admin/messages"><StatCard label="پیام‌های خوانده‌نشده" value={formatNumber(data.unreadMessages)} tone="red" /></Link>
          <StatCard label="کل درخواست‌های ثبت‌نام" value={formatNumber(data.totalEnrollments)} />
          <StatCard label="دانش‌آموز فعال" value={formatNumber(data.students)} tone="ok" />
          <StatCard label="معلم فعال" value={formatNumber(data.teachers)} />
          <StatCard label="خبر منتشرشده" value={formatNumber(data.publishedNews)} />
          <StatCard label="خبر پیش‌نویس" value={formatNumber(data.draftNews)} />
          <StatCard label="رویداد پیش رو" value={formatNumber(data.upcomingEvents)} />
        </div>
      )}
    </>
  );
}
