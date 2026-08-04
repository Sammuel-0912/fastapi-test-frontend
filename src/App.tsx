import { useEffect, useState } from 'react'
import api from "./api"; 

// 對應後端 read_machines 回傳的 MachineListResponse (不含 logs)
interface Machine {
  id: number;
  name: string;
  status: string | null;
  location: string | null;
}

export default function App() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 直接呼叫相對路徑即可
    api.get<Machine[]>("/machines")
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




