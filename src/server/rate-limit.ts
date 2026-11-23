export type RateLimiter = {
  /** Records an attempt for `key` and tells whether it is within the limit. */
  attempt(key: string): boolean
}

export function createRateLimiter(options: {
  limit: number
  windowMs: number
  now?: () => number
}): RateLimiter {
  const { limit, windowMs, now = Date.now } = options
  const attempts = new Map<string, Array<number>>()
  return {
    attempt(key) {
      const time = now()
      const recent = (attempts.get(key) ?? []).filter((at) => at > time - windowMs)
      const allowed = recent.length < limit
      if (allowed) recent.push(time)
      if (recent.length > 0) attempts.set(key, recent)
      else attempts.delete(key)
      return allowed
    },
  }
}
