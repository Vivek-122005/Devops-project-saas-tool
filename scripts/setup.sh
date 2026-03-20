#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Preparing ShopSmart locally..."

mkdir -p "$ROOT_DIR/backend/prisma"

if [ ! -f "$ROOT_DIR/.env" ]; then
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  echo "Created root .env from .env.example"
fi

if [ ! -f "$ROOT_DIR/backend/.env" ]; then
  cp "$ROOT_DIR/backend/.env.example" "$ROOT_DIR/backend/.env"
  echo "Created backend .env from backend/.env.example"
fi

if [ ! -f "$ROOT_DIR/frontend/.env" ]; then
  cp "$ROOT_DIR/frontend/.env.example" "$ROOT_DIR/frontend/.env"
  echo "Created frontend .env from frontend/.env.example"
fi

cd "$ROOT_DIR/backend"
npm install
npx prisma generate
npm run db:init
npm run db:seed

cd "$ROOT_DIR/frontend"
npm install

echo "ShopSmart setup complete."
