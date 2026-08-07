import { useCallback, useEffect, useState } from "react";
import axios from 'axios';
import type { MachineListResponse } from "../types";
import api from "../api";


export function useMachines() {
    const [machines, setMachines] = useState<MachineListResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
      // 🆕 1. 新增 error 狀態，預設為 null
    const [error, setError] = useState<string | null>(null);

    // 💡 使用 useCallback 包裹，確保 fetchMachines 在元件重新渲染時參考位址維持不變
    const fetchMachines = useCallback((signal?: AbortSignal) => {
        setLoading(true);
        setError(null);

        api.get<MachineListResponse[]>("/machines", {signal})
        .then((res) => {
            setMachines(res.data);
        })

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
        if (!signal?.aborted) {
            setLoading(false);
        }
    });
},[]);

useEffect(() => {
    // 🆕 5. 在 useEffect 中建立 AbortController 並在 cleanup 呼叫 abort()
    const controller = new AbortController();
    fetchMachines(controller.signal);
    // 🧹 cleanup 函式：當元件卸載或 StrictMode 重跑時先取消上一次的爛攤子

    return () => {
      controller.abort();
    };
  }, [fetchMachines]);
  // 💡 回傳物件：具名可讀、順序無關、擴充性極佳
  return {
    machines,
    loading,
    error,
    refetch: fetchMachines,
  };
}
