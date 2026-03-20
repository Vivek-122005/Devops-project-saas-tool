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

To make the EC2 deployment fully live, set these GitHub repository secrets:

- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`
- `EC2_PORT`
- `EC2_APP_DIR`
- `EC2_SERVICE_NAME` (optional, defaults to `shopsmart`)

The workflow SSHs into the EC2 server and runs the idempotent deployment script. That script clones the repo if needed, pulls the target ref, installs dependencies, builds the frontend, initializes the SQLite database, and then runs service commands (`systemctl enable/restart`) for the backend.
