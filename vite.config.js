import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  base: "/React_Vite_CICD_Github/",
  server: {
    open: true,
    port: 3001,
  },
});