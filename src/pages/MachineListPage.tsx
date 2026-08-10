import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useMachines } from "../hooks/useMachines";
import type { MachineResponse } from "../types";
import { getErrorMessage } from "../utils/errorMessage";
import { Link } from "react-router-dom"; // 🆕 匯入 Link

export default function MachineListPage() {
  const { machines,  setMachines, loading, error, refetch } = useMachines();
  
  const { isAuthenticated, logout } = useAuth();

  const handleCreateMachine = async () => {
    try {
      const newMachine = {
        name: `測試機台-${Math.floor(Math.random() * 1000)}`,
        status: "operational",
        location: "Line C",
      };
      const res = await api.post<MachineResponse>("/machines", newMachine);
      setMachines(prev => [res.data, ...prev]);
      alert(`🎉 新增成功！機台名稱：${res.data.name}`);
      refetch();
    } catch (err) {
      alert(`❌ 請求失敗 (${getErrorMessage(err, "新增機台失敗")})`);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      {/* 頂部導覽列 */}

      <div style={{ background: isAuthenticated ? "#e6fffa" : "#f7fafc" , padding: "12px 16px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span> {isAuthenticated ? "✅ 已登入管理員系統" : "👤 訪客模式 (僅供檢視)"}</span>
        {isAuthenticated ? (
          <button onClick={logout} style={{ padding: "6px 12px", cursor: "pointer" }}>
          登出
        </button>
        ) : (
          <Link to="/login"
          style={{
            padding: "6px 12px",
            backgroundColor: "#3182ce",
            color: "white",
            borderRadius: "4px",
            textDecoration: "none",
          }}
          >
            前往登入🔑
          </Link>
        )
      }
      </div>

      <hr style={{ margin: "20px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>🏭 工廠機台管理系統</h1>
        {/* 🟢 只在已登入時顯示新增機台按鈕 */}
        {isAuthenticated && (
          <button
            onClick={handleCreateMachine}
            style={{
              padding: "10px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ➕ 新增機台 (POST /machines)
          </button>
        )}
      </div>

      {loading ? (
        <div>⏳ 載入中...</div>
      ) : error ? (
        <div style={{ color: "red" }}>⚠️ {error}</div>
      ) : machines.length === 0 ? (
        <p>📭 目前尚無機台資料</p>
      ) : (
        <ul>
          {machines.map((m) => (
            <li key={m.id} style={{ marginBottom: "8px" }}>
              <strong>{m.name}</strong> — {m.status} @ 📍 {m.location}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}