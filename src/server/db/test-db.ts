import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { createDb, type Db } from '#/server/db/client'
import { comments, user } from '#/server/db/schema'
import type { Viewer } from '#/server/viewer'

const migrationsFolder = fileURLToPath(new URL('../../../drizzle', import.meta.url))

export function createTestDb() {
  const db = createDb(new Database(':memory:'))
  migrate(db, { migrationsFolder })
  return db
}

/** A test database, and `reader(name)` to store a reader in it and get them as a viewer. */
export function createTestDbWithReaders() {
  const db = createTestDb()
  const reader = (name: string, isAdmin = false): Viewer => {
    const id = crypto.randomUUID()
    const image = `https://example.com/${name}.png`
    db.insert(user)
      .values({ id, name, email: `${name}@example.com`, emailVerified: true, image })
      .run()
    return { id, name, image, isAdmin }
  }
  return { db, reader }
}

/** The id of the comment whose stored text is `body`. */
export function commentIdOf(db: Db, body: string) {
  return db.select().from(comments).all().find((row) => row.body === body)!.id
}
