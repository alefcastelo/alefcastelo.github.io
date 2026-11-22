import { afterEach, describe, expect, it, vi } from 'vitest'
import { listPosts } from '#/posts'
import { deleteViewerAccount } from '#/server/account-store'
import { createAuth, handleAuthRequest, type Auth } from '#/server/auth'
import { createPostComment } from '#/server/comment-store'
import { account, comments, session, user } from '#/server/db/schema'
import { createTestDb } from '#/server/db/test-db'
import { findViewer } from '#/server/viewer'

const BASE_URL = 'http://localhost:3000'
const POST_URL = '/posts/some-post'

type Profile = { email: string; verified: boolean; name?: string; image?: string }

/** Stands in for GitHub and Google: each provider answers with the profile set for it. */
function fakeProviders(profiles: { github?: Profile; google?: Profile }) {
  const json = (body: unknown) =>
    new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } })
  const unsignedJwt = (claims: object) =>
    [{ alg: 'none' }, claims].map((part) => Buffer.from(JSON.stringify(part)).toString('base64url')).join('.') + '.'

  return vi.fn(async (input: string | URL | Request) => {
    const url = String(input instanceof Request ? input.url : input)
    const { github, google } = profiles
    if (url.startsWith('https://github.com/login/oauth/access_token')) {
      return json({ access_token: 'github-token', token_type: 'bearer', scope: 'read:user,user:email' })
    }
    if (url === 'https://api.github.com/user' && github) {
      return json({ id: 1001, login: 'reader', name: github.name ?? 'GitHub Reader', email: github.email, avatar_url: github.image ?? 'https://example.com/github.png' })
    }
    if (url === 'https://api.github.com/user/emails' && github) {
      return json([{ email: github.email, primary: true, verified: github.verified }])
    }
    if (url.startsWith('https://oauth2.googleapis.com/token') && google) {
      return json({
        access_token: 'google-token',
        token_type: 'Bearer',
        expires_in: 3600,
        id_token: unsignedJwt({
          sub: '2002',
          email: google.email,
          email_verified: google.verified,
          name: google.name ?? 'Google Reader',
          picture: google.image ?? 'https://example.com/google.png',
        }),
      })
    }
    throw new Error(`Unexpected fetch to ${url}`)
  })
}

function cookieHeader(response: Response): string {
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(';')[0])
    .join('; ')
}

function authRequest(auth: Auth, method: string, path: string, init: { body?: unknown; cookie?: string } = {}) {
  const headers = new Headers({
    origin: BASE_URL,
    'user-agent': 'Mozilla/5.0 Test Browser',
    'x-forwarded-for': '203.0.113.7',
  })
  if (init.body) headers.set('content-type', 'application/json')
  if (init.cookie) headers.set('cookie', init.cookie)
  return handleAuthRequest(
    auth,
    new Request(`${BASE_URL}/api/auth${path}`, {
      method,
      headers,
      body: init.body ? JSON.stringify(init.body) : undefined,
    }),
  )
}

async function startSignIn(auth: Auth, provider: 'github' | 'google') {
  const response = await authRequest(auth, 'POST', '/sign-in/social', {
    body: { provider, callbackURL: POST_URL, errorCallbackURL: POST_URL },
  })
  const { url } = (await response.json()) as { url: string }
  return { url: new URL(url), cookie: cookieHeader(response) }
}

/** Runs the whole OAuth round trip and returns the callback response. */
async function signIn(auth: Auth, provider: 'github' | 'google') {
  const { url, cookie } = await startSignIn(auth, provider)
  const state = url.searchParams.get('state')
  return authRequest(auth, 'GET', `/callback/${provider}?code=test-code&state=${state}`, { cookie })
}

