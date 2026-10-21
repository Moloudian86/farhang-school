import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Lightbox from "../components/shared/Lightbox";
import Chips from "../components/ui/Chips";
import PageHeader from "../components/ui/PageHeader";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { useGallery, useGalleryCategories } from "../hooks/useApi";

export default function Gallery() {
  const [sp, setSp] = useSearchParams();
  const category = sp.get("category") ?? "";
  const [open, setOpen] = useState<number | null>(null); // index of the photo shown in the lightbox

  const { data: categories } = useGalleryCategories();
  const { data: images, isLoading, isError, refetch } = useGallery(category);

  return (
    <>
      <PageHeader title="گالری تصاویر" subtitle="لحظه‌هایی از کلاس‌ها، اردوها، مسابقات و جشن‌های مدرسه." />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Chips
          label="دسته‌بندی گالری"
          active={category}
          onChange={(v) => setSp(v ? { category: v } : {})}
          items={[{ value: "", label: "همه" }, ...(categories ?? []).map((c) => ({ value: c.slug, label: c.name }))]}
        />
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square" />)}</div>
          ) : isError ? <ErrorState onRetry={() => refetch()} /> : !images?.length ? (
            <EmptyState>تصویری در این دسته وجود ندارد.</EmptyState>
          ) : (
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {images.map((img, i) => (
                <li key={img.id}>
                  <button onClick={() => setOpen(i)} className="group block w-full overflow-hidden rounded-2xl ring-1 ring-primary/10" aria-label={`نمایش بزرگ‌تر: ${img.title}`}>
                    <img src={img.imageUrl} alt={img.title} loading="lazy" className="aspect-square w-full object-cover transition group-hover:scale-105" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {images && open !== null && images[open] && (
        <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
