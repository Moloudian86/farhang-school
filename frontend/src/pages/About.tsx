import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import { ErrorState, Skeleton } from "../components/ui/States";
import { useSchoolInfo } from "../hooks/useApi";

const paragraphs = (text: string) => text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

export default function About() {
  const { data: info, isError, refetch } = useSchoolInfo();
  return (
    <>
      <PageHeader title="درباره مدرسه" subtitle={info?.slogan} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {isError ? <ErrorState onRetry={() => refetch()} /> : !info ? <Skeleton className="h-72" /> : (
          <div className="grid gap-12 md:grid-cols-5">
            <div className="space-y-10 md:col-span-3">
              <section>
                <h2 className="text-2xl font-extrabold text-primary">معرفی</h2>
                <div className="mt-4 space-y-4 leading-9 text-ink/80">{paragraphs(info.about).map((p, i) => <p key={i}>{p}</p>)}</div>
              </section>
              <section>
                <h2 className="text-2xl font-extrabold text-primary">فلسفهٔ تربیتی</h2>
                <div className="mt-4 space-y-4 leading-9 text-ink/80">{paragraphs(info.philosophy).map((p, i) => <p key={i}>{p}</p>)}</div>
              </section>
              <Link to="/enrollment" className="inline-block rounded-xl bg-accent px-7 py-3 font-bold text-ink hover:bg-accent/85">ثبت‌نام دانش‌آموز</Link>
            </div>
            <div className="md:col-span-2">
              {info.aboutImageUrl && <img src={info.aboutImageUrl} alt={`نمایی از ${info.name}`} className="w-full rounded-3xl object-cover shadow-md" />}
              <dl className="mt-6 space-y-3 rounded-2xl bg-white p-6 text-sm ring-1 ring-primary/10">
                <div><dt className="font-bold text-primary">نشانی</dt><dd className="mt-1 text-ink/75">{info.address}</dd></div>
                <div><dt className="font-bold text-primary">ساعت کاری</dt><dd className="mt-1 text-ink/75">{info.workingHours}</dd></div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
