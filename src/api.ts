import axios from "axios";
import { appConfig } from "./config";
import { getToken } from "./auth"; // 🆕 匯入 getToken

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 使用 Request Interceptor (攔截器) 動態插入最新 baseURL
// 這是為了確保攔截發出請求時，appConfig 已經載入完畢
api.interceptors.request.use((config) => {
    if (appConfig.VITE_API_BASE_URL) {
        config.baseURL = appConfig.VITE_API_BASE_URL;
    }
    // 🆕 2. 自動附加 Authorization Header
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});


export default api;