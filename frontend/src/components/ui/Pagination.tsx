import { formatNumber } from "../../lib/format";
import { PageMeta } from "../../types";

export default function Pagination({ meta, onPage }: { meta: PageMeta | null | undefined; onPage: (p: number) => void }) {
  if (!meta || meta.totalPages <= 1) return null;
  const btn = "rounded-lg px-4 py-2 text-sm font-bold ring-1 ring-primary/20 disabled:opacity-40";
  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="صفحه‌بندی">
      <button className={`${btn} bg-white text-primary hover:bg-primary/10`} disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>
        قبلی
      </button>
      <span className="text-sm text-ink/70">صفحهٔ {formatNumber(meta.page)} از {formatNumber(meta.totalPages)}</span>
      <button className={`${btn} bg-white text-primary hover:bg-primary/10`} disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>
        بعدی
      </button>
    </nav>
  );
}
