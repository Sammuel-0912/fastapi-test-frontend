# fastapi-test-frontend

工廠機台管理系統的前端，使用 **Vite + React 19 + TypeScript** 建置，透過 [axios](https://axios-http.com/) 串接 FastAPI 後端，讀取並顯示機台清單。

## 功能

- 啟動時呼叫後端 `GET /machines`，列出所有機台。
- 顯示每台機台的名稱、狀態（`operational` 顯示綠色、其餘紅色）與所在位置。
- 具備載入中提示與「尚無資料」的空狀態處理。

## 技術棧

| 項目 | 版本 |
| --- | --- |
| React | 19 |
| TypeScript | 6 |
| Vite | 8 |
| axios | 1.x |
| ESLint | 10 |

## 環境需求

- [Node.js](https://nodejs.org/)（建議 18 以上）
- 一個提供 `GET /machines` API 的 FastAPI 後端

## 快速開始

```bash
# 1. 安裝相依套件
npm install

# 2. 設定後端 API 位址（見下方「設定」）
cp .env.example .env

# 3. 啟動開發伺服器
npm run dev
```

開發伺服器預設在 <http://localhost:5173> 啟動。

## 設定

後端 API 位址有兩種設定方式，**執行期的 `config.json` 優先權高於建置期的環境變數**：

### 1. 建置期環境變數（`.env`）

複製 [.env.example](.env.example) 為 `.env`，填入後端位址：

```
VITE_API_BASE_URL=http://localhost:8000
```

> `.env` 已被 gitignore，不會進版控；請勿把機敏資訊寫進 `.env.example`。

### 2. 執行期設定（`public/config.json`）

[public/config.json](public/config.json) 會在 App 啟動時被讀取，並覆蓋 `VITE_API_BASE_URL`：

```json
{
  "VITE_API_BASE_URL": "http://localhost:8000"
}
```

由於 `config.json` 位於 `public/`，建置後仍是獨立檔案，**可在部署後直接修改，無需重新 build** 就能切換後端位址（例如 dev / staging / production 共用同一份前端產物）。載入邏輯見 [src/main.tsx](src/main.tsx)，axios 攔截器見 [src/api.ts](src/api.ts)。

## 可用指令

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 啟動開發伺服器（HMR） |
| `npm run build` | 型別檢查（`tsc -b`）並打包產出至 `dist/` |
| `npm run preview` | 本地預覽正式版產物 |
| `npm run lint` | 執行 ESLint 檢查 |

## 專案結構

```
├── public/
│   └── config.json      # 執行期設定（後端 API 位址）
├── src/
│   ├── main.tsx         # 進入點，載入 config.json 後才 render
│   ├── App.tsx          # 機台清單畫面
│   ├── api.ts           # axios 實例與 baseURL 攔截器
│   └── index.css        # 全域樣式
├── .env.example         # 環境變數範本
└── vite.config.ts       # Vite 設定
```

## 後端 API

App 預期後端 `GET /machines` 回傳機台陣列，每筆結構如下（對應後端的 `MachineListResponse`）：

```ts
interface Machine {
  id: number;
  name: string;
  status: string | null;    // 例如 "operational"
  location: string | null;
}
```
