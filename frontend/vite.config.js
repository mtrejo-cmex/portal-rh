import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/portal-rh/",
  server: {
    host: true,
    port: 5173,
  },
});
