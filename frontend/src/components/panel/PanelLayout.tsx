import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { ROLE_LABEL } from "../../lib/labels";
import { Role } from "../../panelTypes";
import { Logo } from "../Logo";

interface NavItem { to: string; label: string; end?: boolean }

const student = (base: string): NavItem[] => [
  { to: base, label: "پروفایل", end: true },
  { to: `${base}/schedule`, label: "برنامه هفتگی" },
  { to: `${base}/grades`, label: "نمرات" },
  { to: `${base}/report-card`, label: "کارنامه" },
  { to: `${base}/homework`, label: "تکالیف" },
  { to: `${base}/attendance`, label: "حضور و غیاب" },
  { to: `${base}/announcements`, label: "اطلاعیه‌ها" },
  { to: `${base}/messages`, label: "پیام‌ها" },
  { to: `${base}/exams`, label: "برنامه امتحانات" },
];

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  ADMIN: [
    { to: "/panel/admin", label: "داشبورد", end: true },
    { to: "/panel/admin/enrollments", label: "درخواست‌های ثبت‌نام" },
    { to: "/panel/admin/messages", label: "پیام‌های تماس" },
  ],
  TEACHER: [
    { to: "/panel/teacher", label: "کلاس‌های من", end: true },
    { to: "/panel/teacher/attendance", label: "حضور و غیاب" },
    { to: "/panel/teacher/grades", label: "ثبت نمره" },
    { to: "/panel/teacher/homework", label: "تکالیف" },
    { to: "/panel/teacher/schedule", label: "برنامه کلاس‌ها" },
  ],
  STUDENT: student("/panel/student"),
  PARENT: [...student("/panel/parent").slice(0, 9), { to: "/panel/parent/tuition", label: "شهریه و پرداخت" }],
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
    isActive ? "bg-primary text-white" : "text-ink/80 hover:bg-primary/10 hover:text-primary"
  }`;

export default function PanelLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-primary/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/panel" aria-label="صفحهٔ اصلی پنل"><Logo /></Link>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-ink/80">
              {user.firstName} {user.lastName}
              <span className="ms-2 rounded-full bg-primary-tint px-3 py-1 text-xs font-bold text-primary">{ROLE_LABEL[user.role]}</span>
            </span>
            <Link to="/" className="rounded-lg px-3 py-2 text-primary hover:bg-primary/10">بازگشت به سایت</Link>
            <button onClick={onLogout} className="rounded-lg bg-primary px-4 py-2 font-bold text-white hover:bg-primary/90">خروج</button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <nav aria-label="منوی پنل" className="flex gap-2 overflow-x-auto pb-1 lg:w-60 lg:shrink-0 lg:flex-col lg:self-start lg:rounded-2xl lg:bg-white lg:p-3 lg:ring-1 lg:ring-primary/10">
          {NAV_BY_ROLE[user.role].map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>{item.label}</NavLink>
          ))}
        </nav>
        <main id="content" className="min-w-0 flex-1"><Outlet /></main>
      </div>
    </div>
  );
}
