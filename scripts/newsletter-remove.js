import Database from 'better-sqlite3'
import { requireDatabasePath } from './database-path.js'

const email = process.argv[2]
if (!email) {
  console.error('Usage: npm run newsletter:remove <email>')
  process.exit(1)
}

const sqlite = new Database(requireDatabasePath(), { fileMustExist: true })
const { changes } = sqlite
  .prepare('DELETE FROM newsletter_subscribers WHERE email = ?')
  .run(email.trim().toLowerCase())
sqlite.close()

console.log(changes > 0 ? 'removed' : 'not found')
