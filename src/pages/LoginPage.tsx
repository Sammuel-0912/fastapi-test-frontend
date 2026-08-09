import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

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
    <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1>🔐 工廠管理系統</h1>
      <LoginForm />
    </div>
  );
}