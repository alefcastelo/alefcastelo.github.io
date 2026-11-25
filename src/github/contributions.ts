export type ContributionDay = {
  date: string
  /** GitHub's intensity bucket, 0 (none) to 4 (most). */
  level: number
  count: number
}
