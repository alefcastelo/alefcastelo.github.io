/** Environment of the e2e web server. The global setup signs session cookies with the same secret. */
export const E2E_ENV = {
  BASE_URL: 'http://localhost:4398',
  DATABASE_PATH: 'test-results/e2e.db',
  ADMIN_EMAILS: 'admin-reader@example.com',
  BETTER_AUTH_SECRET: 'e2e-secret-that-is-at-least-32-characters',
  GITHUB_CLIENT_ID: 'e2e-github-client-id',
  GITHUB_CLIENT_SECRET: 'e2e-github-client-secret',
  GOOGLE_CLIENT_ID: 'e2e-google-client-id',
  GOOGLE_CLIENT_SECRET: 'e2e-google-client-secret',
  COMMENT_MAX_LENGTH: '280',
  COMMENT_RATE_PER_MINUTE: '1000',
  NEWSLETTER_RATE_PER_IP: '1000',
  NEWSLETTER_RATE_WINDOW_MINUTES: '10',
}

/** Signed-in readers the global setup creates, with the storageState file of each. */
export const READERS = {
  /** Signed in a moment ago, no photo. */
  recent: {
    name: 'Recent Reader',
    image: null,
    renewedDaysAgo: 0,
    storageState: 'test-results/auth/recent.json',
  },
  /** Last renewed two days ago, so the next request renews the session. */
  stale: {
    name: 'Stale Reader',
    image: '/me.jpg',
    renewedDaysAgo: 2,
    storageState: 'test-results/auth/stale.json',
  },
  /** Listed in ADMIN_EMAILS. */
  admin: {
    name: 'Admin Reader',
    image: null,
    renewedDaysAgo: 0,
    storageState: 'test-results/auth/admin.json',
  },
}
