import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { createDb } from '#/server/db/client'

const migrationsFolder = fileURLToPath(new URL('../../../drizzle', import.meta.url))

export function createTestDb() {
  const db = createDb(new Database(':memory:'))
  migrate(db, { migrationsFolder })
  return db
}
