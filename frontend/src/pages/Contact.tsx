import { FormEvent, useState } from "react";
import FormField, { inputClass } from "../components/ui/FormField";
import PageHeader from "../components/ui/PageHeader";
import { useToast } from "../components/ui/Toast";
import { Skeleton } from "../components/ui/States";
import { useSchoolInfo, useSendContact } from "../hooks/useApi";
import { FormError } from "../lib/api";
import { Errors, isValidEmail, isValidPhone } from "../lib/validators";

type Field = "name" | "email" | "phone" | "subject" | "message";
const EMPTY = { name: "", email: "", phone: "", subject: "", message: "", website: "" };

function validate(v: typeof EMPTY): Errors<Field> {
  const e: Errors<Field> = {};
  if (v.name.trim().length < 2) e.name = "نام را وارد کنید";
  if (!isValidEmail(v.email)) e.email = "ایمیل معتبر وارد کنید";
  if (v.phone.trim() && !isValidPhone(v.phone)) e.phone = "شمارهٔ تلفن باید ۱۱ رقم باشد و با صفر شروع شود";
  if (v.subject.trim().length < 3) e.subject = "موضوع پیام را بنویسید (حداقل ۳ حرف)";
  if (v.message.trim().length < 10) e.message = "متن پیام باید حداقل ۱۰ حرف باشد";
  return e;
}

/** OpenStreetMap needs no API key. The marker position comes from the database. */
function SchoolMap({ lat, lng }: { lat: number; lng: number }) {
  const d = 0.004;
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  return (
    <iframe
      title="نقشهٔ موقعیت مدرسه"
      className="h-72 w-full rounded-2xl ring-1 ring-primary/10"
      loading="lazy"
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
    />
  );
}

export default function Contact() {
  const { data: info, isLoading } = useSchoolInfo();
  const send = useSendContact();
  const toast = useToast();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors<Field>>({});

  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    try {
      const { message } = await send.mutateAsync({
        name: values.name, email: values.email, phone: values.phone || undefined,
        subject: values.subject, message: values.message, website: values.website,
      });
      toast("success", message ?? "پیام شما ارسال شد");
      setValues(EMPTY);
    } catch (err) {
      const fe = err instanceof FormError ? err : new FormError("ارسال پیام انجام نشد");
      setErrors(fe.fields as Errors<Field>);
      toast("error", fe.message);
    }
  }

  return (
    <>
      <PageHeader title="تماس با ما" subtitle="سؤال، پیشنهاد یا انتقادی دارید؟ خوشحال می‌شویم از شما بشنویم." />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-5">
        <section className="space-y-6 lg:col-span-2" aria-label="اطلاعات تماس">
          {isLoading || !info ? <Skeleton className="h-60" /> : (
            <>
              <dl className="space-y-4 rounded-2xl bg-white p-6 text-sm ring-1 ring-primary/10">
                <div><dt className="font-bold text-primary">نشانی</dt><dd className="mt-1 leading-7 text-ink/75">{info.address}</dd></div>
                <div><dt className="font-bold text-primary">تلفن</dt><dd className="mt-1 text-ink/75"><a href={`tel:${info.phone.replace(/[^\d+]/g, "")}`} dir="ltr" className="hover:text-primary">{info.phone}</a></dd></div>
                <div><dt className="font-bold text-primary">ایمیل</dt><dd className="mt-1 text-ink/75"><a href={`mailto:${info.email}`} className="hover:text-primary">{info.email}</a></dd></div>
                <div><dt className="font-bold text-primary">ساعات کاری</dt><dd className="mt-1 leading-7 text-ink/75">{info.workingHours}</dd></div>
              </dl>
              {info.latitude != null && info.longitude != null && <SchoolMap lat={info.latitude} lng={info.longitude} />}
            </>
          )}
        </section>

        <section className="lg:col-span-3" aria-label="فرم ارسال پیام">
          <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-3xl bg-white p-6 ring-1 ring-primary/10 md:p-8">
            <h2 className="text-xl font-extrabold text-primary">ارسال پیام</h2>

            {/* Honeypot: hidden from people, bots fill it and the backend ignores them. */}
            <div className="absolute -start-[9999px]" aria-hidden="true">
              <label>وب‌سایت<input tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} /></label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="c-name" label="نام و نام خانوادگی" required error={errors.name}>
                <input id="c-name" className={inputClass(!!errors.name)} value={values.name} onChange={set("name")} autoComplete="name" aria-invalid={!!errors.name} />
              </FormField>
              <FormField id="c-email" label="ایمیل" required error={errors.email}>
                <input id="c-email" type="email" dir="ltr" className={`${inputClass(!!errors.email)} text-start`} value={values.email} onChange={set("email")} autoComplete="email" aria-invalid={!!errors.email} />
              </FormField>
              <FormField id="c-phone" label="شمارهٔ تماس (اختیاری)" error={errors.phone}>
                <input id="c-phone" type="tel" dir="ltr" inputMode="numeric" placeholder="09121234567" className={`${inputClass(!!errors.phone)} text-start`} value={values.phone} onChange={set("phone")} autoComplete="tel" aria-invalid={!!errors.phone} />
              </FormField>
              <FormField id="c-subject" label="موضوع" required error={errors.subject}>
                <input id="c-subject" className={inputClass(!!errors.subject)} value={values.subject} onChange={set("subject")} aria-invalid={!!errors.subject} />
              </FormField>
            </div>

            <FormField id="c-message" label="پیام شما" required error={errors.message}>
              <textarea id="c-message" rows={6} maxLength={3000} className={inputClass(!!errors.message)} value={values.message} onChange={set("message")} aria-invalid={!!errors.message} />
            </FormField>

            <button type="submit" disabled={send.isPending} className="rounded-xl bg-primary px-8 py-3 font-bold text-white transition hover:bg-primary/90 disabled:opacity-60">
              {send.isPending ? "در حال ارسال..." : "ارسال پیام"}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
