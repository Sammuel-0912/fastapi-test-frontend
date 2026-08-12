import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import { Link } from "react-router-dom"; // 🆕 匯入 Link

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 取得登入前原本想去的頁面，預設為 /machines
  const from = location.state?.from?.pathname ?? "/machines";

  // 🟢 若已經是登入狀態，直接自動導向目標頁面
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, {replace: true});
    }
  },[isAuthenticated, navigate, from]);

  return (
    <div
    style={{
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1>🔐 工廠管理系統</h1>

      {/* 1. 登入表單 */}
      <LoginForm />

      {/* 2. 引導前往註冊的連結 (放在表單正下方) */}
      <div style={{ marginTop: "16px" }}>
        <Link to="/register" style={{ color: "#3182ce", fontSize: "14px" }}>
          還沒有帳號？前往註冊 📝
        </Link>
      </div>
    </div>
  );
}