import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { READERS } from './env'
import { insertSession, openDb, readerEmail, type ReaderKey } from './sessions'

/** Runs after the web server migrated test-results/e2e.db: stores each reader and its storageState. */
export default function globalSetup() {
  const sqlite = openDb()
  try {
    const now = Date.now()
    for (const [key, reader] of Object.entries(READERS)) {
      const userId = randomUUID()
      sqlite
        .prepare(
          `INSERT INTO user (id, name, email, email_verified, image, created_at, updated_at)
           VALUES (?, ?, ?, 1, ?, ?, ?)`,
        )
        .run(userId, reader.name, readerEmail(key as ReaderKey), reader.image, now, now)
      const cookie = insertSession(sqlite, userId, reader.renewedDaysAgo)

      mkdirSync(dirname(reader.storageState), { recursive: true })
      writeFileSync(reader.storageState, JSON.stringify({ cookies: [cookie], origins: [] }))
    }
  } finally {
    sqlite.close()
  }
}
