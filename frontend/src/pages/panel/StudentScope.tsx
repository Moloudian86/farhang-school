import { Outlet } from "react-router-dom";
import { OverviewContext } from "../../components/panel/OverviewContext";
import { ErrorState, Skeleton } from "../../components/ui/States";
import { useStudentOverview } from "../../hooks/usePanelApi";

/** Loads the logged-in student's data once and shares it with all student pages. */
export default function StudentScope() {
  const { data, isLoading, isError, error, refetch } = useStudentOverview();
  if (isLoading) return <Skeleton className="h-72" />;
  if (isError || !data) return <ErrorState message={(error as Error | null)?.message} onRetry={() => refetch()} />;
  return <OverviewContext.Provider value={data}><Outlet /></OverviewContext.Provider>;
}
