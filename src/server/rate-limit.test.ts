import { describe, expect, it } from 'vitest'
import { createRateLimiter } from '#/server/rate-limit'

describe('createRateLimiter', () => {
  it('allows up to the limit per key within the window', () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: () => 0 })
    expect(limiter.attempt('a')).toBe(true)
    expect(limiter.attempt('a')).toBe(true)
    expect(limiter.attempt('a')).toBe(false)
    expect(limiter.attempt('b')).toBe(true)
  })

  it('allows again once the oldest attempt leaves the sliding window', () => {
    let time = 0
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: () => time })
    expect(limiter.attempt('a')).toBe(true)
    time = 999
    expect(limiter.attempt('a')).toBe(false)
    time = 1000
    expect(limiter.attempt('a')).toBe(true)
  })
})
