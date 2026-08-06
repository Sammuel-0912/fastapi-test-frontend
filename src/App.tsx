import { useEffect, useState } from "react";
import api from "./api";
// 💡 使用 import type，明確告訴編譯器這只是型別定義，不會產生任何 JS 程式碼
import type { MachineListResponse, MachineResponse} from "./types";
import LoginForm from "./components/LoginForm";
import { useAuth } from "./contexts/AuthContext";
import axios from "axios";

export default function App() {
  const [machines, setMachines] = useState<MachineListResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // 🆕 1. 新增 error 狀態，預設為 null
  const [error, setError] = useState<string | null>(null);

  // 🆕 取得認證狀態與登出函式
  const {isAuthenticated, logout } = useAuth();

  // 🆕 2. 讓 fetchMachines 支援可選的 signal 參數
  const fetchMachines = (signal?: AbortSignal) => {
    setLoading(true);
    api
    .get<MachineListResponse[]>("/machines", {signal})
    .then((res) => setMachines(res.data))
    // 🆕 3. 如果請求是因為被 controller.abort() 取消的，直接忽略，不當成錯誤處理
    .catch((err) => {
      if (axios.isCancel(err)) {
        console.log("❌ 成功攔截：舊的請求已被安全取消");
        return;
      }
      console.error("抓取機台失敗:", err);
      const detailMessage = err.response?.data?.detail;
      setError(detailMessage ?? "無法連線至伺服器");
    })
    .finally(() => {
      // 🆕 4. 只有在請求「沒有被取消」的情況下，才關閉載入狀態
      if (!signal?.aborted) {
        setLoading(false);
      }
    });
  }

  useEffect(() => {
    // 🆕 5. 在 useEffect 中建立 AbortController 並在 cleanup 呼叫 abort()
    const controller = new AbortController();
    fetchMachines(controller.signal);
    // 🧹 cleanup 函式：當元件卸載或 StrictMode 重跑時先取消上一次的爛攤子

    return () => {
      controller.abort();
    }
  }, []);
  // 🧪 測試新增機台的受保護 API (POST /machines 需要 Token)
  const handleCreateMachine = async () => {
    try {
      const newMachine = {
        name: `測試機台-${Math.floor(Math.random() * 1000)}`,
        status: "operational",
        location: "Line C",
      };
      const res = await api.post<MachineResponse>("/machines", newMachine);
      alert(`🎉 新增成功！機台名稱：${res.data.name}`);
      
      // 🆕 6. 新增成功後重新刷新列表，這裡不傳 signal 就會像一般請求一樣正常執行
      
      fetchMachines(); // 重新整理列表

    } catch (err: any) {
      console.error("新增失敗:", err);
      const detail = err.response?.data?.detail;
      alert(`❌ 請求失敗 (${err.response?.status})：${JSON.stringify(detail)}`);
    }
  }

  
  
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      {/* 頂部認證列 */}
      {!isAuthenticated ? (
        <LoginForm />
      ) : (
        <div style={{ background: "#e6fffa", padding: "12px 16px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>✅ 管理員已登入 (Token 已自動注入)</span>
          <button onClick={logout} style={{ padding: "6px 12px", cursor: "pointer" }}>登出</button>
        </div>
      )
    }
    <hr style={{ margin: "20px 0" }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>🏭 工廠機台管理系統</h1>
        {/* 🧪 測試按鈕：無論是否登入皆可點擊測試 */}
        <button
          onClick={handleCreateMachine}
          style={{ padding: "10px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          ➕ 測試新增機台 (POST /machines)
        </button>
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
          <li key={m.id} style={{marginBottom: "8px"}}>
            <strong>{m.name}</strong> - {m.status} @ 📍 {m.location}
          </li>
        ))}
      </ul>
    )}
    </div>
  );
}

