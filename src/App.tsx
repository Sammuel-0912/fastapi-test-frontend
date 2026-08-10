import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MachineListPage from "./pages/MachineListPage";

export default function App() {
  
  return (
    <Routes>
      {/* 1. 公開登入頁面 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. 受保護的機台列表頁面 */}
      <Route path="/machines" 
        element={<MachineListPage />}
      />
      {/* 2. 受保護的機台列表頁面 */}
      <Route path="*" element={<Navigate to="/machines" replace />} />
    </Routes>
  );
}
