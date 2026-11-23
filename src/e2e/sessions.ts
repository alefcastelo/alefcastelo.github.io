import { createHmac, randomUUID } from 'node:crypto'
import type { BrowserContext } from '@playwright/test'
import Database from 'better-sqlite3'
import { E2E_ENV, READERS } from './env'

const DAY = 24 * 60 * 60 * 1000
const SESSION_DAYS = 30

export type ReaderKey = keyof typeof READERS

export function readerEmail(key: ReaderKey): string {
  return `${key}-reader@example.com`
}

export function openDb() {
  return new Database(E2E_ENV.DATABASE_PATH)
}

/** Stores a session renewed `renewedDaysAgo` days ago and returns its cookie. */
export function insertSession(sqlite: Database.Database, userId: string, renewedDaysAgo: number) {
  const token = randomUUID()
  const renewedAt = Date.now() - renewedDaysAgo * DAY
  const expiresAt = renewedAt + SESSION_DAYS * DAY
  sqlite
    .prepare(
      `INSERT INTO session (id, token, user_id, expires_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(randomUUID(), token, userId, expiresAt, renewedAt, renewedAt)
  return sessionCookie(token, expiresAt)
}

/** Better Auth's signed cookie: `<token>.<base64 HMAC-SHA256 of the token>`, URI-encoded. */
function sessionCookie(token: string, expiresAt: number) {
  const signature = createHmac('sha256', E2E_ENV.BETTER_AUTH_SECRET).update(token).digest('base64')
  return {
    name: 'better-auth.session_token',
    value: encodeURIComponent(`${token}.${signature}`),
    domain: 'localhost',
    path: '/',
    expires: Math.floor(expiresAt / 1000),
    httpOnly: true,
    secure: false,
    sameSite: 'Lax' as const,
  }
}

/** Stores a reader with a verified email and returns their id. */
export function insertUser(
  sqlite: Database.Database,
  user: { name: string; email: string; image: string | null },
): string {
  const id = randomUUID()
  const now = Date.now()
  sqlite
    .prepare(
      `INSERT INTO user (id, name, email, email_verified, image, created_at, updated_at)
       VALUES (?, ?, ?, 1, ?, ?, ?)`,
    )
    .run(id, user.name, user.email, user.image, now, now)
  return id
}

/**
 * Signs the context in as a reader the global setup created, with a session of its own
 * renewed `renewedDaysAgo` days ago.
 */
export async function signInAs(context: BrowserContext, key: ReaderKey, renewedDaysAgo = 0) {
  const sqlite = openDb()
  try {
    const { id } = sqlite
      .prepare('SELECT id FROM user WHERE email = ?')
      .get(readerEmail(key)) as { id: string }
    await context.addCookies([insertSession(sqlite, id, renewedDaysAgo)])
  } finally {
    sqlite.close()
  }
}

/** Signs the context in as a new reader of its own, for tests that delete the account. Returns its id. */
export async function signInAsNewReader(context: BrowserContext, name: string): Promise<string> {
  const sqlite = openDb()
  try {
    const id = insertUser(sqlite, { name, email: `${randomUUID()}@example.com`, image: null })
    await context.addCookies([insertSession(sqlite, id, 0)])
    return id
  } finally {
    sqlite.close()
  }
}

export function userExists(id: string): boolean {
  const sqlite = openDb()
  try {
    return sqlite.prepare('SELECT 1 FROM user WHERE id = ?').get(id) !== undefined
  } finally {
    sqlite.close()
  }
}
