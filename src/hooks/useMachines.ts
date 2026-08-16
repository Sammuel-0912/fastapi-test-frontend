import type { MachineListResponse } from "../types";
import api from "../api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

// 🟢 1. 統一管理分頁大小常數
export const PAGE_SIZE = 10;

export function useMachines(page: number) {
  
  return useQuery({
    queryKey: ["machines", page], // 🎯 page 進 key，確保每一頁各自獨立快取
    queryFn: async ({ signal }) => {
      // 🟢 2. 技巧：跟後端多要 1 筆 (11 筆)，用來實測下一頁到底有沒有資料
      // 💡 signal 由 TanStack Query 自動注入與管理，不用手動建 AbortController
      const res = await api.get<MachineListResponse[]>("/machines", {
        params: {skip: (page -1) * PAGE_SIZE, limit:  PAGE_SIZE + 1},
        signal,
      });
      const rawData = res.data ?? [];
      const hasNextPage = rawData.length > PAGE_SIZE;
      const machines = rawData.slice(0, PAGE_SIZE); // 畫面只渲染前 10 筆
      return {
        machines,
        hasNextPage,
      };
    },
    placeholderData: keepPreviousData, // 👈 換頁時保留舊資料，避免畫面閃空白
  })
}
