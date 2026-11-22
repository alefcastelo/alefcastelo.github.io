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

/** Readers the global setup creates. Only `recent` has a storageState signed in a moment ago. */
export const READERS = {
  /** No photo. */
  recent: {
    name: 'Recent Reader',
    image: null,
    storageState: 'test-results/auth/recent.json',
  },
  stale: {
    name: 'Stale Reader',
    image: '/me.jpg',
  },
  /** Listed in ADMIN_EMAILS. */
  admin: {
    name: 'Admin Reader',
    image: null,
  },
}
