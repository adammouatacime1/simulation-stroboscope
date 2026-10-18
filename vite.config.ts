import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative URLs work both locally and under GitHub Pages' repository path.
  base: "./",
  plugins: [react()],
  test: { include: ["src/**/*.test.ts"] },
});
