// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: {
        core: resolve(__dirname, "lib/main.ts"),
        react: resolve(__dirname, "lib/react.tsx"),
      },
      name: "Renumerate",
      // the proper extensions will be added
      fileName: (format, entryName) => {
        if (entryName === "core") {
          return `renumerate.${format}.js`;
        }
        return `${entryName}/index.${format}.js`;
      },
    },
    rollupOptions: {
      // Externalize React and its related libraries
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        // Provide global variables for external dependencies
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "ReactJSXRuntime",
        },
      },
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      include: ["lib/**/*.ts", "lib/**/*.tsx"],
    }),
  ],
});
