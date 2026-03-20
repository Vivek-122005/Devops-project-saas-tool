#!/usr/bin/env bash

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/shopsmart}"

install_packages() {
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y "$@"
    return
  fi

  if command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y "$@"
    return
  fi

  if command -v yum >/dev/null 2>&1; then
    sudo yum install -y "$@"
    return
  fi

  echo "Unsupported package manager. Install dependencies manually."
  exit 1
}

sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER":"$USER" "$APP_DIR"

if ! command -v git >/dev/null 2>&1; then
  install_packages git
fi

if ! command -v docker >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1; then
    install_packages docker.io
  else
    install_packages docker
  fi
  sudo systemctl enable docker
  sudo systemctl start docker
fi

if ! command -v aws >/dev/null 2>&1; then
  install_packages awscli
fi

if ! groups "$USER" | grep -q docker; then
  sudo usermod -aG docker "$USER"
  echo "Added $USER to docker group. Re-login is required for group changes."
fi

echo "EC2 host prepared for ShopSmart ECR + PM2 deployment."
