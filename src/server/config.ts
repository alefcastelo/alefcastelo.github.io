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

export const config = {
  databasePath: required('DATABASE_PATH'),
  newsletterRatePerIp: positiveInteger('NEWSLETTER_RATE_PER_IP', 1),
  newsletterRateWindowMinutes: positiveInteger('NEWSLETTER_RATE_WINDOW_MINUTES', 10),
}
