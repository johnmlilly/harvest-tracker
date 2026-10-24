/** The one place seasons are configured. Seasons are meteorological and resolve in the location timezone. */

export const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const
export type Season = (typeof SEASONS)[number]

export const TIMES_OF_DAY = ['day', 'dusk', 'night'] as const
export type TimeOfDay = (typeof TIMES_OF_DAY)[number]

/** Des Moines, IA. */
export const LOCATION_TZ = 'America/Chicago'

/** Month (1-12) each season starts on the 1st. */
export const SEASON_START_MONTHS: Record<Season, number> = {
  spring: 3,
  summer: 6,
  fall: 9,
  winter: 12,
}
