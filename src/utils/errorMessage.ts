import axios from "axios";

/**
 * 統一解析 Axios 錯誤與後端 FastAPI 錯誤格式 (401/403/404/422)
 * @param err 捕捉到的未知錯誤 (unknown)
 * @param fallback 萬一無法解析時的預設備用訊息
 * @returns 友善的使用者錯誤訊息字串
 */

export function getErrorMessage (err: unknown, fallback = "發生未知錯誤"): string {
  // 1. 如果是 AbortController 取消的請求，不算是業務錯誤，回傳空字串
  if (axios.isCancel(err)) {
    return "";
  }
  // 2. 利用 Axios 型別守衛 (Type Guard)
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;

    // 情況 A：detail 為純字串 (401, 403, 404, 500 等)
    if (typeof detail === "string") {
      return detail;
    }
    // 情況 B：detail 為 Pydantic 陣列 (422 Unprocessable Entity)
    if (Array.isArray(detail)) {
      return detail
      .map((d: any) => {
        // loc 陣列最後一個元素通常即為欄位名稱 (例如: ["body", "username"] -> "username")
        const fieldName = d.loc?.at(-1) ?? "欄位";
        return `${fieldName}: ${d.msg}`;
      })
      .join("、");
    }
    // 情況 C：沒有拿到 response (如網路中斷、Server 沒開、CORS 被擋)
    if (!err.response) {
      return "無法連線至伺服器，請檢查網路連線。";
    }
  }
  return fallback;
}