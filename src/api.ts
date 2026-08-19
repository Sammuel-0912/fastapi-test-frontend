import axios from "axios";
import { appConfig } from "./config";
import { getToken, setToken } from "./auth"; // 🆕 匯入 getToken

const api = axios.create();

// 請求攔截器：附加 Token
api.interceptors.request.use((config) => {
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
        const processTime = response.headers["x-[process-time"];
        if (processTime) {
            const ms = (+processTime * 1000).toFixed(1);
            console.log(`⏱ [${response.config.method?.toUpperCase()}] ${response.config.url} 耗時 ${ms}ms`);
        }
        return response;
    }
)


api.interceptors.request.use((config) => {
    if (appConfig.VITE_API_BASE_URL) {
        config.baseURL = appConfig.VITE_API_BASE_URL
    }
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }  
    return config;
    });
    // 🆕 2. Response Interceptor (自動處理 401 過期)
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            // 檢查發出請求的 URL 是否為登入端點
            const isLoginRequest = error.config?.url?.includes("/auth/login");
            // 當遇到 401 Unauthorized 且「不是登入請求」時，代表已保存的 Token 過期或無效
            if (error.response?.status === 401 && !isLoginRequest) {
                console.warn("🔒 Token 已失效或過期，自動清除 Token 並退回未登入狀態");
                setToken(null); // 清除模組中的 Token
                // 如果需要在畫面上同步更新，可觸發 window 事件或交由元件判斷
                window.dispatchEvent(new Event("unauthorized"));
            }
            // ⚠️ 關鍵：一定要回傳 Promise.reject(error)，否則呼叫端會以為請求成功
            return Promise.reject(error);
        }
    );
export default api;