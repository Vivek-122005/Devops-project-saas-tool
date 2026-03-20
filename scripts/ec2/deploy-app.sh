#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/shopsmart}"

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

echo "ShopSmart deployed at $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
