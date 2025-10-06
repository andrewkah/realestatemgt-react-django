import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "__tests__/setupTests.ts",
    css: true,
    include: ["__tests__/**/*.test.{ts,tsx,js,jsx}"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["**/node_modules/**", "**/test/**"],
    },
  },
});
