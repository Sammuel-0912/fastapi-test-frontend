#!/bin/sh
set -e

# 如果容器有傳入 API_BASE_URL，動態覆寫 config.json，否則保留預設值
if [ -n "$API_BASE_URL" ]; then
  echo "{\"VITE_API_BASE_URL\": \"$API_BASE_URL\"}" > /usr/share/nginx/html/config.json
fi

# 啟動 Nginx 主行程
exec nginx -g "daemon off;"