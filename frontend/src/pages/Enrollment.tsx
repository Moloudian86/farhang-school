import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FormField, { inputClass } from "../components/ui/FormField";
import PageHeader from "../components/ui/PageHeader";
import { useToast } from "../components/ui/Toast";
import { useSendEnrollment } from "../hooks/useApi";
import { FormError } from "../lib/api";
import { currentJalaliYear, daysInJalaliMonth, JALALI_MONTHS, jalaliToGregorian, toIsoDate } from "../lib/jalali";
import { formatNumber } from "../lib/format";
import { Errors, isValidNationalCode, isValidPhone, normalizeDigits } from "../lib/validators";

type Field = "firstName" | "lastName" | "nationalCode" | "birthDate" | "gradeLevel" | "fatherName" | "parentPhone" | "address";
const GRADES = ["اول", "دوم", "سوم", "چهارم", "پنجم", "ششم"];
const REQUIRED_DOCUMENTS = [
  "تصویر شناسنامهٔ دانش‌آموز", "تصویر کارت ملی دانش‌آموز و والدین", "دو قطعه عکس ۳×۴ پشت‌نویسی‌شده",
  "کارنامهٔ سال قبل (برای پایه‌های دوم تا ششم)", "تصویر کارت واکسن",
];
const EMPTY = {
  firstName: "", lastName: "", nationalCode: "", jy: "", jm: "", jd: "", gradeLevel: "", fatherName: "",
  parentPhone: "", address: "", previousEducation: "", notes: "", website: "",
};

function birthDateIso(v: typeof EMPTY): string | null {
  const [jy, jm, jd] = [Number(v.jy), Number(v.jm), Number(v.jd)];
  if (!jy || !jm || !jd || jd > daysInJalaliMonth(jy, jm)) return null;
  return toIsoDate(jalaliToGregorian(jy, jm, jd));
}

function validate(v: typeof EMPTY): Errors<Field> {
  const e: Errors<Field> = {};
  if (v.firstName.trim().length < 2) e.firstName = "نام را وارد کنید";
  if (v.lastName.trim().length < 2) e.lastName = "نام خانوادگی را وارد کنید";
  if (!isValidNationalCode(v.nationalCode)) e.nationalCode = "کد ملی نامعتبر است (۱۰ رقم)";
  const iso = birthDateIso(v);
  if (!iso) e.birthDate = "تاریخ تولد را کامل انتخاب کنید";
  else {
    const years = (Date.now() - new Date(iso).getTime()) / (365.25 * 24 * 3600 * 1000);
    if (years < 4 || years > 15) e.birthDate = "سن دانش‌آموز باید بین ۴ تا ۱۵ سال باشد";
  }
  if (!v.gradeLevel) e.gradeLevel = "پایهٔ تحصیلی را انتخاب کنید";
  if (v.fatherName.trim().length < 2) e.fatherName = "نام پدر را وارد کنید";
  if (!isValidPhone(v.parentPhone)) e.parentPhone = "شمارهٔ تلفن باید ۱۱ رقم باشد و با صفر شروع شود";
  if (v.address.trim().length < 10) e.address = "نشانی را کامل‌تر بنویسید (حداقل ۱۰ حرف)";
  return e;
}

