import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { setConfig } from "./config";
import { StrictMode } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { BrowserRouter } from "react-router-dom"; // 🆕 匯入 BrowserRouter
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // 🆕 匯入 TanStack Query

// 🆕 建立全域 QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 💡 設定 4xx 用戶端錯誤不自動重試 3 次，避免 401/403 浪費時間
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
})

// 異步載入 Config 後才渲染 React
async function initApp() {
  try {
    // 加上 timestamp 防止瀏覽器快取 config.json
    const response = await fetch(`/config.json?t=${Date.now()}`);
    if (response.ok) {
      setConfig(await response.json());
    } else {
      console.warn("無法載入 config.json，將使用預設設定");
    }
  } catch (error) {
    console.error("載入 config.json 失敗:", error);
  }
  // 取得 config 後才 Render React App
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      {/* 🟢 包裹 QueryClientProvider */}
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
      </QueryClientProvider>  
    </StrictMode>,
  );
}

// 啟動應用程式
initApp();
