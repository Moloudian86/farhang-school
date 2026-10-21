import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { NewsCard } from "../components/shared/Cards";
import Chips from "../components/ui/Chips";
import PageHeader from "../components/ui/PageHeader";
import Pagination from "../components/ui/Pagination";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { useNewsCategories, useNewsList } from "../hooks/useApi";

export default function News() {
  // Filters live in the address bar (?category=sports&page=2&q=...), so links can be shared and Back works.
  const [sp, setSp] = useSearchParams();
  const category = sp.get("category") ?? "";
  const search = sp.get("q") ?? "";
  const page = Number(sp.get("page")) || 1;
  const [text, setText] = useState(search);

  const { data: categories } = useNewsCategories();
  const { data: reply, isLoading, isError, error, refetch } = useNewsList({ page, category, search });

  const change = (changes: Record<string, string>) => {
    const next = new URLSearchParams(sp);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setSp(next);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); change({ q: text.trim(), page: "" }); };

  return (
    <>
      <PageHeader title="اخبار مدرسه" subtitle="آخرین اطلاعیه‌ها، مسابقات و رویدادهای دبستان فرهنگ." />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Chips
            label="دسته‌بندی اخبار"
            active={category}
            onChange={(v) => change({ category: v, page: "" })}
            items={[{ value: "", label: "همه" }, ...(categories ?? []).map((c) => ({ value: c.slug, label: c.name }))]}
          />
          <form onSubmit={submit} className="flex gap-2" role="search">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="جستجو در اخبار"
              aria-label="جستجو در اخبار"
              className="w-full rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm md:w-64"
            />
            <button className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90">جستجو</button>
          </form>
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72" />)}</div>
          ) : isError ? <ErrorState message={(error as Error).message} onRetry={() => refetch()} /> : !reply?.data.length ? (
            <EmptyState>خبری با این مشخصات پیدا نشد.</EmptyState>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3">{reply.data.map((n) => <NewsCard key={n.id} item={n} />)}</div>
              <Pagination meta={reply.meta} onPage={(p) => change({ page: p > 1 ? String(p) : "" })} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
