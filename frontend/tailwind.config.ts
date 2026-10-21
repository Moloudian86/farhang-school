import type { Config } from "tailwindcss";

// Colors approved in step 1. "accent" buttons use DARK text (white on yellow is hard to read).
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1E3A8A", soft: "#3B82F6", tint: "#E8EEFB" },
        accent: { DEFAULT: "#F59E0B", dark: "#B45309" },
        ok: "#10B981",
        warm: "#FB923C",
        ink: "#0F172A",
        paper: "#F8FAFC",
      },
      fontFamily: { sans: ['"Vazirmatn Variable"', "Vazirmatn", "Tahoma", "sans-serif"] },
    },
  },
} satisfies Config;
