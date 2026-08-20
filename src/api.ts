import axios from "axios";
import { getToken} from "./auth"; // 🆕 匯入 getToken

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
        const processTime = response.headers["x-process-time"];
        if (processTime) {
            const ms = (+processTime * 1000).toFixed(1);
            console.log(`⏱ [${response.config.method?.toUpperCase()}] ${response.config.url} 耗時 ${ms}ms`);
        } else {
            console.log(`⏱ [${response.config.method?.toUpperCase()}] ${response.config.url} x-process-time: undefined (CORS 未暴露)`);
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            window.dispatchEvent(new Event("unauthorized"));
        }
        return Promise.reject(error);
    }
)
export default api;