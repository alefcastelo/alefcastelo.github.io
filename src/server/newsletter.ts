import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { config } from '#/server/config'
import { db } from '#/server/db/client'
import { createRateLimiter } from '#/server/rate-limit'
import { clientIp, subscribeEmail } from '#/server/subscribe-email'

const limiter = createRateLimiter({
  limit: config.newsletterRatePerIp,
  windowMs: config.newsletterRateWindowMinutes * 60_000,
})

export const subscribe = createServerFn({ method: 'POST' })
  .validator((data: { email: string }) => ({
    email: typeof data?.email === 'string' ? data.email : '',
  }))
  .handler(({ data }) =>
    subscribeEmail(db, limiter, {
      email: data.email,
      ip: clientIp(getRequestHeader('x-forwarded-for')),
    }),
  )
