#!/usr/bin/env bash
set -euo pipefail

# Build and restart the app on Tencent Cloud Lighthouse.
# Run from repo root on the server.

APP_DIR="${APP_DIR:-/var/www/ai-iep-platform}"
cd "${APP_DIR}"

if [[ ! -f ".env.production" ]]; then
  echo "Missing .env.production in ${APP_DIR}"
  echo "Copy .env.production.example and fill in your values first."
  exit 1
fi

echo "==> Loading environment..."
set -a
# shellcheck disable=SC1091
source .env.production
set +a

echo "==> Installing dependencies..."
npm ci

echo "==> Building Next.js (standalone)..."
npm run build

echo "==> Preparing standalone bundle..."
STANDALONE="${APP_DIR}/.next/standalone"
cp -r public "${STANDALONE}/public"
mkdir -p "${STANDALONE}/.next"
cp -r .next/static "${STANDALONE}/.next/static"

echo "==> Starting with PM2..."
export APP_DIR
pm2 delete ai-iep-platform 2>/dev/null || true
pm2 start deploy/tencent-cloud/ecosystem.config.cjs
pm2 save

# Enable PM2 startup on reboot (run the command PM2 prints if first time).
pm2 startup systemd -u "${USER}" --hp "${HOME}" 2>/dev/null || true

echo ""
echo "Deploy complete. App listening on http://127.0.0.1:3000"
echo "Configure nginx (see deploy/tencent-cloud/DEPLOY.md) then visit your server IP."
