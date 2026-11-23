export function requireDatabasePath() {
  const path = process.env.DATABASE_PATH
  if (!path) throw new Error('Missing required environment variable DATABASE_PATH')
  return path
}