function setup() {
  const db = createTestDb()
  return { db, auth: createAuth(db) }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('sign-in/social', () => {
  it.each(['github', 'google'] as const)(
    'returns the %s authorization URL with the callback under BASE_URL',
    async (provider) => {
      const { auth } = setup()
      const { url } = await startSignIn(auth, provider)
      expect(url.origin).toBe(
        provider === 'github' ? 'https://github.com' : 'https://accounts.google.com',
      )
      expect(url.searchParams.get('redirect_uri')).toBe(`${BASE_URL}/api/auth/callback/${provider}`)
    },
  )
})

describe('the /api/auth allowlist', () => {
  it.each([
    ['POST', '/update-user'],
    ['GET', '/get-session'],
    ['GET', '/list-accounts'],
    ['POST', '/delete-user'],
    ['POST', '/sign-in/email'],
    ['POST', '/sign-up/email'],
    ['GET', '/sign-in/social'],
    ['GET', '/sign-out'],
    ['GET', '/callback/github/extra'],
  ])('answers %s %s with 404', async (method, path) => {
    const { auth } = setup()
    const response = await authRequest(auth, method, path, method === 'POST' ? { body: {} } : {})
    expect(response.status).toBe(404)
  })

  it('forwards an allowed path to Better Auth', async () => {
    const { auth } = setup()
    const response = await authRequest(auth, 'GET', '/error')
    expect(response.status).toBe(200)
  })
})

describe('OAuth callback', () => {
  it('signs a GitHub reader in and returns to the post', async () => {
    const { db, auth } = setup()
    vi.stubGlobal('fetch', fakeProviders({ github: { email: 'reader@example.com', verified: true } }))
    const response = await signIn(auth, 'github')
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(POST_URL)
    expect(db.select().from(user).all()).toHaveLength(1)
  })

  it('links a Google sign-in to the account created through GitHub with the same email', async () => {
    const { db, auth } = setup()
    vi.stubGlobal(
      'fetch',
      fakeProviders({
        github: { email: 'reader@example.com', verified: true },
        google: { email: 'Reader@Example.com', verified: true },
      }),
    )
    await signIn(auth, 'github')
    const response = await signIn(auth, 'google')
    expect(response.headers.get('location')).toBe(POST_URL)

    const users = db.select().from(user).all()
    expect(users).toHaveLength(1)
    const accounts = db.select().from(account).all()
    expect(accounts.map((row) => row.providerId).sort()).toEqual(['github', 'google'])
    expect(accounts.every((row) => row.userId === users[0].id)).toBe(true)
  })

  it('refuses to create an account whose email the provider has not verified', async () => {
    const { db, auth } = setup()
    vi.stubGlobal('fetch', fakeProviders({ github: { email: 'reader@example.com', verified: false } }))
    const response = await signIn(auth, 'github')
    const location = new URL(response.headers.get('location') ?? '', BASE_URL)
    expect(location.pathname).toBe(POST_URL)
    expect(location.searchParams.get('error')).toBe('unable_to_create_user')
    expect(db.select().from(user).all()).toHaveLength(0)
    expect(db.select().from(session).all()).toHaveLength(0)
  })

  it('stores the session without the IP address and the user agent', async () => {
    const { db, auth } = setup()
    vi.stubGlobal('fetch', fakeProviders({ github: { email: 'reader@example.com', verified: true } }))
    await signIn(auth, 'github')
    const sessions = db.select().from(session).all()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].ipAddress).toBeNull()
    expect(sessions[0].userAgent).toBeNull()
  })
})

describe('findViewer', () => {
  async function signedInHeaders(auth: Auth) {
    vi.stubGlobal(
      'fetch',
      fakeProviders({
        github: { email: 'reader@example.com', verified: true, name: 'Ada', image: 'https://example.com/ada.png' },
      }),
    )
    const response = await signIn(auth, 'github')
    return new Headers({ cookie: cookieHeader(response) })
  }

  it('returns null without a session', async () => {
    const { auth } = setup()
    expect(await findViewer(auth, new Headers(), [])).toBeNull()
  })

  it('returns the id, name, image and admin flag, never the email', async () => {
    const { db, auth } = setup()
    const headers = await signedInHeaders(auth)
    const viewer = await findViewer(auth, headers, ['other@example.com'])
    const [row] = db.select().from(user).all()
    expect(viewer).toEqual({ id: row.id, name: 'Ada', image: 'https://example.com/ada.png', isAdmin: false })
    expect(JSON.stringify(viewer)).not.toContain('reader@example.com')
  })

  it('compares the admin emails case-insensitively', async () => {
    const { auth } = setup()
    const headers = await signedInHeaders(auth)
    const viewer = await findViewer(auth, headers, ['other@example.com', 'READER@Example.COM'])
    expect(viewer?.isAdmin).toBe(true)
  })
})

describe('deleteViewerAccount', () => {
  it('refuses a reader without a session', async () => {
    const { db, auth } = setup()
    expect(await deleteViewerAccount(db, auth, new Headers())).toBe('unauthenticated')
  })

  it('deletes the account, and a new sign-in with the same provider starts a new one without history', async () => {
    const { db, auth } = setup()
    vi.stubGlobal('fetch', fakeProviders({ github: { email: 'reader@example.com', verified: true } }))
    const headers = new Headers({ cookie: cookieHeader(await signIn(auth, 'github')) })
    const viewer = (await findViewer(auth, headers, []))!
    const slug = listPosts()[0].slug
    const limits = { maxLength: 280, ratePerMinute: 100 }
    expect(createPostComment(db, viewer, limits, { slug, body: 'hello' })).toBe('created')

    expect(await deleteViewerAccount(db, auth, headers)).toBe('deleted')
    expect(db.select().from(user).all()).toHaveLength(0)
    expect(db.select().from(session).all()).toHaveLength(0)
    expect(db.select().from(account).all()).toHaveLength(0)
    expect(db.select().from(comments).all()).toHaveLength(0)
    expect(await findViewer(auth, headers, []), 'the old cookie no longer signs in').toBeNull()

    const again = new Headers({ cookie: cookieHeader(await signIn(auth, 'github')) })
    const newViewer = await findViewer(auth, again, [])
    expect(newViewer?.id).toBeDefined()
    expect(newViewer?.id).not.toBe(viewer.id)
    expect(db.select().from(comments).all()).toHaveLength(0)
  })
})
