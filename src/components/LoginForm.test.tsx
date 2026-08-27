import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import LoginForm from "./LoginForm";
import { AuthProvider } from "../contexts/AuthContext";

// 🔸 Integration test：LoginForm + 真實 AuthProvider，只把「網路層」(api) 換成 mock
// 這樣能驗證元件 → context.login → /auth/me 的整條前端串接，而不真的打後端
vi.mock("../api", () => ({
  default: { post: vi.fn(), get: vi.fn() },
}));
import api from "../api";

const mockedPost = api.post as unknown as Mock;
const mockedGet = api.get as unknown as Mock;

function renderLoginForm() {
  return render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginForm 整合流程", () => {
  it("填入正確帳密送出 → 呼叫 /auth/login 與 /auth/me，且不顯示錯誤", async () => {
    mockedPost.mockResolvedValue({
      data: { access_token: "fake-token", token_type: "bearer" },
    });
    mockedGet.mockResolvedValue({
      data: { id: 1, username: "admin", role: "admin" },
    });

    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByPlaceholderText(/帳號/), "admin");
    await user.type(screen.getByPlaceholderText("密碼"), "admin123456");
    await user.click(screen.getByRole("button", { name: /登入/ }));

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith("/auth/login", expect.any(URLSearchParams));
    });
    // 送出的 body 帶正確帳密
    const body = mockedPost.mock.calls[0][1] as URLSearchParams;
    expect(body.get("username")).toBe("admin");
    expect(body.get("password")).toBe("admin123456");
    // 登入成功後 AuthProvider 會打 /auth/me 驗證身分
    await waitFor(() => expect(mockedGet).toHaveBeenCalledWith("/auth/me"));
    // 不應出現錯誤訊息
    expect(screen.queryByText(/登入失敗/)).not.toBeInTheDocument();
  });

  it("後端回 401 → 顯示「登入失敗，請檢查帳號密碼。」", async () => {
    const err = new AxiosError("unauthorized", "ERR_BAD_REQUEST");
    err.response = {
      status: 401,
      statusText: "",
      data: { detail: "Incorrect credentials" },
      headers: {},
      config: { headers: new AxiosHeaders() },
    } as AxiosError["response"];
    mockedPost.mockRejectedValue(err);

    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByPlaceholderText(/帳號/), "admin");
    await user.type(screen.getByPlaceholderText("密碼"), "wrong-pw");
    await user.click(screen.getByRole("button", { name: /登入/ }));

    expect(await screen.findByText(/登入失敗，請檢查帳號密碼。/)).toBeInTheDocument();
    // /auth/me 不應被呼叫（登入就失敗了）
    expect(mockedGet).not.toHaveBeenCalled();
  });

  it("欄位空白直接送出 → 擋在前端不打 API，並顯示欄位提示", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.click(screen.getByRole("button", { name: /登入/ }));

    expect(screen.getByText(/請輸入帳號/)).toBeInTheDocument();
    expect(screen.getByText(/請輸入密碼/)).toBeInTheDocument();
    expect(mockedPost).not.toHaveBeenCalled();
  });
});
