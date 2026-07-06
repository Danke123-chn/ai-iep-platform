#!/usr/bin/env bash
set -euo pipefail

# One-time setup for Tencent Cloud Lighthouse (Ubuntu 22.04+).
# Run as root: bash setup-server.sh

APP_DIR="/var/www/ai-iep-platform"
NODE_MAJOR=20

echo "==> Installing system packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y curl git nginx ufw ca-certificates gnupg

echo "==> Installing Node.js ${NODE_MAJOR}.x..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

echo "==> Installing PM2..."
npm install -g pm2

echo "==> Creating app directory..."
mkdir -p "${APP_DIR}"
chown -R "${SUDO_USER:-root}:${SUDO_USER:-root}" "${APP_DIR}" 2>/dev/null || true

echo "==> Configuring firewall..."
ufw allow OpenSSH || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw --force enable || true

echo "==> Enabling nginx..."
systemctl enable nginx
systemctl start nginx

echo "==> Adding 2GB swap (helps Next.js build on 2GB RAM instances)..."
if [[ ! -f /swapfile ]]; then
  fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo ""
echo "Server setup complete."
echo "Next steps:"
echo "  1. Clone repo to ${APP_DIR}"
echo "  2. Copy deploy/tencent-cloud/env.production.example to ${APP_DIR}/.env.production and fill values"
echo "  3. Run: bash ${APP_DIR}/deploy/tencent-cloud/deploy-app.sh"
echo "  4. Copy nginx config: see deploy/tencent-cloud/DEPLOY.md"
