import { test, expect } from "@playwright/test";

// 🔺 E2E test：對著已在跑的 docker compose 前端（http://localhost:5173）走完整登入
// 前提：docker compose up -d 已啟動，後端 seed 出 admin / admin123456
const ADMIN = { username: "admin", password: "admin123456" };

test.describe("登入流程 (E2E)", () => {
  test("正確帳密登入後導向 /machines", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder(/帳號/).fill(ADMIN.username);
    await page.getByPlaceholder("密碼").fill(ADMIN.password);
    await page.getByRole("button", { name: /登入/ }).click();

    // 登入成功後 LoginPage 會自動導向 /machines
    await expect(page).toHaveURL(/\/machines$/);
    // 登入表單應消失
    await expect(page.getByText("🔐 管理員登入")).toBeHidden();
  });

  test("錯誤密碼顯示錯誤訊息且停留在登入頁", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder(/帳號/).fill(ADMIN.username);
    await page.getByPlaceholder("密碼").fill("definitely-wrong");
    await page.getByRole("button", { name: /登入/ }).click();

    await expect(page.getByText(/登入失敗，請檢查帳號密碼。/)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("空白欄位送出時前端驗證擋下", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: /登入/ }).click();

    await expect(page.getByText(/請輸入帳號/)).toBeVisible();
    await expect(page.getByText(/請輸入密碼/)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
