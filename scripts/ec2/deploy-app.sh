#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/shopsmart}"
APP_NAME="${APP_NAME:-shopsmart-backend}"
BACKEND_PORT="${BACKEND_PORT:-5001}"
BACKEND_FRONTEND_URL="${BACKEND_FRONTEND_URL:-http://localhost:5173}"
FRONTEND_DOMAIN="${FRONTEND_DOMAIN:-_}"
FRONTEND_API_URL="${FRONTEND_API_URL:-/api}"
DEPLOY_REF="${DEPLOY_REF:-main}"
REPO_URL="${REPO_URL:-}"
BACKEND_ADMIN_KEY="${BACKEND_ADMIN_KEY:-}"

if [ -z "${REPO_URL}" ]; then
  echo "REPO_URL is required."
  exit 1
fi

if [ -z "${BACKEND_ADMIN_KEY}" ]; then
  echo "BACKEND_ADMIN_KEY is required."
  exit 1
fi

mkdir -p "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "${REPO_URL}" "$APP_DIR"
fi

cd "$APP_DIR"

git fetch --all --prune
git checkout "${DEPLOY_REF}"
git pull --ff-only origin "${DEPLOY_REF}"

cp -n .env.example .env || true
cp -n frontend/.env.example frontend/.env || true

cat > backend/.env <<EOF
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_URL=${BACKEND_FRONTEND_URL}
DATABASE_URL=file:./dev.db
ADMIN_KEY=${BACKEND_ADMIN_KEY}
EOF

cd backend
npm ci --no-audit --no-fund
npx prisma generate
npm run db:init
npm run db:seed

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  pm2 restart "${APP_NAME}" --update-env
else
  pm2 start ecosystem.config.cjs --only "${APP_NAME}"
fi

pm2 save || true

cd ../frontend
npm ci --no-audit --no-fund
cat > .env <<EOF
VITE_API_URL=${FRONTEND_API_URL}
EOF
npm run build

if ! command -v nginx >/dev/null 2>&1; then
  echo "nginx is required. Run scripts/ec2/bootstrap.sh."
  exit 1
fi

if ! sudo -n true >/dev/null 2>&1; then
  echo "Passwordless sudo is required for nginx config updates."
  exit 1
fi

sudo tee /etc/nginx/conf.d/shopsmart.conf >/dev/null <<EOF
server {
  listen 80;
  server_name ${FRONTEND_DOMAIN};
  root ${APP_DIR}/frontend/dist;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:${BACKEND_PORT}/api/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location / {
    try_files \$uri /index.html;
  }
}
EOF

if [ -f /etc/nginx/conf.d/default.conf ]; then
  sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak || true
fi

if [ -f /etc/nginx/sites-enabled/default ]; then
  sudo rm -f /etc/nginx/sites-enabled/default || true
fi

sudo nginx -t
sudo systemctl restart nginx

if command -v curl >/dev/null 2>&1; then
  backend_healthy=0
  for _ in $(seq 1 20); do
    if curl -fsS "http://127.0.0.1:${BACKEND_PORT}/api/health" >/dev/null 2>&1; then
      echo "Backend health check passed."
      backend_healthy=1
      break
    fi
    sleep 2
  done

  if [ "${backend_healthy}" -ne 1 ]; then
    echo "Backend health check failed."
    pm2 logs "${APP_NAME}" --lines 80 --nostream || true
    exit 1
  fi

  frontend_healthy=0
  for _ in $(seq 1 20); do
    if curl -fsS "http://127.0.0.1/" >/dev/null 2>&1; then
      echo "Frontend health check passed."
      frontend_healthy=1
      break
    fi
    sleep 2
  done

  if [ "${frontend_healthy}" -ne 1 ]; then
    echo "Frontend health check failed."
    sudo journalctl -u nginx --no-pager -n 80 || true
    exit 1
  fi
fi

echo "ShopSmart deployed at $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
