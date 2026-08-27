import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { getErrorMessage } from "./errorMessage";

// 建立一個帶 response.data 的假 AxiosError
function makeAxiosError(status: number, data: unknown): AxiosError {
  const err = new AxiosError("boom", "ERR_BAD_REQUEST");
  err.response = {
    status,
    statusText: "",
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  } as AxiosError["response"];
  return err;
}

// 🔹 Unit test：純函式解析各種後端錯誤格式
describe("getErrorMessage", () => {
  it("detail 為字串時直接回傳該字串（如 401/404）", () => {
    const err = makeAxiosError(401, { detail: "帳號或密碼錯誤" });
    expect(getErrorMessage(err)).toBe("帳號或密碼錯誤");
  });

  it("detail 為 Pydantic 陣列時（422）組出「欄位: 訊息」", () => {
    const err = makeAxiosError(422, {
      detail: [{ loc: ["body", "username"], msg: "field required" }],
    });
    expect(getErrorMessage(err)).toBe("username: field required");
  });

  it("沒有 response（伺服器沒開/網路中斷）回傳連線提示", () => {
    const err = new AxiosError("Network Error", "ERR_NETWORK");
    expect(getErrorMessage(err)).toBe("無法連線至伺服器，請檢查網路連線。");
  });

  it("非 Axios 錯誤時回傳 fallback", () => {
    expect(getErrorMessage(new Error("x"), "預設訊息")).toBe("預設訊息");
  });
});
