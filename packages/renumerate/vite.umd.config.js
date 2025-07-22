import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "lib/main.ts"),
      name: "Renumerate",
      formats: ["umd"],
      fileName: () => "renumerate.umd.js",
    },
  },
});