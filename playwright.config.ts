import { defineConfig, devices } from '@playwright/test'
import { E2E_ENV } from './src/e2e/env'

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  globalSetup: './src/e2e/global-setup.ts',
  fullyParallel: true,
  reporter: 'line',
  retries: 2,
  expect: { timeout: 15000 },
  use: { baseURL: E2E_ENV.BASE_URL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node scripts/migrate.js && vite dev --port 4398 --strictPort',
    url: E2E_ENV.BASE_URL,
    reuseExistingServer: false,
    timeout: 60000,
    env: E2E_ENV,
  },
})
