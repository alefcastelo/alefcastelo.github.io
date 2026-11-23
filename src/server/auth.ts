import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { config } from '#/server/config'
import { db, type Db } from '#/server/db/client'
import * as schema from '#/server/db/schema'

const DAY = 60 * 60 * 24

export function createAuth(db: Db) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: 'sqlite', schema }),
    baseURL: config.baseUrl,
    secret: config.betterAuthSecret,
    socialProviders: {
      github: {
        clientId: config.githubClientId,
        clientSecret: config.githubClientSecret,
        overrideUserInfoOnSignIn: true,
      },
      google: {
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
        overrideUserInfoOnSignIn: true,
        disableIdTokenSignIn: true,
      },
    },
    // No trustedProviders: a provider links to an existing account only when it verified the email.
    account: { accountLinking: { enabled: true } },
    session: { expiresIn: 30 * DAY, updateAge: DAY },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => (user.emailVerified ? { data: user } : false),
        },
      },
      session: {
        create: {
          before: async (session) => ({
            data: { ...session, ipAddress: null, userAgent: null },
          }),
        },
      },
    },
    // Must stay the last plugin: it forwards the cookies of server-side auth.api calls.
    plugins: [tanstackStartCookies()],
  })
}

export type Auth = ReturnType<typeof createAuth>

export const auth = createAuth(db)

/** The only /api/auth endpoints the browser may reach; every other one answers 404. */
const ALLOWED = [
  { method: 'POST', path: /^\/sign-in\/social$/ },
  { method: 'GET', path: /^\/callback\/[^/]+$/ },
  { method: 'POST', path: /^\/sign-out$/ },
  { method: 'GET', path: /^\/error$/ },
]

export function handleAuthRequest(auth: Auth, request: Request): Promise<Response> | Response {
  const path = new URL(request.url).pathname.replace(/^\/api\/auth/, '')
  const allowed = ALLOWED.some((route) => route.method === request.method && route.path.test(path))
  return allowed ? auth.handler(request) : new Response('Not Found', { status: 404 })
}
