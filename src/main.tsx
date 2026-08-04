import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { setConfig } from "./config";

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
      <App />
    </StrictMode>,
  );
}

// 啟動應用程式
initApp();