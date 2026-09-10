import { test, expect, type Page } from "@playwright/test";

// 🔺 E2E test（B 方案：mock API）
// 用 page.route 攔截後端 API，讓 E2E 完全不依賴真後端 —— CI 只跑 `vite preview`
// 也能穩定綠燈，本地不開 docker 也能跑。
//
// ⚠️ 關鍵：先攔截 config.json 把 VITE_API_BASE_URL 覆寫成空字串，讓前端改用「相對路徑」，
//    API 請求就變成同源（對 preview / docker 前端本身），避免跨來源請求需要 CORS 標頭，
//    否則 route.fulfill 出來的回應會被瀏覽器以 CORS 擋掉。
async function stubConfigRelative(page: Page) {
  await page.route("**/config.json*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ VITE_API_BASE_URL: "" }),
    }),
  );
}

const json = (status: number, data: unknown) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(data),
});

test.describe("登入流程 (E2E, mocked API)", () => {
  test("正確帳密登入後導向 /machines", async ({ page }) => {
    await stubConfigRelative(page);
    await page.route("**/auth/login", (route) =>
      route.fulfill(json(200, { access_token: "fake-token", token_type: "bearer" })),
    );
    await page.route("**/auth/me", (route) =>
      route.fulfill(json(200, { id: 1, username: "admin", role: "admin" })),
    );
    // 登入後 MachineListPage 會抓機台列表，回空陣列避免無謂錯誤
    await page.route("**/machines", (route) => route.fulfill(json(200, [])));

    await page.goto("/login");
    await page.getByPlaceholder(/帳號/).fill("admin");
    await page.getByPlaceholder("密碼").fill("admin123456");
    await page.getByRole("button", { name: /登入/ }).click();

    // 登入成功後 LoginPage 會自動導向 /machines
    await expect(page).toHaveURL(/\/machines$/);
    // 登入表單應消失
    await expect(page.getByText("🔐 管理員登入")).toBeHidden();
  });

  test("錯誤密碼顯示錯誤訊息且停留在登入頁", async ({ page }) => {
    await stubConfigRelative(page);
    await page.route("**/auth/login", (route) =>
      route.fulfill(json(401, { detail: "Incorrect username or password" })),
    );

    await page.goto("/login");
    await page.getByPlaceholder(/帳號/).fill("admin");
    await page.getByPlaceholder("密碼").fill("definitely-wrong");
    await page.getByRole("button", { name: /登入/ }).click();

    await expect(page.getByText(/登入失敗，請檢查帳號密碼。/)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("空白欄位送出時前端驗證擋下", async ({ page }) => {
    await stubConfigRelative(page);
    await page.goto("/login");

    await page.getByRole("button", { name: /登入/ }).click();

    await expect(page.getByText(/請輸入帳號/)).toBeVisible();
    await expect(page.locator("text=這行文字絕對不會出現")).toBeVisible();
    await expect(page.getByText(/請輸入密碼/)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
