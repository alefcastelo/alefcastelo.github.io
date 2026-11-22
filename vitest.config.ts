import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      BASE_URL: 'http://localhost:3000',
      DATABASE_PATH: ':memory:',
      ADMIN_EMAILS: 'admin@example.com',
      BETTER_AUTH_SECRET: 'test-secret-that-is-at-least-32-characters',
      GITHUB_CLIENT_ID: 'test-github-client-id',
      GITHUB_CLIENT_SECRET: 'test-github-client-secret',
      GOOGLE_CLIENT_ID: 'test-google-client-id',
      GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
      COMMENT_MAX_LENGTH: '280',
      COMMENT_RATE_PER_MINUTE: '2',
      NEWSLETTER_RATE_PER_IP: '1',
      NEWSLETTER_RATE_WINDOW_MINUTES: '10',
    },
  },
})
