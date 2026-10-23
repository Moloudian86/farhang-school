import { useState } from "react";
import { Outlet } from "react-router-dom";
import { OverviewContext } from "../../components/panel/OverviewContext";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { useChildOverview, useParentChildren } from "../../hooks/usePanelApi";
import { GRADE_LEVEL_LABEL } from "../../lib/labels";

/** The parent picks one child; all pages below then show that child's data (read-only). */
export default function ParentScope() {
  const children = useParentChildren();
  const [picked, setPicked] = useState<number | null>(null);
  const childId = picked ?? children.data?.[0]?.id ?? null;
  const overview = useChildOverview(childId);

  if (children.isLoading) return <Skeleton className="h-72" />;
  if (children.isError) return <ErrorState message={(children.error as Error).message} onRetry={() => children.refetch()} />;
  if (!children.data?.length) return <EmptyState>هنوز فرزندی به حساب شما متصل نشده است. با مدرسه تماس بگیرید.</EmptyState>;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-primary-tint p-4">
        <label htmlFor="child" className="text-sm font-bold text-primary">فرزند:</label>
        <select id="child" value={childId ?? ""} onChange={(e) => setPicked(Number(e.target.value))} className="rounded-xl bg-white px-4 py-2 text-sm ring-1 ring-primary/20">
          {children.data.map((c) => (
            <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — پایهٔ {GRADE_LEVEL_LABEL[c.gradeLevel]}{c.className ? ` (${c.className})` : ""}</option>
          ))}
        </select>
      </div>
      {overview.isLoading || !overview.data ? (
        overview.isError ? <ErrorState message={(overview.error as Error).message} onRetry={() => overview.refetch()} /> : <Skeleton className="h-72" />
      ) : (
        <OverviewContext.Provider value={overview.data}><Outlet /></OverviewContext.Provider>
      )}
    </>
  );
}
