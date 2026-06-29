#!/usr/bin/env bash
set -euo pipefail

# 在全新的 Ubuntu 22.04 轻量服务器上运行（需 root）
# 用法: curl -fsSL <raw-url>/setup-server.sh | sudo bash

APP_DIR="/var/www/ai-iep-platform"
REPO_URL="https://github.com/Danke123-chn/ai-iep-platform.git"

echo "==> 更新系统包"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y

echo "==> 安装基础工具"
apt-get install -y curl git nginx ufw

echo "==> 安装 Node.js 20"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "==> 安装 PM2"
npm install -g pm2

echo "==> 创建应用目录"
mkdir -p "$APP_DIR"
chown -R "${SUDO_USER:-root}:${SUDO_USER:-root}" "$APP_DIR" 2>/dev/null || true

echo "==> 配置 Nginx"
cat > /etc/nginx/sites-available/ai-iep-platform <<'NGINX'
server {
    listen 80;
    server_name _;
    client_max_body_size 20m;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/ai-iep-platform /etc/nginx/sites-enabled/ai-iep-platform
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

echo "==> 配置防火墙"
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

echo "==> 服务器初始化完成"
echo "下一步:"
echo "  1. cd $APP_DIR && 配置 .env.production"
echo "  2. bash deploy/tencent-cloud/deploy-app.sh"
