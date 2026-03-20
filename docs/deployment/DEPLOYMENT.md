# Deployment Notes

## Local

```bash
./scripts/setup.sh
cd backend && npm run dev
cd frontend && npm run dev
```

For admin APIs, set `ADMIN_KEY` in `backend/.env` and send it as the `x-admin-key` header.

## GitHub Actions CI

The CI workflow runs on:

- `push`
- `pull_request`

It installs dependencies, generates Prisma client, initializes the SQLite schema, runs lint, runs tests, and verifies the frontend build.

## EC2 Deployment Path

The repository includes:

- `.github/workflows/deploy-ec2.yml`
- `scripts/ec2/bootstrap.sh`
- `scripts/ec2/deploy-app.sh`
- `backend/ecosystem.config.cjs`

This deployment flow SSHs into EC2, pulls the latest code, installs backend dependencies, runs Prisma init/seed, and starts or restarts the backend with PM2.
It also builds the frontend and serves it with Nginx on port `80`.

## Required GitHub Secrets

Set these in `Settings -> Secrets and variables -> Actions`:

### EC2 SSH

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `EC2_PORT` (optional, default: `22`)

### Backend Runtime

- `BACKEND_ADMIN_KEY`
- `BACKEND_FRONTEND_URL` (example: `https://your-frontend-domain.com`)
- `EC2_APP_DIR` (optional, default: `/opt/shopsmart`)
- `EC2_APP_NAME` (optional, default: `shopsmart-backend`)
- `BACKEND_PORT` (optional, default: `5001`)

### Frontend Runtime

- `FRONTEND_DOMAIN` (optional, default `_`; use your domain like `vivekbuild.me`)
- `FRONTEND_API_URL` (optional, default `/api`)

## One-Time EC2 Prep

Clone once and run bootstrap once:

```bash
git clone https://github.com/<your-user>/<your-repo>.git /opt/shopsmart
cd /opt/shopsmart
bash scripts/ec2/bootstrap.sh
```

This installs Node.js, npm, PM2, Nginx, and prepares `/opt/shopsmart`.

## What Deployment Does

1. SSHs into EC2.
2. Pulls latest code from your `main` branch.
3. Writes `backend/.env` from GitHub secrets.
4. Runs `npm ci`, `prisma generate`, `db:init`, and `db:seed`.
5. Restarts existing PM2 app or starts it if first deploy.
6. Builds frontend using `VITE_API_URL`.
7. Writes Nginx config to serve `frontend/dist` and proxy `/api/*` to backend.
8. Runs backend health check on `http://127.0.0.1:<BACKEND_PORT>/api/health`.
9. Runs frontend health check on `http://127.0.0.1/`.
