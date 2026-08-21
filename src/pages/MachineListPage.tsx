import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { useAuth } from "../contexts/AuthContext";
import { useMachines } from "../hooks/useMachines";
import type { MachineResponse } from "../types";
import { getErrorMessage } from "../utils/errorMessage";
import { Link } from "react-router-dom"; // 🆕 匯入 Link
import { useState } from "react";

export default function MachineListPage() {
  
  // 1. 新增頁碼 state，預設第 1 頁
  const [page, setPage] = useState(1);
  // 2. 將 page 傳入 hook，同時拿到 isPlaceholderData (代表是否為上一頁殘影)
  // 🟢 1. 解構出 machines 與 hasNextPage

  const { data, isFetching, isPlaceholderData, isPending, error } =
    useMachines(page);

  const machines = data?.machines ?? [];
  const hasNextPage = data?.hasNextPage ?? false;

  const processTimeMs = data?.processTimeMs ?? null;

  // 🟢 1. 取得 isAdmin 與 user 資訊

  const { isAuthenticated, isAdmin, user, isUserLoading, logout } = useAuth();

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
  });
  // 🟢 2. 建立刪除 Mutation (DELETE /machines/{id})
  const deleteMachineMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/machines/${id}`);

    },
    onSuccess: () => {
      alert("🗑 機台已成功刪除！");
      // 🎯 再次使用 invalidateQueries 自動刷新列表快取
      queryClient.invalidateQueries({ queryKey: ["machines"]});
    },
    onError: (err) => {
      alert(`❌ 刪除失敗 (${getErrorMessage(err, "無權限或機台不存在")})`);
    }
  });

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`確定要刪除機台「${name}」嗎？`)) {
      deleteMachineMutation.mutate(id);
    }
  };

  // 🟢 3. 抽離列表渲染邏輯，空狀態文案分兩種情境
  const renderContent = () => {
    if (isPending) {
      return <div>⏳ 載入中...</div>;
    }
    if (error) {
      return (
        <div style={{ color: "red" }}>
          ⚠️ {getErrorMessage(error, "載入失敗")}
        </div>
      );
    }
    if (machines.length === 0) {
      if (page === 1) {
        return <p>📭 目前尚無機台資料</p>;
      }
      return (
        <p style={{ color: "#718096" }}>
          ⚠️ 這一頁沒有資料了，請點擊下方返回上一頁
        </p>
      );
    }
    return (
      <ul style={{ opacity: isFetching ? 0.7 : 1, transition: "opacity 0.2s" }}>
        {machines.map((m) => (
          <li key={m.id} style={{ marginBottom: "8px" }}>
            <span>
              <Link
              to={`/machines/${m.id}`}
              style={{
                fontWeight: "bold",
                color: "#2b6cb0",
                textDecoration: "none",
              }}
            >
              {m.name}
            
            </Link>{" "}
            — {m.status} @ 📍 {m.location}
            </span> 
            {/* 🟢 3. RBAC 按鈕渲染：只有管理員能看到刪除按鈕 */}
            {isAdmin && (
              <button
              onClick={() => handleDelete(m.id, m.name)}
              disabled={deleteMachineMutation.isPending}
              style={{
                marginLeft: "12px",
                padding: "2px 8px",
                backgroundColor: "#e53e3e",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
              >
                🗑 刪除
              </button>
            )}
          </li>
        ))}
      </ul>
    );
  };

  const isNextDisabled = isPlaceholderData || !hasNextPage;

  const renderAuthStatus = () => {
    if (!isAuthenticated) return "👤 訪客模式 (僅供檢視)";
    if (isUserLoading) return "⏳ 載入使用者資訊中...";
    return `✅ 已登入：${user?.username ?? ""} (${isAdmin ? "系統管理員" : "一般使用者"})`;
  }
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      {/* 頂部導覽列 */}
      <div
        style={{
          background: isAuthenticated ? "#e6fffa" : "#f7fafc",
          padding: "12px 16px",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid #e2e8f0",
        }}
      >
        <div>
          <span>{renderAuthStatus()}</span>
          {isFetching && !isPending && (
            <span
              style={{ marginLeft: "12px", color: "#3182ce", fontSize: "13px" }}
            >
              🔄 資料更新中...
            </span>
          )}
        </div>
        {isAuthenticated ? (
          <button
            onClick={logout}
            style={{ padding: "6px 12px", cursor: "pointer" }}
          >
            登出
          </button>
        ) : (
          <Link
            to="/login"
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
        )}
      </div>
      <hr style={{ margin: "20px 0" }} />

      
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>🏭 工廠機台管理系統</h1>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {/* 🟢 顯示後端查詢耗時，超過 100ms 顯示警告色 */}
        {processTimeMs != null && (
        <span
        style={{
          fontSize: "12px",
          padding: "4px 8px",
          borderRadius: "4px",
          backgroundColor: processTimeMs > 100 ? "#feebc8" : "#edf2f7",
          color: processTimeMs > 100 ? "#c05621" : "#4a5568",
          fontFamily: "monospace",
        }}
      >
        ⏱ 後端耗時：{processTimeMs}ms
      </span>
        )}
        </div>
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
            {createMachineMutation.isPending ? "新增中..." : "➕ 新增機台 (POST /machines)"}
          </button>
        )}
        
      </div>

      {/* 列表內容區塊 */}
      {renderContent()}

      {/* 🟢 3. 換頁控制列 */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "20px",
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          style={{
            padding: "6px 12px",
            backgroundColor: page === 1 ? "#e2e8f0" : "#cbd5e0",
            cursor: page === 1 ? "not-allowed" : "pointer",
            border: "none",
            borderRadius: "4px",
          }}
        >
          上一頁
        </button>
        <span>目前頁數: 第 {page} 頁</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={isNextDisabled}
          style={{
            padding: "6px 12px",
            backgroundColor: isNextDisabled ? "#e2e8f0" : "#cbd5e0",
            cursor: isNextDisabled ? "not-allowed" : "pointer",
            border: "none",
            borderRadius: "4px",
          }}
        >
          下一頁
        </button>
      </div>
    </div>
  );
}
