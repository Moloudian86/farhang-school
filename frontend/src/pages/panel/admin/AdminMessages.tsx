import { useState } from "react";
import Pagination from "../../../components/ui/Pagination";
import { EmptyState, ErrorState, Skeleton } from "../../../components/ui/States";
import { useToast } from "../../../components/ui/Toast";
import { Badge, PanelTitle } from "../../../components/panel/PanelUi";
import { useContactMessages, useMarkMessageRead } from "../../../hooks/usePanelApi";
import { FormError } from "../../../lib/api";
import { formatDate, formatNumber, formatTime } from "../../../lib/format";

export default function AdminMessages() {
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<number | null>(null);
  const { data, isLoading, isError, refetch } = useContactMessages(page);
  const mark = useMarkMessageRead();
  const toast = useToast();

  async function setRead(id: number, isRead: boolean) {
    try { await mark.mutateAsync({ id, isRead }); } catch (err) { toast("error", err instanceof FormError ? err.message : "تغییر وضعیت انجام نشد"); }
  }

  return (
    <>
      <PanelTitle title="پیام‌های تماس" subtitle={data ? `${formatNumber(data.data.unread)} پیام خوانده‌نشده` : undefined} />
      {isLoading ? <Skeleton className="h-64" /> : isError || !data ? <ErrorState onRetry={() => refetch()} /> : !data.data.messages.length ? <EmptyState>پیامی دریافت نشده است.</EmptyState> : (
        <>
          <ul className="space-y-3">
            {data.data.messages.map((m) => {
              const open = openId === m.id;
              return (
                <li key={m.id} className={`rounded-2xl bg-white ring-1 ${m.isRead ? "ring-primary/10" : "ring-primary-soft"}`}>
                  <button
                    onClick={() => { setOpenId(open ? null : m.id); if (!open && !m.isRead) void setRead(m.id, true); }}
                    aria-expanded={open}
                    className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-4 text-start"
                  >
                    <span><span className={m.isRead ? "font-medium" : "font-extrabold"}>{m.subject}</span><span className="ms-3 text-sm text-ink/60">{m.name} — {formatDate(m.createdAt)}</span></span>
                    {!m.isRead && <Badge className="bg-primary text-white">جدید</Badge>}
                  </button>
                  {open && (
                    <div className="border-t border-primary/10 px-4 py-4 text-sm">
                      <p className="whitespace-pre-wrap leading-8">{m.message}</p>
                      <p className="mt-3 text-ink/65">ایمیل: <span dir="ltr">{m.email}</span>{m.phone && <> — تلفن: <span dir="ltr">{formatTime(m.phone)}</span></>}</p>
                      <button onClick={() => setRead(m.id, !m.isRead)} className="mt-3 rounded-lg px-3 py-1.5 text-xs font-bold text-primary ring-1 ring-primary/30 hover:bg-primary/10">
                        {m.isRead ? "علامت‌گذاری به‌عنوان خوانده‌نشده" : "علامت‌گذاری به‌عنوان خوانده‌شده"}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <Pagination meta={data.meta} onPage={setPage} />
        </>
      )}
    </>
  );
}
