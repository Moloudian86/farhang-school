import { useSearchParams } from "react-router-dom";
import { EventCard } from "../components/shared/Cards";
import Chips from "../components/ui/Chips";
import PageHeader from "../components/ui/PageHeader";
import Pagination from "../components/ui/Pagination";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { useEventsList } from "../hooks/useApi";

export default function Events() {
  const [sp, setSp] = useSearchParams();
  const showAll = sp.get("show") === "all";
  const page = Number(sp.get("page")) || 1;
  const { data: reply, isLoading, isError, error, refetch } = useEventsList({ page, upcoming: !showAll });

  const change = (changes: Record<string, string>) => {
    const next = new URLSearchParams(sp);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setSp(next);
  };

  return (
    <>
      <PageHeader title="رویدادها" subtitle="جشن‌ها، مسابقات، اردوها و جلسه‌های مدرسه." />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Chips
          label="نوع نمایش"
          active={showAll ? "all" : ""}
          onChange={(v) => change({ show: v, page: "" })}
          items={[{ value: "", label: "رویدادهای پیش‌رو" }, { value: "all", label: "همهٔ رویدادها" }]}
        />
        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72" />)}</div>
          ) : isError ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> : !reply?.data.length ? (
            <EmptyState>رویدادی برای نمایش وجود ندارد.</EmptyState>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3">{reply.data.map((e) => <EventCard key={e.id} item={e} />)}</div>
              <Pagination meta={reply.meta} onPage={(p) => change({ page: p > 1 ? String(p) : "" })} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
