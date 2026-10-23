import { createContext, ReactNode, useCallback, useContext, useState } from "react";

type ToastKind = "success" | "error";
interface ToastItem { id: number; kind: ToastKind; text: string }

const ToastContext = createContext<(kind: ToastKind, text: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

/** Wrap the app once; call `useToast()` anywhere to show a small message that disappears by itself. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((kind: ToastKind, text: string) => {
    const id = Date.now() + Math.random();
    setItems((list) => [...list, { id, kind, text }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="fixed bottom-4 start-4 z-[60] flex max-w-sm flex-col gap-2" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={`rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg ${t.kind === "success" ? "bg-ok" : "bg-red-600"}`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
