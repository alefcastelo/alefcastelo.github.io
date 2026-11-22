function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable ${name}`)
  return value
}

function positiveInteger(name: string, fallback: number): number {
  const value = process.env[name]
  if (value === undefined || value === '') return fallback
  const number = Number(value)
  if (!Number.isInteger(number) || number < 1) {
    throw new Error(`Environment variable ${name} must be a positive integer`)
  }
  return number
}

function emailList(name: string): string[] {
  return required(name)
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
}

export const config = {
  baseUrl: required('BASE_URL'),
  databasePath: required('DATABASE_PATH'),
  adminEmails: emailList('ADMIN_EMAILS'),
  betterAuthSecret: required('BETTER_AUTH_SECRET'),
  githubClientId: required('GITHUB_CLIENT_ID'),
  githubClientSecret: required('GITHUB_CLIENT_SECRET'),
  googleClientId: required('GOOGLE_CLIENT_ID'),
  googleClientSecret: required('GOOGLE_CLIENT_SECRET'),
  commentMaxLength: positiveInteger('COMMENT_MAX_LENGTH', 280),
  commentRatePerMinute: positiveInteger('COMMENT_RATE_PER_MINUTE', 2),
  newsletterRatePerIp: positiveInteger('NEWSLETTER_RATE_PER_IP', 1),
  newsletterRateWindowMinutes: positiveInteger('NEWSLETTER_RATE_WINDOW_MINUTES', 10),
}
