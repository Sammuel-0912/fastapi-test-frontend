import { useEffect, useState } from 'react'
import api from "./api"; 
// 💡 使用 import type，明確告訴編譯器這只是型別定義，不會產生任何 JS 程式碼
import type { MachineListResponse } from './types';

export default function App() {
  const [machines, setMachines] = useState<MachineListResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 💡 加上泛型 <MachineListResponse[]>，讓 res.data 自動推導出正確型別
    api.get<MachineListResponse[]>("/machines")
    .then((res) => {
      // axios 會自動將回傳 JSON 解析放在 res.data
      setMachines(res.data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("抓取機台失敗:", err);
      setLoading(false);
    });
  },[])

  if (loading) {
    return <div style={{ padding: "20px" }}>載入中...</div>;
  }
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>🏭 工廠機台管理系統</h1>
      {machines.length === 0 ? (
        <p>目前尚無機台資料，請先透過後端新增！</p>
      ) : (
        <ul>
          {machines.map((m) => (
            <li key={m.id} style={{ marginBottom: "8px" }}>
              <strong>{m.name}</strong> —{" "}
              <span style={{ color: m.status === "operational" ? "green" : "red" }}>
                {m.status || "未知"}
              </span>{" "}
              @ 📍 {m.location || "未指派"}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}




