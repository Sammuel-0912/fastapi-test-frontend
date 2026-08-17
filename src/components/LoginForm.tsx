import React, { useState } from "react";
import api from "../api";
import type { Token } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { getErrorMessage } from "../utils/errorMessage";

// 1. 純函式驗證：只驗證是否填寫，絕不驗證長度！
const validateLoginForm = (username: string, password: string) => {
  return {
    username: !username.trim() ? "請輸入帳號" : "",
    password: !password ? "請輸入密碼" : "",
  };
};


export default function LoginForm() {
  // 1. 受控元件 State：React State 為輸入值的唯一真實來源
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // 2. 追蹤欄位是否被「觸碰過 (onBlur)」或「按過送出」
  const [touched, setTouched] = useState({username: false, password: false});




  // 3. 狀態管理：錯誤訊息與送出中狀態
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();

  // 計算目前表單驗證錯誤
  const errors = validateLoginForm(username, password);
  const isValid = !errors.username && !errors.password;

  const handleSubmit = async (e: React.FormEvent) => {
    // ⚠️ 關鍵 1：防止 HTML 表單預設的頁面重新整理與網址列參數洩漏
    e.preventDefault();

    // 送出時將所有欄位標記為已觸碰
    setTouched({username: true, password: true});

    // 擋在門口，不浪費網路 Request 打 API
    if (!isValid) return;

    setSubmitting(true);
    setError(null);

    try {
      // ⚠️ 關鍵 2：使用 URLSearchParams 封裝資料
      // Axios 偵測到 URLSearchParams 會自動將 Header 設為 application/x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const res = await api.post<Token>("/auth/login", params);
      // const res = await api.post<Token>("/auth/login", { username, password });

      // 🎉 呼叫 AuthContext 的 login
      await login(res.data.access_token);

      // 🧹 2. 清空密碼欄位與錯誤訊息
      setPassword("");
    } catch (err) {
      setError(getErrorMessage(err, "登入失敗，請檢查帳號密碼"));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        borderRadius: "8px",
        maxWidth: "320px",
        marginBottom: "20px",
      }}
    >
      <h2>🔐 管理員登入</h2>
      <form onSubmit={handleSubmit} action="">
        <div style={{ marginBottom: "12px" }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            // 離開欄位時標記為 touched
            onBlur={() => setTouched((t) => ({ ...t, username: true }))}

            placeholder="帳號 (例如: admin)"
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
          {/* 只有在被觸碰過且有錯誤時才顯示提示 */}
          {touched.username && errors.username && (
            <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "4px" }}>
              ⚠️{errors.username}
            </span>
          )}
        </div>
        <div style={{ marginBottom: "12px" }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // 離開欄位時標記為 touched
            onBlur={() => setTouched((t) => ({...t, password: true}))}
            placeholder="密碼"
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
          {touched.password && errors.password && (
            <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "4px" }}>
              ⚠️{errors.password}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "登入驗證中..." : "登入"}
        </button>
      </form>
      {error && (
        <p style={{ color: "red", marginTop: "12px", fontSize: "14px" }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
