import { FacilityCard } from "../components/shared/PeopleAndPlaces";
import PageHeader from "../components/ui/PageHeader";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { useFacilities } from "../hooks/useApi";

export default function Facilities() {
  const { data, isLoading, isError, refetch } = useFacilities();
  return (
    <>
      <PageHeader title="امکانات مدرسه" subtitle="فضاهایی که یادگیری، بازی و رشد را برای دانش‌آموزان ما ممکن می‌کنند." />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-72" />)}</div>
        ) : isError ? <ErrorState onRetry={() => refetch()} /> : !data?.length ? (
          <EmptyState>امکانات مدرسه هنوز ثبت نشده است.</EmptyState>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{data.map((f) => <FacilityCard key={f.id} item={f} />)}</div>
        )}
      </div>
    </>
  );
}
