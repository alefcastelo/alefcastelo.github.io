import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      DATABASE_PATH: ':memory:',
      NEWSLETTER_RATE_PER_IP: '1',
      NEWSLETTER_RATE_WINDOW_MINUTES: '10',
    },
  },
})
