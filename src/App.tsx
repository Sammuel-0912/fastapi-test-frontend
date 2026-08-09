import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MachineListPage from "./pages/MachineListPage";
import ProtectedRoute from "./components/ProtectedRoute";


export default function App() {
  
  return (
    <Routes>
      {/* 1. 公開登入頁面 */}
      <Route path="login" element={<LoginPage />} />

      {/* 2. 受保護的機台列表頁面 */}
      <Route path="/machines" 
      element={<ProtectedRoute>
        <MachineListPage />
        </ProtectedRoute>
      }
      />
      {/* 2. 受保護的機台列表頁面 */}
      <Route path="*" element={<Navigate to="/machines" replace />} />
    </Routes>
  );
}
