import type { Db } from '#/server/db/client'
import { newsletterSubscribers } from '#/server/db/schema'
import type { RateLimiter } from '#/server/rate-limit'

export type SubscribeResult = 'subscribed' | 'invalid_email' | 'rate_limited'

const MAX_EMAIL_LENGTH = 254
const EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/

export function subscribeEmail(
  db: Db,
  limiter: RateLimiter,
  { email, ip }: { email: string; ip: string },
): SubscribeResult {
  const normalized = email.trim().toLowerCase()
  if (normalized.length > MAX_EMAIL_LENGTH || !EMAIL.test(normalized)) return 'invalid_email'
  if (!limiter.attempt(ip)) return 'rate_limited'
  db.insert(newsletterSubscribers)
    .values({ email: normalized, createdAt: new Date() })
    .onConflictDoNothing({ target: newsletterSubscribers.email })
    .run()
  return 'subscribed'
}

/** Traefik appends the address it received the connection from; earlier values come from the client. */
export function clientIp(forwardedFor: string | undefined): string {
  return forwardedFor?.split(',').at(-1)?.trim() || 'unknown'
}
