import { describe, expect, it } from 'vitest'
import { newsletterSubscribers } from '#/server/db/schema'
import { createTestDb } from '#/server/db/test-db'
import { clientIp, subscribeEmail } from '#/server/subscribe-email'
import { createRateLimiter } from '#/server/rate-limit'

function setup({ limit = 10, now = (): number => 0 } = {}) {
  const db = createTestDb()
  const limiter = createRateLimiter({ limit, windowMs: 10 * 60_000, now })
  const emails = () => db.select().from(newsletterSubscribers).all().map((row) => row.email)
  return { db, limiter, emails }
}

describe('subscribeEmail', () => {
  it('stores a valid email in lowercase', () => {
    const { db, limiter, emails } = setup()
    expect(subscribeEmail(db, limiter, { email: ' Reader@Example.COM ', ip: '1.1.1.1' })).toBe(
      'subscribed',
    )
    expect(emails()).toEqual(['reader@example.com'])
  })

  it('answers a repeated email the same way without a duplicate', () => {
    const { db, limiter, emails } = setup()
    subscribeEmail(db, limiter, { email: 'reader@example.com', ip: '1.1.1.1' })
    expect(subscribeEmail(db, limiter, { email: 'READER@example.com', ip: '1.1.1.1' })).toBe(
      'subscribed',
    )
    expect(emails()).toEqual(['reader@example.com'])
  })

  it('refuses an invalid email without counting it against the limit', () => {
    const { db, limiter, emails } = setup({ limit: 1 })
    expect(subscribeEmail(db, limiter, { email: 'not-an-email', ip: '1.1.1.1' })).toBe(
      'invalid_email',
    )
    expect(subscribeEmail(db, limiter, { email: 'reader@example.com', ip: '1.1.1.1' })).toBe(
      'subscribed',
    )
    expect(emails()).toEqual(['reader@example.com'])
  })

  it('refuses an IP over the limit, counting a repeated email too', () => {
    const { db, limiter, emails } = setup({ limit: 2 })
    subscribeEmail(db, limiter, { email: 'reader@example.com', ip: '1.1.1.1' })
    subscribeEmail(db, limiter, { email: 'reader@example.com', ip: '1.1.1.1' })
    expect(subscribeEmail(db, limiter, { email: 'other@example.com', ip: '1.1.1.1' })).toBe(
      'rate_limited',
    )
    expect(subscribeEmail(db, limiter, { email: 'other@example.com', ip: '2.2.2.2' })).toBe(
      'subscribed',
    )
    expect(emails().sort()).toEqual(['other@example.com', 'reader@example.com'])
  })

  it('accepts the IP again once the window expires', () => {
    let time = 0
    const { db, limiter, emails } = setup({ limit: 1, now: () => time })
    subscribeEmail(db, limiter, { email: 'reader@example.com', ip: '1.1.1.1' })
    time = 10 * 60_000 - 1
    expect(subscribeEmail(db, limiter, { email: 'other@example.com', ip: '1.1.1.1' })).toBe(
      'rate_limited',
    )
    time = 10 * 60_000
    expect(subscribeEmail(db, limiter, { email: 'other@example.com', ip: '1.1.1.1' })).toBe(
      'subscribed',
    )
    expect(emails().sort()).toEqual(['other@example.com', 'reader@example.com'])
  })
})

describe('clientIp', () => {
  it('takes the last X-Forwarded-For value, the one the proxy appended', () => {
    expect(clientIp('6.6.6.6, 10.0.0.1, 203.0.113.7')).toBe('203.0.113.7')
    expect(clientIp('203.0.113.7')).toBe('203.0.113.7')
  })

  it('falls back to "unknown" without the header', () => {
    expect(clientIp(undefined)).toBe('unknown')
    expect(clientIp('')).toBe('unknown')
  })
})
