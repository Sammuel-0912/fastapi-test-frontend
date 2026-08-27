import { describe, it, expect } from "vitest";
import { validateLoginForm } from "./validateLoginForm";

// 🔹 Unit test：純函式，不碰網路、不碰 DOM
describe("validateLoginForm", () => {
  it("帳號與密碼都有填時，兩個錯誤訊息皆為空字串", () => {
    expect(validateLoginForm("admin", "admin123456")).toEqual({
      username: "",
      password: "",
    });
  });

  it("帳號空白時回傳「請輸入帳號」", () => {
    expect(validateLoginForm("", "pw").username).toBe("請輸入帳號");
  });

  it("帳號只有空白字元也視為未填（trim 後為空）", () => {
    expect(validateLoginForm("   ", "pw").username).toBe("請輸入帳號");
  });

  it("密碼空白時回傳「請輸入密碼」", () => {
    expect(validateLoginForm("admin", "").password).toBe("請輸入密碼");
  });

  it("兩者皆空時兩個欄位都有錯誤", () => {
    expect(validateLoginForm("", "")).toEqual({
      username: "請輸入帳號",
      password: "請輸入密碼",
    });
  });
});
