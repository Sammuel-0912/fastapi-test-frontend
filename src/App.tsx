import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage"; // 🆕 匯入註冊頁
import MachineListPage from "./pages/MachineListPage";
import MachineDetailPage from "./pages/MachineDetailPage";

export default function App() {
  
  return (
    <Routes>
      {/* 1. 公開登入頁面 */}
      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />
      {/* 2. 受保護的機台列表頁面 */}
      <Route path="/machines" 
        element={<MachineListPage />}
      />
      {/* 🟢 註冊帶參數的詳情頁路由 */}
      <Route path="/machines/:id" element={<MachineDetailPage />} />
      {/* 2. 受保護的機台列表頁面 */}
      <Route path="*" element={<Navigate to="/machines" replace />} />
    </Routes>
  );
}
