import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { TanStackStartVite } from "@tanstack/react-start/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import cloudflarePlugin from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    TanStackStartVite(),
    viteReact(),
    tailwindcss(),
    tsconfigPaths(),
    cloudflarePlugin(),
  ],
  server: {
    entry: "src/server.ts",
  },
  ssr: {
    noExternal: ["sonner"],
  },
});
