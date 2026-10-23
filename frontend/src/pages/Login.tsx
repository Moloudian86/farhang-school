import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { HOME_BY_ROLE, useAuth } from "../auth/AuthContext";
import FormField, { inputClass } from "../components/ui/FormField";
import { usePageTitle } from "../hooks/usePageTitle";
import { FormError } from "../lib/api";
import { ROLE_LABEL } from "../lib/labels";
import { Role } from "../panelTypes";

// Shown ONLY while developing (npm run dev). These accounts are created by the seed.
const DEMO_ACCOUNTS: { role: Role; email: string; password: string }[] = [
  { role: "ADMIN", email: "admin@farhang.school", password: "Admin@12345" },
  { role: "TEACHER", email: "teacher@farhang.school", password: "Teacher@12345" },
  { role: "STUDENT", email: "student@farhang.school", password: "Student@12345" },
  { role: "PARENT", email: "parent@farhang.school", password: "Parent@12345" },
];

export default function Login() {
  usePageTitle("ورود به حساب کاربری");
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already logged in? Go straight to the panel.
  if (user) return <Navigate to={from ?? HOME_BY_ROLE[user.role]} replace />;

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!email.trim() || !password) return setError("ایمیل و رمز عبور را وارد کنید");
    setBusy(true);
    setError("");
    try {
      const u = await login(email.trim(), password);
      navigate(from ?? HOME_BY_ROLE[u.role], { replace: true });
    } catch (err) {
      setError(err instanceof FormError ? err.message : "ورود انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center text-3xl font-extrabold text-primary">ورود به حساب کاربری</h1>
      <p className="mt-2 text-center text-sm text-ink/65">مدیر، معلم، دانش‌آموز و والدین از همین صفحه وارد می‌شوند.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5 rounded-3xl bg-white p-6 ring-1 ring-primary/10 md:p-8">
        <FormField id="l-email" label="ایمیل" required>
          <input id="l-email" type="email" dir="ltr" autoComplete="username" className={`${inputClass(!!error)} text-start`} value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField id="l-pass" label="رمز عبور" required>
          <input id="l-pass" type="password" dir="ltr" autoComplete="current-password" className={`${inputClass(!!error)} text-start`} value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormField>

        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

        <button type="submit" disabled={busy} className="w-full rounded-xl bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary/90 disabled:opacity-60">
          {busy ? "در حال ورود..." : "ورود"}
        </button>
      </form>

      {import.meta.env.DEV && (
        <div className="mt-6 rounded-2xl border border-dashed border-primary/30 p-4 text-sm">
          <p className="font-bold text-primary">حساب‌های نمونه (فقط در حالت توسعه)</p>
          <ul className="mt-2 space-y-1">
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.role}>
                <button type="button" onClick={() => { setEmail(a.email); setPassword(a.password); setError(""); }} className="text-start hover:text-primary">
                  <span className="font-bold">{ROLE_LABEL[a.role]}:</span> <span dir="ltr" className="text-ink/70">{a.email}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink/55">روی هر مورد کلیک کنید تا فرم پر شود.</p>
        </div>
      )}
    </section>
  );
}
