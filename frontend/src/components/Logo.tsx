/** School mark: an open book (knowledge) under a rising sun (growth), on the school's navy. */
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="لوگوی دبستان فرهنگ">
      <rect width="48" height="48" rx="14" fill="#1E3A8A" />
      <circle cx="24" cy="15" r="6" fill="#F59E0B" />
      <path d="M8 40V25.5c5.5-1.6 11-.9 16 2.5 5-3.4 10.5-4.1 16-2.5V40c-5.5-1.6-11-.8-16 2.5C19 39.2 13.5 38.4 8 40Z" fill="#fff" />
      <path d="M24 28v14.5" stroke="#1E3A8A" strokeWidth="2" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark />
      <span className="leading-tight">
        <span className={`block text-xl font-extrabold ${light ? "text-white" : "text-primary"}`}>فرهنگ</span>
        <span className={`block text-xs ${light ? "text-white/70" : "text-ink/60"}`}>دبستان پسرانه</span>
      </span>
    </span>
  );
}
