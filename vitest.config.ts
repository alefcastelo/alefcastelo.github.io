import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  resolve: {
    alias: [{ find: /^#\/(.*)$/, replacement: `${srcDir}/$1` }],
  },
  test: {
    environment: 'node',
    env: {
      DATABASE_PATH: ':memory:',
      NEWSLETTER_RATE_PER_IP: '1',
      NEWSLETTER_RATE_WINDOW_MINUTES: '10',
    },
  },
})
