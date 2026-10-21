import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The site runs on :5173 and quietly forwards /api and /uploads to the backend on :5000.
// This way the browser sees ONE address (no CORS problems, login cookie just works).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
});
