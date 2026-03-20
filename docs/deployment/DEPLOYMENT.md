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
- `backend/Dockerfile`
- `backend/ecosystem.config.cjs`

This deployment flow builds the backend Docker image, pushes it to Amazon ECR, then SSHs to EC2 and runs the container. The backend process is managed by `pm2-runtime` inside the container.

## Required GitHub Secrets

Set these in `Settings -> Secrets and variables -> Actions`:

### AWS + ECR

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN` (optional, only for temporary STS credentials)
- `AWS_REGION` (example: `ap-south-1`)
- `ECR_REPOSITORY` (example: `shopsmart-backend`)

### EC2 SSH

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `EC2_PORT` (optional, default: `22`)

### Backend Runtime

- `BACKEND_ADMIN_KEY`
- `BACKEND_FRONTEND_URL` (example: `https://your-frontend-domain.com`)
- `EC2_APP_DIR` (optional, default: `/opt/shopsmart`)
- `EC2_CONTAINER_NAME` (optional, default: `shopsmart-backend`)

## One-Time EC2 Prep

SSH into the instance and run:

```bash
cd /opt/shopsmart
bash scripts/ec2/bootstrap.sh
```

This installs Docker and AWS CLI and prepares `/opt/shopsmart`.

## What Deployment Does

1. Builds backend image from `backend/Dockerfile`.
2. Ensures the target ECR repository exists.
3. Pushes image to ECR with tags `${GITHUB_SHA}` and `latest`.
4. SSHs into EC2.
5. Logs Docker into ECR on the EC2 host.
6. Pulls latest backend image.
7. Recreates the backend container with:
   - port mapping `5001:5001`
   - persistent SQLite volume at `${EC2_APP_DIR}/data`
   - env file `${EC2_APP_DIR}/backend.env`
8. Runs a backend health check on `http://127.0.0.1:5001/api/health`.
