import { LOCATION_TZ, SEASON_START_MONTHS, SEASONS, type Season } from './config'

const monthFormat = new Intl.DateTimeFormat('en-US', { timeZone: LOCATION_TZ, month: 'numeric' })

const LATEST_START_FIRST = [...SEASONS].sort((a, b) => SEASON_START_MONTHS[b] - SEASON_START_MONTHS[a])

/** Today's meteorological season, read in the location timezone rather than the browser's. */
export function resolveSeason(now: Date = new Date()): Season {
  const month = Number(monthFormat.format(now))
  // Months before the earliest start (Jan, Feb) belong to the season that started last year.
  return LATEST_START_FIRST.find((season) => SEASON_START_MONTHS[season] <= month) ?? LATEST_START_FIRST[0]
}
