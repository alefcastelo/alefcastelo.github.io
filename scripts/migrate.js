import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { requireDatabasePath } from './database-path.js'

const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url))

export function migrateDatabase() {
  const path = requireDatabasePath()
  mkdirSync(dirname(path), { recursive: true })
  const sqlite = new Database(path)
  try {
    sqlite.pragma('journal_mode = WAL')
    migrate(drizzle(sqlite), { migrationsFolder })
  } finally {
    sqlite.close()
  }
}

if (import.meta.main) migrateDatabase()
