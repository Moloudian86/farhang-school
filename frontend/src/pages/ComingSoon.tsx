import { Link } from "react-router-dom";

export default function ComingSoon() {
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold text-primary">این صفحه هنوز ساخته نشده است</h1>
      <p className="mt-3 text-ink/70">صفحه‌های داخلی سایت در مرحله‌های بعدی اضافه می‌شوند.</p>
      <Link to="/" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90">
        بازگشت به صفحهٔ اصلی
      </Link>
    </section>
  );
}
