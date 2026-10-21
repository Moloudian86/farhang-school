import { TeacherCard } from "../components/shared/PeopleAndPlaces";
import PageHeader from "../components/ui/PageHeader";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { useTeachers } from "../hooks/useApi";

export default function Staff() {
  const { data, isLoading, isError, refetch } = useTeachers();
  return (
    <>
      <PageHeader title="کادر مدرسه" subtitle="معلمان و مربیانی که هر روز در کنار دانش‌آموزان ما هستند." />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-64" />)}</div>
        ) : isError ? <ErrorState onRetry={() => refetch()} /> : !data?.length ? (
          <EmptyState>اطلاعات کادر مدرسه هنوز ثبت نشده است.</EmptyState>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{data.map((t) => <TeacherCard key={t.id} item={t} />)}</div>
        )}
      </div>
    </>
  );
}
