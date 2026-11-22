import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { READERS } from './env'
import { insertSession, insertUser, openDb, readerEmail, type ReaderKey } from './sessions'

/** Runs after the web server migrated test-results/e2e.db: stores each reader, and the storageState of `recent`. */
export default function globalSetup() {
  const sqlite = openDb()
  try {
    for (const [key, reader] of Object.entries(READERS)) {
      const userId = insertUser(sqlite, { ...reader, email: readerEmail(key as ReaderKey) })
      if (!('storageState' in reader)) continue
      const cookie = insertSession(sqlite, userId, 0)
      mkdirSync(dirname(reader.storageState), { recursive: true })
      writeFileSync(reader.storageState, JSON.stringify({ cookies: [cookie], origins: [] }))
    }
  } finally {
    sqlite.close()
  }
}
