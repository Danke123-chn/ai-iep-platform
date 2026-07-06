#!/usr/bin/env bash
set -euo pipefail

# Configure nginx reverse proxy for ai-iep-platform.
# Usage:
#   bash deploy/tencent-cloud/setup-nginx.sh              # IP-only (server_name _)
#   bash deploy/tencent-cloud/setup-nginx.sh example.com  # bind domain

APP_DIR="${APP_DIR:-/var/www/ai-iep-platform}"
DOMAIN="${1:-_}"

cd "${APP_DIR}"
sed "s/YOUR_DOMAIN/${DOMAIN}/" deploy/tencent-cloud/nginx.conf | tee /etc/nginx/sites-available/ai-iep-platform >/dev/null
ln -sf /etc/nginx/sites-available/ai-iep-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo ""
echo "Nginx configured. server_name=${DOMAIN}"
if [[ "${DOMAIN}" == "_" ]]; then
  echo "Visit: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_SERVER_IP')"
else
  echo "Visit: http://${DOMAIN}"
  echo "HTTPS: sudo certbot --nginx -d ${DOMAIN}"
fi
