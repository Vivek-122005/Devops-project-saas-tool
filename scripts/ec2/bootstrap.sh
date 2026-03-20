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

ensure_nodejs() {
  if command -v node >/dev/null 2>&1; then
    return
  fi

  if ! command -v curl >/dev/null 2>&1; then
    install_packages curl
  fi

  if command -v apt-get >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  else
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  fi

  install_packages nodejs
}

ensure_swap() {
  if command -v swapon >/dev/null 2>&1 && swapon --show | grep -q '/swapfile'; then
    return
  fi

  if [ -f /swapfile ]; then
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile >/dev/null 2>&1 || true
    sudo swapon /swapfile >/dev/null 2>&1 || true
  else
    if command -v fallocate >/dev/null 2>&1; then
      sudo fallocate -l 2G /swapfile
    else
      sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    fi
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
  fi

  if ! grep -q '^/swapfile ' /etc/fstab; then
    echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab >/dev/null
  fi
}

sudo mkdir -p "$APP_DIR"
sudo chown "$USER":"$USER" "$APP_DIR"

if ! command -v git >/dev/null 2>&1; then
  install_packages git
fi

ensure_nodejs

if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi

ensure_swap

if ! command -v nginx >/dev/null 2>&1; then
  install_packages nginx
fi

if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl enable nginx
  sudo systemctl start nginx
fi

echo "EC2 host prepared for ShopSmart full-stack deployment (PM2 + Nginx)."
