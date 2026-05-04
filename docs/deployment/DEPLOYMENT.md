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
It also builds the frontend and serves it directly with PM2 on a frontend port (default `4173`).

## ECS Deployment Path

The repository also includes a full ECS/Fargate deployment path:

- `.github/workflows/deploy-ecs.yml`
- `Dockerfile` at the repository root
- `infrastructure/ecs/`

This path builds one container image that bundles the React frontend into the backend container, pushes it to ECR, and deploys it behind an Application Load Balancer on ECS.
The backend serves the SPA from the same origin, so the frontend keeps calling `/api/*` without a separate frontend service.

### Required GitHub Secrets

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` if you use temporary credentials
- `AWS_REGION`
- `TF_STATE_BUCKET`
- `TF_STATE_DYNAMODB_TABLE`
- `TF_STATE_KEY` optional, defaults to `shopsmart/ecs.tfstate`
- `TF_STATE_REGION` optional if your state bucket lives in a different region

### One-Time Bootstrap

Run the bootstrap stack once to create the Terraform remote state bucket and lock table:

```bash
cd infrastructure/ecs/bootstrap
terraform init
terraform apply -var="region=ap-south-1"
```

Copy the outputs into GitHub secrets, then run the ECS workflow from the `main` branch.

### What the ECS workflow does

1. Initializes Terraform remote state.
2. Creates the ECR repository, ECS cluster, task definition, service, and load balancer.
3. Builds the root Docker image with `VITE_API_URL=/api`.
4. Pushes the image to ECR.
5. Re-applies Terraform with the real image tag and desired count `1`.
6. Waits for ECS stability and smoke-tests `GET /api/health` through the ALB.

## Required GitHub Secrets

Set these in `Settings -> Secrets and variables -> Actions`:

### EC2 SSH

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `EC2_PORT` (optional, default: `22`)

### Backend Runtime

- `BACKEND_ADMIN_KEY`
- `BACKEND_FRONTEND_URL` (optional; if empty or localhost, deploy auto-uses `http://<BACKEND_PUBLIC_HOST>:<FRONTEND_PORT>`)
- `EC2_APP_DIR` (optional, default: `/opt/shopsmart`)
- `EC2_APP_NAME` (optional, default: `shopsmart-backend`)
- `BACKEND_PORT` (optional, default: `5001`)

### Frontend Runtime

- `BACKEND_PUBLIC_HOST` (optional, default: `EC2_HOST`; used to build fallback API URL)
- `FRONTEND_PORT` (optional, default: `4173`)
- `FRONTEND_API_URL` (optional, default: `http://<BACKEND_PUBLIC_HOST>:<BACKEND_PORT>`; deploy auto-normalizes if `/api` is accidentally included)

## One-Time EC2 Prep

Clone once and run bootstrap once:

```bash
git clone https://github.com/<your-user>/<your-repo>.git /opt/shopsmart
cd /opt/shopsmart
bash scripts/ec2/bootstrap.sh
```

This installs Node.js, npm, PM2 (+ `serve`), and prepares `/opt/shopsmart`.

## What Deployment Does

1. SSHs into EC2.
2. Pulls latest code from your `main` branch.
3. Writes `backend/.env` from GitHub secrets.
4. Runs `npm ci`, `prisma generate`, `db:init`, and `db:seed`.
5. Restarts existing PM2 app or starts it if first deploy.
6. Builds frontend using `VITE_API_URL`.
7. Restarts existing PM2 frontend app or starts it if first deploy.
8. Runs backend health check on `http://127.0.0.1:<BACKEND_PORT>/api/health`.
9. Runs frontend health check on `http://127.0.0.1:<FRONTEND_PORT>/`.
