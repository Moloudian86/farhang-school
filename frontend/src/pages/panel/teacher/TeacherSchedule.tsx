import { PanelTitle } from "../../../components/panel/PanelUi";
import WeeklySchedule from "../../../components/panel/WeeklySchedule";
import { ErrorState, Skeleton } from "../../../components/ui/States";
import { useTeacherSchedule } from "../../../hooks/usePanelApi";

export default function TeacherSchedule() {
  const { data, isLoading, isError, refetch } = useTeacherSchedule();
  return (
    <>
      <PanelTitle title="برنامهٔ کلاس‌ها" subtitle="برنامهٔ هفتگی تدریس شما" />
      {isLoading ? <Skeleton className="h-64" /> : isError || !data ? <ErrorState onRetry={() => refetch()} /> : (
        <WeeklySchedule lessons={data.map((s) => ({ id: s.id, weekday: s.weekday, startTime: s.startTime, endTime: s.endTime, title: s.subject, detail: s.className }))} />
      )}
    </>
  );
}
