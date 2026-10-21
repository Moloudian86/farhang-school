import { Link } from "react-router-dom";
import { useSchoolInfo } from "../../hooks/useApi";
import { Logo } from "../Logo";
import { NAV_LINKS } from "./Header";

export default function Footer() {
  const { data: info } = useSchoolInfo();

  return (
    <footer className="mt-20 bg-primary text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-4 text-sm leading-7 text-white/80">{info?.slogan}</p>
        </div>

        <div>
          <h2 className="font-bold">دسترسی سریع</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/80">
            {NAV_LINKS.map((l) => (
              <li key={l.to}><Link to={l.to} className="hover:text-accent">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-bold">تماس با مدرسه</h2>
          {info ? (
            <ul className="mt-3 space-y-2 text-sm leading-7 text-white/80">
              <li>{info.address}</li>
              <li dir="ltr" className="text-end">{info.phone}</li>
              <li dir="ltr" className="text-end">{info.email}</li>
              <li>{info.workingHours}</li>
            </ul>
          ) : (
            <p className="mt-3 text-sm text-white/60">در حال بارگذاری...</p>
          )}
        </div>
      </div>
      <p className="border-t border-white/15 py-4 text-center text-xs text-white/60">
        نسخهٔ آزمایشی - اطلاعات نمایش‌داده‌شده نمونه و ساختگی است
      </p>
    </footer>
  );
}
