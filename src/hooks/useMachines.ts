import type { MachineListResponse } from "../types";
import api from "../api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useMachines(page: number) {
  const limit = 10;
  return useQuery({
    queryKey: ["machines", page], // 🎯 page 進 key，確保每一頁各自獨立快取
    queryFn: async ({ signal }) => {
      // 💡 signal 由 TanStack Query 自動注入與管理，不用手動建 AbortController
      const res = await api.get<MachineListResponse[]>("/machines", {
        params: {skip: (page -1) * limit, limit},
        signal,
      });
      return res.data;
    },
    placeholderData: keepPreviousData, // 👈 換頁時保留舊資料，避免畫面閃空白
  })
}
