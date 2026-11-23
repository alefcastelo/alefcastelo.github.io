import { describe, expect, it } from 'vitest'
import { formatDate } from '#/format-date'

describe('formatDate', () => {
  it('formats a post date as a long US date', () => {
    expect(formatDate(new Date('2026-11-22'))).toBe('November 22, 2026')
  })

  it('formats a timestamp in UTC, whatever the local time zone', () => {
    expect(formatDate(new Date('2026-01-01T00:30:00Z'))).toBe('January 1, 2026')
  })
})
