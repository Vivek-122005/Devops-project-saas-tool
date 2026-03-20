#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/shopsmart}"
SERVICE_NAME="${SERVICE_NAME:-shopsmart}"

mkdir -p "$APP_DIR"
cd "$APP_DIR"

if [ ! -d .git ]; then
  git clone "${REPO_URL}" .
fi

git fetch --all --prune
git checkout "${DEPLOY_REF:-main}"
git pull --ff-only origin "${DEPLOY_REF:-main}"

cp -n .env.example .env || true
cp -n backend/.env.example backend/.env || true
cp -n frontend/.env.example frontend/.env || true

cd backend
npm install
npx prisma generate
npm run db:init
npm run db:seed

cd ../frontend
npm install
npm run build

if command -v systemctl >/dev/null 2>&1; then
  SERVICE_FILE="$APP_DIR/infrastructure/ec2/systemd/${SERVICE_NAME}.service"

  if [ -f "$SERVICE_FILE" ] && sudo -n true >/dev/null 2>&1; then
    sudo cp "$SERVICE_FILE" "/etc/systemd/system/${SERVICE_NAME}.service"
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
    sudo systemctl restart "$SERVICE_NAME"
    echo "Systemd service restarted: ${SERVICE_NAME}"
  else
    echo "Skipping service restart (missing service file or passwordless sudo unavailable)."
  fi
else
  echo "systemctl not available. Skipping service restart."
fi

echo "ShopSmart deployed at $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