export default function Enrollment() {
  const send = useSendEnrollment();
  const toast = useToast();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [done, setDone] = useState<number | null>(null);

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const thisYear = currentJalaliYear();
  const years = useMemo(() => Array.from({ length: 12 }, (_, i) => thisYear - 4 - i), [thisYear]);
  const maxDay = values.jy && values.jm ? daysInJalaliMonth(Number(values.jy), Number(values.jm)) : 31;

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      toast("error", "لطفاً خطاهای فرم را اصلاح کنید");
      return;
    }
    try {
      const { data } = await send.mutateAsync({
        firstName: values.firstName, lastName: values.lastName,
        nationalCode: normalizeDigits(values.nationalCode.trim()),
        birthDate: birthDateIso(values)!, gradeLevel: Number(values.gradeLevel),
        fatherName: values.fatherName, parentPhone: normalizeDigits(values.parentPhone.trim()),
        address: values.address,
        previousEducation: values.previousEducation.trim() || undefined,
        notes: values.notes.trim() || undefined,
        website: values.website,
      });
      setDone(data.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const fe = err instanceof FormError ? err : new FormError("ثبت درخواست انجام نشد");
      setErrors(fe.fields as Errors<Field>);
      toast("error", fe.message);
    }
  }

  if (done !== null) {
    return (
      <>
        <PageHeader title="ثبت‌نام دانش‌آموز" />
        <section className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok/15 text-3xl text-ok" aria-hidden="true">✓</div>
          <h2 className="mt-5 text-2xl font-extrabold text-primary">درخواست شما ثبت شد</h2>
          <p className="mt-3 leading-8 text-ink/75">
            همکاران ما پس از بررسی اطلاعات با شمارهٔ تماسی که وارد کرده‌اید هماهنگ می‌کنند.
            {done > 0 && <> شمارهٔ پیگیری: <strong className="text-primary">{formatNumber(done)}</strong></>}
          </p>
          <Link to="/" className="mt-8 inline-block rounded-xl bg-primary px-7 py-3 font-bold text-white hover:bg-primary/90">بازگشت به صفحهٔ اصلی</Link>
        </section>
      </>
    );
  }

  const sel = (hasError: boolean) => `${inputClass(hasError)} appearance-none`;

  return (
    <>
      <PageHeader title="ثبت‌نام دانش‌آموز" subtitle="فرم زیر را تکمیل کنید. پس از بررسی، همکاران مدرسه با شما تماس می‌گیرند." />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-3">
        <form onSubmit={onSubmit} noValidate className="space-y-8 rounded-3xl bg-white p-6 ring-1 ring-primary/10 md:p-8 lg:col-span-2">
          <div className="absolute -start-[9999px]" aria-hidden="true">
            <label>وب‌سایت<input tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} /></label>
          </div>

          <fieldset className="space-y-5">
            <legend className="mb-1 text-lg font-extrabold text-primary">اطلاعات دانش‌آموز</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="e-first" label="نام" required error={errors.firstName}>
                <input id="e-first" className={inputClass(!!errors.firstName)} value={values.firstName} onChange={set("firstName")} aria-invalid={!!errors.firstName} />
              </FormField>
              <FormField id="e-last" label="نام خانوادگی" required error={errors.lastName}>
                <input id="e-last" className={inputClass(!!errors.lastName)} value={values.lastName} onChange={set("lastName")} aria-invalid={!!errors.lastName} />
              </FormField>
              <FormField id="e-code" label="کد ملی" required error={errors.nationalCode}>
                <input id="e-code" dir="ltr" inputMode="numeric" maxLength={10} className={`${inputClass(!!errors.nationalCode)} text-start`} value={values.nationalCode} onChange={set("nationalCode")} aria-invalid={!!errors.nationalCode} />
              </FormField>
              <FormField id="e-grade" label="پایهٔ تحصیلی" required error={errors.gradeLevel}>
                <select id="e-grade" className={sel(!!errors.gradeLevel)} value={values.gradeLevel} onChange={set("gradeLevel")} aria-invalid={!!errors.gradeLevel}>
                  <option value="">انتخاب کنید</option>
                  {GRADES.map((g, i) => <option key={g} value={i + 1}>پایهٔ {g}</option>)}
                </select>
              </FormField>
            </div>

            <FormField id="e-jd" label="تاریخ تولد (شمسی)" required error={errors.birthDate}>
              <div className="grid grid-cols-3 gap-3">
                <select id="e-jd" aria-label="روز" className={sel(!!errors.birthDate)} value={values.jd} onChange={set("jd")}>
                  <option value="">روز</option>
                  {Array.from({ length: maxDay }, (_, i) => <option key={i + 1} value={i + 1}>{formatNumber(i + 1)}</option>)}
                </select>
                <select aria-label="ماه" className={sel(!!errors.birthDate)} value={values.jm} onChange={set("jm")}>
                  <option value="">ماه</option>
                  {JALALI_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select aria-label="سال" className={sel(!!errors.birthDate)} value={values.jy} onChange={set("jy")}>
                  <option value="">سال</option>
                  {years.map((y) => <option key={y} value={y}>{new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(y)}</option>)}
                </select>
              </div>
            </FormField>

            <FormField id="e-prev" label="سوابق تحصیلی (اختیاری)" hint="مثلاً مدرسه یا مهدکودک قبلی و معدل سال گذشته">
              <textarea id="e-prev" rows={3} maxLength={1000} className={inputClass(false)} value={values.previousEducation} onChange={set("previousEducation")} />
            </FormField>
          </fieldset>

          <fieldset className="space-y-5">
            <legend className="mb-1 text-lg font-extrabold text-primary">اطلاعات والد</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="e-father" label="نام پدر" required error={errors.fatherName}>
                <input id="e-father" className={inputClass(!!errors.fatherName)} value={values.fatherName} onChange={set("fatherName")} aria-invalid={!!errors.fatherName} />
              </FormField>
              <FormField id="e-phone" label="شمارهٔ تماس والد" required error={errors.parentPhone}>
                <input id="e-phone" type="tel" dir="ltr" inputMode="numeric" placeholder="09121234567" className={`${inputClass(!!errors.parentPhone)} text-start`} value={values.parentPhone} onChange={set("parentPhone")} aria-invalid={!!errors.parentPhone} />
              </FormField>
            </div>
            <FormField id="e-address" label="نشانی" required error={errors.address}>
              <textarea id="e-address" rows={3} maxLength={1000} className={inputClass(!!errors.address)} value={values.address} onChange={set("address")} aria-invalid={!!errors.address} />
            </FormField>
            <FormField id="e-notes" label="توضیحات (اختیاری)">
              <textarea id="e-notes" rows={3} maxLength={1000} className={inputClass(false)} value={values.notes} onChange={set("notes")} />
            </FormField>
          </fieldset>

          <button type="submit" disabled={send.isPending} className="rounded-xl bg-accent px-9 py-3 font-bold text-ink transition hover:bg-accent/85 disabled:opacity-60">
            {send.isPending ? "در حال ثبت..." : "ثبت درخواست"}
          </button>
        </form>

        <aside className="h-fit space-y-4 rounded-3xl bg-primary-tint p-6 lg:sticky lg:top-24" aria-label="مدارک مورد نیاز">
          <h2 className="text-lg font-extrabold text-primary">مدارک مورد نیاز</h2>
          <p className="text-sm leading-7 text-ink/70">این مدارک را هنگام مراجعهٔ حضوری به مدرسه همراه داشته باشید:</p>
          <ul className="space-y-2 text-sm leading-7 text-ink/80">
            {REQUIRED_DOCUMENTS.map((d) => <li key={d} className="flex gap-2"><span className="text-ok" aria-hidden="true">✓</span>{d}</li>)}
          </ul>
        </aside>
      </div>
    </>
  );
}
