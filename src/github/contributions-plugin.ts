import type { Plugin } from 'vite'
import type { ContributionDay } from '#/github/contributions'

const USER = 'alefcastelo'
const MODULE_ID = 'virtual:github-contributions'
const RESOLVED_ID = `\0${MODULE_ID}`

const DAY_CELL = /<td\b[^>]*\bdata-date="([\d-]+)"[^>]*>/g
const TOOLTIP = /<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>(\d+|No) contributions?/g

/**
 * Serves the last year of GitHub contributions as `virtual:github-contributions`.
 * The browser can't fetch them (GitHub sends no CORS headers), so they are read
 * once per build and baked into the static pages.
 */
export function githubContributions(): Plugin {
  let isBuild = false
  return {
    name: 'github-contributions',
    configResolved(config) {
      isBuild = config.command === 'build'
    },
    resolveId(id) {
      return id === MODULE_ID ? RESOLVED_ID : undefined
    },
    async load(id) {
      if (id !== RESOLVED_ID) return undefined
      let days: Array<ContributionDay> = []
      try {
        days = await fetchContributions()
      } catch (error) {
        // A build never publishes an empty graph; the dev server keeps working offline.
        if (isBuild) throw error
        this.warn(`GitHub contributions unavailable: ${(error as Error).message}`)
      }
      return `export default ${JSON.stringify(days)}`
    },
  }
}

async function fetchContributions(): Promise<Array<ContributionDay>> {
  const response = await fetch(`https://github.com/users/${USER}/contributions`)
  if (!response.ok) throw new Error(`GitHub answered ${response.status}`)
  const days = parseContributions(await response.text())
  if (days.length === 0) throw new Error('no contribution days found in the page')
  return days
}

function parseContributions(html: string): Array<ContributionDay> {
  const counts = new Map<string, number>()
  for (const [, cellId, count] of html.matchAll(TOOLTIP)) {
    counts.set(cellId, count === 'No' ? 0 : Number(count))
  }
  const days: Array<ContributionDay> = []
  for (const [cell, date] of html.matchAll(DAY_CELL)) {
    const cellId = /\bid="([^"]+)"/.exec(cell)?.[1]
    const level = Number(/\bdata-level="(\d)"/.exec(cell)?.[1] ?? 0)
    days.push({ date, level, count: (cellId && counts.get(cellId)) || 0 })
  }
  return days.sort((left, right) => left.date.localeCompare(right.date))
}
