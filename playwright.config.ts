import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  reporter: 'line',
  retries: 2,
  expect: { timeout: 15000 },
  use: { baseURL: 'http://localhost:4398', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node scripts/migrate.js && vite dev --port 4398 --strictPort',
    url: 'http://localhost:4398',
    reuseExistingServer: false,
    timeout: 60000,
    env: {
      DATABASE_PATH: 'test-results/e2e.db',
      NEWSLETTER_RATE_PER_IP: '1000',
      NEWSLETTER_RATE_WINDOW_MINUTES: '10',
    },
  },
})
