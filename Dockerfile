# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# 🟢 套用自訂 nginx 設定（含 /api 反向代理與 React Router 的 try_files）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 🟢 複製啟動腳本並賦予執行權限
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]