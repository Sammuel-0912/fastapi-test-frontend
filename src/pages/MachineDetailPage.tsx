import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { MachineResponse } from "../types";
import { getErrorMessage } from "../utils/errorMessage";
import api from "../api";
import { useQuery } from "@tanstack/react-query";



export default function MachineDetailPage() {
  // 1. useParams 拿到的參數永遠是 string | undefined
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 🟢 使用 useQuery 取代原本手寫的 useState + useEffect
  const {
    data: machine,
    isPending,
    error,
  } = useQuery({
    queryKey: ["machine", id], // 🎯 key 包含 id，id 變了就自動重抓
    queryFn: async ({ signal }) => {
      const res = await api.get<MachineResponse>(`/machines/${id}`, { signal });
      return res.data;
    }
  });

  // isPending 代表首次載入且尚無快取資料
  if (isPending) return <div style={{ padding: "20px" }}>⏳ 載入機台詳情中...</div>;

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <button onClick={() => navigate("/machines")} style={{ marginBottom: "12px", cursor: "pointer" }}>
          ← 返回列表
        </button>
        <div style={{ color: "red" }}>⚠️ {getErrorMessage(error, "無法載入機台資料")}</div>
      </div>
    );
  }
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