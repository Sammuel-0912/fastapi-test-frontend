import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Vitest 設定：jsdom 環境跑元件測試，排除 E2E 目錄（那是 Playwright 的地盤）
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});
