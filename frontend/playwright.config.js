import { defineConfig } from '@playwright/test';

const frontendPort = Number(process.env.E2E_FRONTEND_PORT || 4173);
const backendPort = Number(process.env.E2E_BACKEND_PORT || 5001);
const databaseUrl = process.env.E2E_DATABASE_URL || 'file:./e2e.db';
const isCI = Boolean(process.env.CI);
const backendEnv = [
  `BACKEND_PORT=${backendPort}`,
  `FRONTEND_URL=http://127.0.0.1:${frontendPort}`,
  `DATABASE_URL=${databaseUrl}`
].join(' ');

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.js',
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${frontendPort}`,
    trace: 'on-first-retry'
  },
  webServer: [
    {
      command: [
        'cd ../backend',
        `${backendEnv} npm run db:init`,
        `${backendEnv} npm run db:seed`,
        `${backendEnv} npm run start`
      ].join(' && '),
      url: `http://127.0.0.1:${backendPort}/api/health`,
      timeout: 120_000,
      reuseExistingServer: !isCI
    },
    {
      command: `VITE_API_URL=http://127.0.0.1:${backendPort} npm run dev -- --host 127.0.0.1 --port ${frontendPort}`,
      url: `http://127.0.0.1:${frontendPort}`,
      timeout: 120_000,
      reuseExistingServer: !isCI
    }
  ]
});
