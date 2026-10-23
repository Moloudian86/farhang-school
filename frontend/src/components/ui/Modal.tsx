import { ReactNode, useEffect } from "react";

/** Simple dialog: closes with the Escape key or a click on the dark background. */
export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label={title}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-extrabold text-primary">{title}</h2>
          <button onClick={onClose} aria-label="بستن" className="rounded-lg p-1 text-2xl leading-none text-ink/50 hover:bg-primary/10">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
