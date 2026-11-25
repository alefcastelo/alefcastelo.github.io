import days from 'virtual:github-contributions'

const PROFILE_URL = 'https://github.com/alefcastelo'
const DAY_MS = 86_400_000
/** Dust brightness, from the void to ivory, for GitHub's levels 0 to 4. */
const LEVEL_FILL = ['bg-well', 'bg-ash', 'bg-muted', 'bg-text', 'bg-ivory']

/** The last year of GitHub contributions: one column per week, Sunday on top. */
export function ContributionGraph() {
  if (days.length === 0) return null
  const total = days.reduce((sum, day) => sum + day.count, 0)
  const firstSunday = toTime(days[0].date) - weekday(days[0].date) * DAY_MS
  const weeks = Math.floor((toTime(days[days.length - 1].date) - firstSunday) / DAY_MS / 7) + 1
  const summary = `${total.toLocaleString('en-US')} contributions in the last year`
  return (
    <section aria-label="GitHub contributions" className="max-w-[860px]">
      <a
        href={PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-pixel text-[22px] leading-none text-muted hover:text-amber"
      >
        {summary}
      </a>
      <div
        role="img"
        aria-label={`${summary} on GitHub`}
        className="mt-4 grid grid-rows-7 gap-[2px] sm:gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}
      >
        {days.map((day) => (
          <span
            key={day.date}
            title={`${day.count} contributions on ${day.date}`}
            className={`aspect-square ${LEVEL_FILL[day.level] ?? LEVEL_FILL[0]}`}
            style={{
              gridRow: weekday(day.date) + 1,
              gridColumn: Math.floor((toTime(day.date) - firstSunday) / DAY_MS / 7) + 1,
            }}
          />
        ))}
      </div>
    </section>
  )
}

function toTime(date: string): number {
  return Date.parse(`${date}T00:00:00Z`)
}

function weekday(date: string): number {
  return new Date(toTime(date)).getUTCDay()
}
