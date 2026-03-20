# ShopSmart Socks Platform

ShopSmart is now a full socks ecommerce platform with two user experiences:

- Customer storefront for browsing aesthetic socks, adding to cart, and placing orders
- Admin panel for managing catalog inventory and order status

The stack remains aligned to the Phase 1 DevOps rubric: React frontend, Express backend, Prisma + SQLite data layer, CI, lint checks, testing, and architecture documentation.

## What Changed

The previous generic SaaS template has been replaced with a domain-specific ShopSmart implementation. The platform now includes:

- Customer-focused ecommerce storefront for socks
- Admin panel with protected CRUD APIs (`x-admin-key`)
- Order placement workflow and admin order tracking
- Full REST API for product catalog and orders
- Prisma ORM with SQLite storage and idempotent DB bootstrap
- Unit tests and integration tests
- Playwright E2E flow (bonus rubric item)
- GitHub Actions CI on `push` and `pull_request`
- PR lint enforcement, Dependabot config, and idempotent setup/deploy scripts
- EC2 full-stack auto-deploy using GitHub Actions + SSH + PM2 + Nginx

## Tech Stack

- Frontend: React, Vite, CSS
- Backend: Node.js, Express, Prisma
- Database: SQLite
- Testing: Vitest, Jest, Supertest
- DevOps: GitHub Actions, Dependabot, EC2 scripts, PM2, Nginx

## Project Structure

```text
.
├── backend
│   ├── prisma
│   ├── src
│   └── tests
├── frontend
│   └── src
├── docs
├── scripts
├── infrastructure
└── .github
```

## Local Setup

### 1. Install dependencies and seed the database

```bash
./scripts/setup.sh
```

### 2. Start the backend

```bash
cd backend
npm run dev
```

### 3. Start the frontend

```bash
cd frontend
npm run dev
```

### 4. Open the app

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5001/api/health`
- Store products API: `http://localhost:5001/api/products?scope=store`
- Orders API: `http://localhost:5001/api/orders`
- Admin APIs: `http://localhost:5001/api/admin/*` (requires `x-admin-key`)

## Testing and Linting

Backend:

```bash
cd backend
npm run lint
npm test
```

Frontend:

```bash
cd frontend
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

## Rubric Coverage

- Commit regularity: workflow-ready repository and clean project structure
- GitHub workflows / CI: [`.github/workflows/ci.yml`](/Users/vivekvishnoi/Devops/Devops-project-saas-tool/.github/workflows/ci.yml)
- Frontend implementation: responsive React UI with API integration
- Unit testing: backend validation tests and frontend component test
- Integration testing: API + SQLite database tests with Supertest
- E2E bonus: Playwright user-flow test (`frontend/e2e/shop-flow.e2e.js`)
- PR checks / linting: ESLint runs in CI on PRs
- Dependabot: [`.github/dependabot.yml`](/Users/vivekvishnoi/Devops/Devops-project-saas-tool/.github/dependabot.yml)
- EC2 + GitHub integration: [`.github/workflows/deploy-ec2.yml`](/Users/vivekvishnoi/Devops/Devops-project-saas-tool/.github/workflows/deploy-ec2.yml)
- Idempotent scripts: [`scripts/setup.sh`](/Users/vivekvishnoi/Devops/Devops-project-saas-tool/scripts/setup.sh), [`scripts/ec2/bootstrap.sh`](/Users/vivekvishnoi/Devops/Devops-project-saas-tool/scripts/ec2/bootstrap.sh), [`scripts/ec2/deploy-app.sh`](/Users/vivekvishnoi/Devops/Devops-project-saas-tool/scripts/ec2/deploy-app.sh)
- Explanation: docs in [`docs/architecture/ARCHITECTURE.md`](/Users/vivekvishnoi/Devops/Devops-project-saas-tool/docs/architecture/ARCHITECTURE.md) and [`docs/deployment/DEPLOYMENT.md`](/Users/vivekvishnoi/Devops/Devops-project-saas-tool/docs/deployment/DEPLOYMENT.md)

## Notes

- Commit regularity is evaluated from your Git history over time, so keep using small logical commits during active development.
- The EC2 deployment workflow uses SSH + PM2 + Nginx and needs GitHub Actions secrets (`EC2_*`, backend runtime secrets, and optional frontend runtime secrets).
- The repo keeps the `frontend/` and `backend/` layout so it stays easy for evaluators to review.
- SQLite initialization is handled by an idempotent bootstrap script so the project can start consistently without a separate database server.
- Local admin key default: `socks-admin-123` (set via `ADMIN_KEY` in backend env).
