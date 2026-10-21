import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { EventCard, NewsCard } from "../components/shared/Cards";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { useLatestNews, useSchoolInfo, useStatistics, useUpcomingEvents } from "../hooks/useApi";
import { formatNumber } from "../lib/format";

function Section({ title, to, linkText, children }: { title: string; to: string; linkText: string; children: ReactNode }) {
  return (
    <section className="mx-auto mt-20 max-w-6xl px-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-extrabold text-primary">{title}</h2>
        <Link to={to} className="text-sm font-bold text-primary underline-offset-4 hover:underline">{linkText}</Link>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

const CardsSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72" />)}</div>
);

function Hero() {
  const { data: info, isError, refetch } = useSchoolInfo();

  if (isError) return <div className="mx-auto max-w-6xl px-4 py-12"><ErrorState onRetry={() => refetch()} /></div>;

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-16">
      <div>
        {info ? (
          <>
            <h1 className="text-4xl font-extrabold leading-snug text-primary md:text-5xl md:leading-snug">{info.slogan}</h1>
            <p className="mt-5 max-w-prose text-lg leading-9 text-ink/75">{info.shortIntro}</p>
          </>
        ) : (
          <div className="space-y-4"><Skeleton className="h-28" /><Skeleton className="h-24" /></div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/enrollment" className="rounded-xl bg-accent px-7 py-3 font-bold text-ink transition hover:bg-accent/85">
            ثبت‌نام دانش‌آموز
          </Link>
          <Link to="/facilities" className="rounded-xl border-2 border-primary px-7 py-3 font-bold text-primary transition hover:bg-primary hover:text-white">
            امکانات مدرسه
          </Link>
        </div>
      </div>

      {/* The one memorable shape: a school doorway (arch) holding the main photo. */}
      <div className="mx-auto w-full max-w-md">
        {info?.heroImageUrl ? (
          <img src={info.heroImageUrl} alt={`نمایی از ${info.name}`} className="aspect-[4/5] w-full rounded-t-[999px] rounded-b-3xl object-cover shadow-lg" />
        ) : (
          <div className="aspect-[4/5] w-full rounded-t-[999px] rounded-b-3xl bg-primary/10" aria-hidden="true" />
        )}
      </div>
    </section>
  );
}

function Stats() {
  const { data } = useStatistics();
  if (!data?.length) return null;
  return (
    <section className="border-y border-primary/10 bg-white" aria-label="آمار مدرسه">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 divide-primary/10 px-4 md:grid-cols-5 md:divide-x md:divide-x-reverse">
        {data.map((s) => (
          <div key={s.id} className="px-4 py-7 text-center">
            <dd className="text-3xl font-extrabold text-primary">{formatNumber(s.value)}{s.suffix}</dd>
            <dt className="mt-1 text-sm text-ink/70">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

function LatestNews() {
  const { data, isLoading, isError, refetch } = useLatestNews(3);
  return (
    <Section title="آخرین اخبار" to="/news" linkText="همهٔ اخبار">
      {isLoading ? <CardsSkeleton /> : isError ? <ErrorState onRetry={() => refetch()} /> : !data?.length ? (
        <EmptyState>هنوز خبری منتشر نشده است.</EmptyState>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">{data.map((n) => <NewsCard key={n.id} item={n} />)}</div>
      )}
    </Section>
  );
}

function UpcomingEvents() {
  const { data, isLoading, isError, refetch } = useUpcomingEvents(3);
  return (
    <Section title="رویدادهای پیش‌رو" to="/events" linkText="همهٔ رویدادها">
      {isLoading ? <CardsSkeleton /> : isError ? <ErrorState onRetry={() => refetch()} /> : !data?.length ? (
        <EmptyState>فعلاً رویداد پیش‌رویی ثبت نشده است.</EmptyState>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">{data.map((e) => <EventCard key={e.id} item={e} />)}</div>
      )}
    </Section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <LatestNews />
      <UpcomingEvents />
      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-primary p-8 text-white md:flex-row md:items-center md:p-12">
          <div>
            <h2 className="text-2xl font-extrabold">برای سال تحصیلی جدید ثبت‌نام کنید</h2>
            <p className="mt-2 text-white/80">فرم ثبت‌نام را پر کنید تا مدرسه با شما تماس بگیرد.</p>
          </div>
          <Link to="/enrollment" className="shrink-0 rounded-xl bg-accent px-8 py-3 font-bold text-ink transition hover:bg-accent/85">
            شروع ثبت‌نام
          </Link>
        </div>
      </section>
    </>
  );
}
