import { usePageTitle } from "../../hooks/usePageTitle";

export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  usePageTitle(title);
  return (
    <div className="border-b border-primary/10 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <h1 className="text-3xl font-extrabold text-primary md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-prose leading-8 text-ink/70">{subtitle}</p>}
      </div>
    </div>
  );
}
