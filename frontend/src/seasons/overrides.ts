import { clampPercent } from '../lib/percent'
import { SEASONS, TIMES_OF_DAY, type Season, type TimeOfDay } from './config'

/** Preview overrides from the URL, e.g. `?season=fall&time=dusk&progress=60`. */
export interface Overrides {
  season?: Season
  time?: TimeOfDay
  progress?: number
}

function pick<T extends string>(allowed: readonly T[], value: string | null): T | undefined {
  return allowed.find((item) => item === value)
}

/** Parse overrides from a query string. Unknown or malformed values are dropped, never passed through. */
export function parseOverrides(search: string): Overrides {
  const params = new URLSearchParams(search)
  const overrides: Overrides = {}

  const season = pick(SEASONS, params.get('season'))
  if (season) overrides.season = season

  const time = pick(TIMES_OF_DAY, params.get('time'))
  if (time) overrides.time = time

  const rawProgress = params.get('progress')
  const progress = rawProgress === null || rawProgress.trim() === '' ? Number.NaN : Number(rawProgress)
  if (Number.isFinite(progress)) overrides.progress = clampPercent(progress)

  return overrides
}
