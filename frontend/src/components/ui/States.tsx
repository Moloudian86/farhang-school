import { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-primary/10 ${className}`} aria-hidden="true" />;
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-warm/40 bg-warm/10 p-6 text-center">
      <p className="font-bold">بارگذاری اطلاعات انجام نشد</p>
      <p className="mt-1 text-sm text-ink/70">{message ?? "اتصال به سرور برقرار نیست. سرور Backend را روشن کنید و دوباره امتحان کنید."}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90">
          تلاش دوباره
        </button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-primary/30 p-8 text-center text-ink/70">{children}</div>;
}
