#!/usr/bin/env bash
set -euo pipefail

# 在服务器上运行，拉取代码、构建并启动应用
# 用法: bash deploy/tencent-cloud/deploy-app.sh

APP_DIR="/var/www/ai-iep-platform"
REPO_URL="https://github.com/Danke123-chn/ai-iep-platform.git"
BRANCH="main"

cd "$APP_DIR"

if [[ ! -d .git ]]; then
  echo "==> 首次克隆仓库"
  git clone --branch "$BRANCH" "$REPO_URL" .
else
  echo "==> 拉取最新代码"
  git fetch origin
  git reset --hard "origin/$BRANCH"
fi

if [[ ! -f .env.production ]]; then
  echo "错误: 请先创建 $APP_DIR/.env.production"
  echo "可参考 deploy/tencent-cloud/.env.production.example"
  exit 1
fi

echo "==> 安装依赖"
npm ci

echo "==> 加载环境变量并构建"
set -a
# shellcheck disable=SC1091
source .env.production
set +a
npm run build

echo "==> 准备 standalone 运行目录"
mkdir -p .next/standalone/.next
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

echo "==> 启动/重启 PM2"
set -a
# shellcheck disable=SC1091
source .env.production
set +a
pm2 startOrReload deploy/tencent-cloud/ecosystem.config.cjs --update-env
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo "==> 更新 Nginx 配置"
cp deploy/tencent-cloud/nginx.conf /etc/nginx/sites-available/ai-iep-platform
nginx -t && systemctl reload nginx

SERVER_IP="$(curl -fsS --max-time 5 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo ""
echo "部署完成！"
echo "访问: http://${SERVER_IP}"
echo "若已绑定域名，请用域名访问并配置 HTTPS。"
