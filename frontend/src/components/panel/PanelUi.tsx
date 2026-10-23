import { ReactNode } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";

/** Title of a panel page. */
export function PanelTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  usePageTitle(title);
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-primary">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink/65">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white p-5 ring-1 ring-primary/10 ${className}`}>{children}</div>;
}

export function StatCard({ label, value, tone = "primary" }: { label: string; value: ReactNode; tone?: "primary" | "ok" | "warm" | "red" }) {
  const color = { primary: "text-primary", ok: "text-emerald-600", warm: "text-accent-dark", red: "text-red-600" }[tone];
  return (
    <Card>
      <p className="text-sm text-ink/65">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${color}`}>{value}</p>
    </Card>
  );
}

/** For features that are planned but have no database tables yet (honest "coming later" box). */
export function PlannedFeature({ title, text }: { title: string; text: string }) {
  return (
    <>
      <PanelTitle title={title} />
      <div className="rounded-2xl border border-dashed border-primary/30 bg-white p-10 text-center">
        <p className="font-bold text-primary">این بخش در مرحله‌های بعدی اضافه می‌شود</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-ink/65">{text}</p>
      </div>
    </>
  );
}

export function Badge({ children, className }: { children: ReactNode; className: string }) {
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${className}`}>{children}</span>;
}
