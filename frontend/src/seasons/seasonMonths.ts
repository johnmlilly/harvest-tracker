import { SEASON_START_MONTHS, type Season } from './config'

const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' })

function nameOf(month: number) {
  return monthName.format(new Date(Date.UTC(2000, month - 1, 1)))
}

/** Kid-friendly month span for a season, e.g. "September to November". Each season lasts three months. */
export function seasonMonths(season: Season): string {
  const start = SEASON_START_MONTHS[season]
  const end = ((start + 1) % 12) + 1
  return `${nameOf(start)} to ${nameOf(end)}`
}
