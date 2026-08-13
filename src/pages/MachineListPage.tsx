import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useMachines } from "../hooks/useMachines";
import type { MachineResponse } from "../types";
import { getErrorMessage } from "../utils/errorMessage";
import { Link } from "react-router-dom"; // 🆕 匯入 Link

export default function MachineListPage() {

  // 🟢 1. 從 useMachines 解構出 data, isPending, isFetching, error
  const {data: machines, isPending, isFetching, error} = useMachines();
  

  const { isAuthenticated, logout } = useAuth();

  const queryClient = useQueryClient();

  // 🟢 2. 使用 useMutation 管理新增操作
  const createMachineMutation = useMutation({
    mutationFn: async () => {
      const newMachine = {
        name: `測試機台-${Math.floor(Math.random() * 1000)}`,
        status: "operational",
        location: "Line C",
      };
      const res = await api.post<MachineResponse>("/machines", newMachine);
      return res.data;
    },
    onSuccess: (data) => {
      alert(`🎉 新增成功！機台名稱：${data.name}`);
      // 🎯 關鍵：宣告 ["machines"] 快取失效，TanStack Query 會自動替背景正在使用該 key 的頁面更新！
      // 這裡完全不需要手動建立孤兒 AbortController 了！
      queryClient.invalidateQueries({ queryKey: ["machines"] });
    },
    onError: (err) => {
      alert(`❌ 請求失敗 (${getErrorMessage(err, "新增機台失敗")})`);
    },
  })

  

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
            onClick={() => createMachineMutation.mutate()}
            disabled={createMachineMutation.isPending}
            style={{
              padding: "10px 16px",
              backgroundColor: createMachineMutation.isPending ? "#a0aec0" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: createMachineMutation.isPending ? "not-allowed" : "pointer",
            }}
          >
            ➕ 新增機台 (POST /machines)
          </button>
        )}
      </div>
      
      {/* ⚡️ 只有在第一次連資料都沒有 (isPending) 時才全螢幕顯示載入中 */}

      {isPending ? (
        <div>⏳ 載入中...</div>
      ) : error ? (
        <div style={{ color: "red" }}>⚠️ {getErrorMessage(error, "載入失敗")}</div>
      ) : machines.length === 0 ? (
        <p>📭 目前尚無機台資料</p>
      ) : (
        <ul>
          {machines.map((m) => (
            <li key={m.id} style={{ marginBottom: "8px" }}>
              {/* 🟢 為機台名稱加上導向 /machines/:id 的超連結 */}
              <Link
              to={`/machines/${m.id}`}
              style={{ fontWeight: "bold", color: "#2b6cb0", textDecoration: "none" }}
              >
              {m.name}
              </Link>{" "}
              {m.status} @ 📍 {m.location}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}