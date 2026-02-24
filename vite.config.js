import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  base: "/",
  server: {
    open: true,
    port: 3001,
  },
});