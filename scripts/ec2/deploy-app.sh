#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/shopsmart}"
APP_NAME="${APP_NAME:-shopsmart-backend}"
FRONTEND_APP_NAME="${FRONTEND_APP_NAME:-shopsmart-frontend}"
BACKEND_PORT="${BACKEND_PORT:-5001}"
BACKEND_FRONTEND_URL="${BACKEND_FRONTEND_URL:-}"
PUBLIC_HOST="${PUBLIC_HOST:-localhost}"
FRONTEND_PORT="${FRONTEND_PORT:-4173}"
FRONTEND_API_URL="${FRONTEND_API_URL:-}"
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

PRIMARY_PUBLIC_HOST="$(printf '%s' "${PUBLIC_HOST%%,*}" | sed -E 's#^https?://##; s#/.*$##' | xargs)"
if [ -z "${PRIMARY_PUBLIC_HOST}" ]; then
  PRIMARY_PUBLIC_HOST="localhost"
fi

if [ -z "${FRONTEND_API_URL}" ]; then
  FRONTEND_API_URL="http://${PRIMARY_PUBLIC_HOST}:${BACKEND_PORT}"
fi

FRONTEND_API_URL="${FRONTEND_API_URL%/}"
if [ "${FRONTEND_API_URL}" = "/api" ] || [ "${FRONTEND_API_URL}" = "api" ]; then
  FRONTEND_API_URL="http://${PRIMARY_PUBLIC_HOST}:${BACKEND_PORT}"
fi
FRONTEND_API_URL="${FRONTEND_API_URL%/api}"

if [ -z "${BACKEND_FRONTEND_URL}" ] || [ "${BACKEND_FRONTEND_URL}" = "http://localhost:5173" ] || [ "${BACKEND_FRONTEND_URL}" = "http://127.0.0.1:5173" ]; then
  BACKEND_FRONTEND_URL="http://${PRIMARY_PUBLIC_HOST}:${FRONTEND_PORT}"
fi

# Always keep local dev origins allowed so browser CORS remains friendly after deploys.
BACKEND_FRONTEND_URL="${BACKEND_FRONTEND_URL},http://localhost:5173,http://127.0.0.1:5173"

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

if ! command -v serve >/dev/null 2>&1; then
  npm install -g serve
fi

if pm2 describe "${FRONTEND_APP_NAME}" >/dev/null 2>&1; then
  pm2 restart "${FRONTEND_APP_NAME}" --update-env
else
  pm2 start "$(command -v serve)" --name "${FRONTEND_APP_NAME}" -- -s "${APP_DIR}/frontend/dist" -l "${FRONTEND_PORT}"
fi

pm2 save || true

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
    if curl -fsS "http://127.0.0.1:${FRONTEND_PORT}/" >/dev/null 2>&1; then
      echo "Frontend health check passed."
      frontend_healthy=1
      break
    fi
    sleep 2
  done

  if [ "${frontend_healthy}" -ne 1 ]; then
    echo "Frontend health check failed."
    pm2 logs "${FRONTEND_APP_NAME}" --lines 80 --nostream || true
    exit 1
  fi
fi

echo "ShopSmart deployed at $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Frontend URL: http://${PRIMARY_PUBLIC_HOST}:${FRONTEND_PORT}"
