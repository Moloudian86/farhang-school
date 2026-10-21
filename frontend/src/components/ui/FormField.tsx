import { ReactNode } from "react";

export const inputClass = (hasError: boolean) =>
  `w-full rounded-xl bg-white px-4 py-3 text-sm ring-1 transition placeholder:text-ink/40 focus:outline-none focus:ring-2 ${
    hasError ? "ring-red-400 focus:ring-red-500" : "ring-primary/20 focus:ring-primary-soft"
  }`;

/** Label + input slot + error message. `id` must match the id of the input inside. */
export default function FormField({
  id, label, error, hint, required, children,
}: { id: string; label: string; error?: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-primary">
        {label}{required && <span className="text-red-500" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-ink/55">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
