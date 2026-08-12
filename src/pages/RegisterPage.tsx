import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import type { UserResponse } from "../types";
import { getErrorMessage } from "../utils/errorMessage";


// 註冊才需要驗證長度規範 (對應後端 UserCreate Schema)
const validateRegisterForm = (username: string, password: string) => {

  let usernameErr = "";
  if (!username.trim()) {
    usernameErr = "請輸入帳號";
  } else if (username.length < 3 || username.length > 50) {
    usernameErr = "帳號長度需介於 3 至 50 字之間";
  }
  let passwordErr = "";
  if (!password) {
    passwordErr = "請輸入密碼";
  } else if (password.length < 8) {
    passwordErr = "密碼長度至少需要 8 碼";
  }
  
  return {
    username: usernameErr,
    password: passwordErr,
  };
};

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ username: false, password: false });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const errors = validateRegisterForm(username, password);
  const isValid = !errors.username && !errors.password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    if (!isValid) return;

    setSubmitting(true);
    setError(null);

    try {
      // POST /auth/register 送出 JSON 格式 (對應 UserCreate)
      await api.post<UserResponse>("/auth/register", {
        username,
        password,
      });

      alert("🎉 註冊成功！請使用剛註冊的帳號密碼登入。");
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err, "註冊失敗"));
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1>📝 註冊管理員帳號</h1>
      <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "8px", width: "320px" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              placeholder="帳號 (3~50字)"
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
            {touched.username && errors.username && (
              <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "4px" }}>
                ⚠️ {errors.username}
              </span>
            )}
          </div>

          <div style={{ marginBottom: "12px" }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="密碼 (至少8碼)"
              style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
            />
            {touched.password && errors.password && (
              <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "4px" }}>
                ⚠️ {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "註冊中..." : "註冊"}
          </button>
        </form>

        {error && <p style={{ color: "red", marginTop: "12px", fontSize: "14px" }}>⚠️ {error}</p>}

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Link to="/login" style={{ color: "#3182ce", fontSize: "14px" }}>
            已有帳號？返回登入 🔑
          </Link>
        </div>
      </div>
    </div>
  );
}