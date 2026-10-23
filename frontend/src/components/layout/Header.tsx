import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Logo } from "../Logo";

export const NAV_LINKS = [
  { to: "/", label: "خانه" },
  { to: "/about", label: "درباره مدرسه" },
  { to: "/staff", label: "کادر مدرسه" },
  { to: "/facilities", label: "امکانات" },
  { to: "/news", label: "اخبار" },
  { to: "/events", label: "رویدادها" },
  { to: "/gallery", label: "گالری" },
  { to: "/contact", label: "تماس با ما" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-primary text-white" : "text-ink/80 hover:bg-primary/10 hover:text-primary"
  }`;

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const accountLink = user ? { to: "/panel", label: "پنل من" } : { to: "/login", label: "ورود" };

  return (
    <header className="sticky top-0 z-30 border-b border-primary/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" aria-label="صفحهٔ اصلی"><Logo /></Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="منوی اصلی">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass}>{l.label}</NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to={accountLink.to} className="hidden rounded-xl px-4 py-2 text-sm font-bold text-primary ring-1 ring-primary/30 transition hover:bg-primary/10 sm:inline-block">
            {accountLink.label}
          </Link>
          <Link to="/enrollment" className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-ink transition hover:bg-accent/85">
            ثبت‌نام
          </Link>
          <button
            className="rounded-lg p-2 text-primary hover:bg-primary/10 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "بستن منو" : "باز کردن منو"}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="border-t border-primary/10 bg-white px-4 py-3 lg:hidden" aria-label="منوی موبایل">
          <div className="mx-auto grid max-w-6xl gap-1">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <NavLink to={accountLink.to} className={linkClass} onClick={() => setOpen(false)}>{accountLink.label}</NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}
