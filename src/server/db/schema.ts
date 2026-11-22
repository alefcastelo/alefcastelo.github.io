import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const newsletterSubscribers = sqliteTable('newsletter_subscribers', {
  email: text('email').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})
