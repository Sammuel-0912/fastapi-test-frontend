import axios from "axios";
import { appConfig } from "./main";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 使用 Request Interceptor (攔截器) 動態插入最新 baseURL
// 這是為了確保攔截發出請求時，appConfig 已經載入完畢
api.interceptors.request.use((config) => {
    if (appConfig.VITE_API_BASE_URL) {
        config.baseURL = appConfig.VITE_API_BASE_URL;
    }
    return config;
});


export default api;