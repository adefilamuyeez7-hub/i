import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    target: "ES2022",
    outDir: "dist",
    ssr: false,
  },
  ssr: {
    noExternal: [
      "sonner",
      "@tanstack/react-start",
      "@tanstack/react-router",
      "@tanstack/react-query",
      "@tanstack/start-storage-context",
    ],
  },
});
