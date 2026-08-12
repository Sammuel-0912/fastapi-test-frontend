import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { MachineResponse } from "../types";
import { getErrorMessage } from "../utils/errorMessage";
import api from "../api";



export default function MachineDetailPage() {
  // 1. useParams 拿到的參數永遠是 string | undefined
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 2. 誠實地宣告初始值為 null
  const [machine, setMachine] = useState<MachineResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 當沒有 id 時不發送請求
    if (!id) return;

    const controller = new AbortController();
    setLoading(true);

    api
    .get<MachineResponse>(`/machines/${id}`, {signal: controller.signal})
    .then((res) => {
      setMachine(res.data);
    })
    .catch ((err) => {
      const msg = getErrorMessage(err, "無法載入機台資料");
      if (msg) setError(msg);
    })
    .finally(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });
    return () => {
      controller.abort();
    };
  }, [id]); // 🎯 [id] 是關鍵！當 URL 的 id 改變時，重新觸發 fetch

  if (loading) return <div style={{ padding: "20px" }}>⏳ 載入機台詳情中...</div>;
  if (error) 
    return (
      <div style={{ padding: "20px" }}>
        <button onClick={() => navigate("/machines")} style={{ marginBottom: "12px", cursor: "pointer" }}>
          ← 返回列表
        </button>
        <div style={{ color: "red" }}>⚠️ {error}</div>
      </div>
    );
  if (!machine) return null;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <button onClick={() => navigate("/machines")}
        style={{ marginBottom: "16px", padding: "6px 12px", cursor: "pointer" }}
        >
          ← 返回列表
      </button>

      <h2>🏭 {machine.name}</h2>
      <p>
        <strong>狀態：</strong>{machine.status} | 📍 <strong>位置：</strong>{machine.location}
      </p>

      <hr style={{ margin: "20px 0" }} />

      <h3>📋 運作日誌 ({machine.logs?.length ?? 0})筆</h3>
      {!machine.logs || machine.logs.length === 0 ? (
        <p style={{ color: "#718096" }}>目前尚無運作日誌</p>
      ) : (
        <ul style={{ background: "#f7fafc", padding: "16px 32px", borderRadius: "8px" }}>
          {machine.logs.map((log) => (
            <li key={log.id} style={{ marginBottom: "8px" }}>
              {log.message}
            </li>
      ))}
        </ul>
      )}
    </div>
  );
}