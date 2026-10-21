export interface Chip { value: string; label: string }

/** A row of filter buttons ("همه", "ورزشی", ...). */
export default function Chips({ items, active, onChange, label }: { items: Chip[]; active: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {items.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          aria-pressed={active === c.value}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            active === c.value ? "bg-primary text-white" : "bg-white text-primary ring-1 ring-primary/20 hover:bg-primary/10"
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
