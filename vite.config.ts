import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/BitAndPlay/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          tone: ["tone"],
          three: ["three", "@react-three/fiber"],
        },
      },
    },
  },
  test: {
    environment: "node",
    globals: true,
  },
});
