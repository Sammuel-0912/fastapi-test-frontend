import type { MachineListResponse } from "../types";
import api from "../api";
import { useQuery } from "@tanstack/react-query";

export function useMachines() {
  return useQuery({
    queryKey: ["machines"],
    queryFn: async ({ signal }) => {
      // 💡 signal 由 TanStack Query 自動注入與管理，不用手動建 AbortController
      const res = await api.get<MachineListResponse[]>("/machines", {
        params: {limit: 100},
        signal,
      });
      return res.data;
    }
  })
}
