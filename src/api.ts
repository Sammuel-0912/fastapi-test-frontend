import axios from "axios";
import { getToken } from "./auth"; // 🆕 匯入 getToken
import { appConfig } from "./config";

const api = axios.create();

// 🟢 2. 完整 Request Interceptor：設定動態 baseURL 與 Bearer Token
api.interceptors.request.use((config) => {
  if (appConfig.VITE_API_BASE_URL) {
    config.baseURL = appConfig.VITE_API_BASE_URL;
  }
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🟢 響應攔截器：讀取自訂 Header 並輸出 Log
api.interceptors.response.use(
  (response) => {
    // 💡 注意：axios 的 headers key 統一為小寫字串
    const processTime = response.headers["x-process-time"];
    if (processTime) {
      const ms = (+processTime * 1000).toFixed(1);
      console.log(
        `⏱ [${response.config.method?.toUpperCase()}] ${response.config.url} 耗時 ${ms}ms`,
      );
    } else {
      console.log(
        `⏱ [${response.config.method?.toUpperCase()}] ${response.config.url} x-process-time: undefined (CORS 未暴露)`,
      );
    }
    return response;
  },
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    // 只有非登入請求遇到 401 時才廣播登出事件，避免登入失敗時觸發錯誤的清空狀態
    if (error.response?.status === 401 && !isLoginRequest) {
      window.dispatchEvent(new Event("unauthorized"));
    }
    return Promise.reject(error);
  }
);
export default api;
