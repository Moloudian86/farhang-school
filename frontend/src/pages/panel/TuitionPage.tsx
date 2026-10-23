import { Badge, Card, PanelTitle } from "../../components/panel/PanelUi";

// DEMO ONLY: there is no payment table yet, so these sample rows are fixed on purpose and clearly labelled.
const SAMPLE = [
  { title: "شهریهٔ مهر ماه", amount: "۲٬۵۰۰٬۰۰۰ تومان", paid: true },
  { title: "شهریهٔ آبان ماه", amount: "۲٬۵۰۰٬۰۰۰ تومان", paid: false },
  { title: "هزینهٔ اردوی آموزشی", amount: "۴۰۰٬۰۰۰ تومان", paid: false },
];

export default function TuitionPage() {
  return (
    <>
      <PanelTitle title="شهریه و پرداخت" />
      <p className="mb-4 rounded-xl bg-accent/15 px-4 py-3 text-sm text-accent-dark">این صفحه فقط با داده‌های نمونه نمایش داده می‌شود. پرداخت آنلاین در مرحلهٔ «مدیریت مالی» اضافه خواهد شد.</p>
      <ul className="space-y-3">
        {SAMPLE.map((r) => (
          <li key={r.title}>
            <Card><div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-extrabold">{r.title}</h2><p className="mt-1 text-sm text-ink/65">{r.amount}</p></div>
              {r.paid ? <Badge className="bg-ok/15 text-emerald-700">پرداخت‌شده</Badge> : <button disabled className="rounded-xl bg-primary/40 px-5 py-2 text-sm font-bold text-white">پرداخت (به‌زودی)</button>}
            </div></Card>
          </li>
        ))}
      </ul>
    </>
  );
}
