import { defineConfig, devices } from "@playwright/test";

// E2E 設定：對著已在跑的 docker compose 前端 (http://localhost:5173) 測試
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1: undefined,
  reporter: "html",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: process.env.CI
  ? {
    command: "npm run preview",
    url: "http://localhost:4173",
    timeout: 60_000,
    reuseExistingServer: false,
  }
  : undefined,

  projects: [
    { name: "chromium", 
      use: { ...devices["Desktop Chrome"] } },
  ],
});
