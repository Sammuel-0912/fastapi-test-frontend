import { useEffect, useState } from "react";
import api from "./api";
// 💡 使用 import type，明確告訴編譯器這只是型別定義，不會產生任何 JS 程式碼
import type { MachineListResponse } from "./types";
import axios from "axios";
import LoginForm from "./components/LoginForm";

export default function App() {
  const [machines, setMachines] = useState<MachineListResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // 🆕 1. 新增 error 狀態，預設為 null
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 💡 加上泛型 <MachineListResponse[]>，讓 res.data 自動推導出正確型別
    const controller = new AbortController();

    // 🆕 2. 將 signal 傳入 axios 請求設定
    api
      .get<MachineListResponse[]>("/machines", {signal: controller.signal})
      .then((res) => {
        // axios 會自動將回傳 JSON 解析放在 res.data
        setMachines(res.data);
      })
      .catch((err) => {
        // 🆕 3. 如果請求是因為被 abort 取消的，直接 return 不當成錯誤處理
        if (axios.isCancel(err) || err.name === "CanceledError") {
          console.log("❌ 成功攔截：第一個請求已被 Abort 取消");
          return;
        }
        console.error("抓取機台失敗:", err);
        // 🆕 2. 優先讀取 FastAPI 的 {"detail": "..."}，若無則降級回通用訊息
        const detailMessage = err.response?.data?.detail;
        setError(detailMessage ?? "無法連線至伺服器，請檢查網路或稍後再試。");
      })
      .finally(() => {
        // 只有未被取消的請求才去關閉 loading (或使用 controller.signal.aborted 判斷)
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
      // 🆕 4. 回傳 cleanup 函式：當元件卸載或重新執行 effect 時自動取消上一次未完成的請求
      return () => {
        console.log("🧹 Cleanup 觸發：執行 controller.abort()");
        controller.abort();
      }
  }, []);

  if (loading) {
    return <div style={{ padding: "20px" }}>載入機台資料中...</div>;
  }
  if (error) {
    return (
      <div style={{ padding: "20px", color: "red", fontFamily: "sans-serif" }}>
        <h2>⚠️ 系統發生錯誤</h2>
        <p>{error}</p>
      </div>
    );
  }
  if (machines.length === 0) {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>🏭 工廠機台管理系統</h1>
        <p>📭 目前尚無機台資料，請透過後端 API 新增。</p>
      </div>
    );
  }
  // 到這裡代表成功拿到資料 (Success)
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <LoginForm />
      
      <hr style={{ margin: "20px 0" }} />
      
      <h1>🏭 工廠機台管理系統</h1>
      <ul>
        {machines.map((m) => (
          <li key={m.id} style={{ marginBottom: "8px" }}>
            <strong>{m.name}</strong> —{" "}
            <span
              style={{ color: m.status === "operational" ? "green" : "red" }}
            >
              {m.status || "未知"}
            </span>{" "}
            @ 📍 {m.location || "未指派"}
          </li>
        ))}
      </ul>
    </div>
  );
}
