import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  base: "https://render.tomcarpenter.dev/",
  server: {
    open: true,
    port: 3001,
  },
});