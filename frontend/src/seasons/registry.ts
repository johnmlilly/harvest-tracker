import type { Season } from './config'
import { defaultTheme } from './default'
import type { SeasonTheme } from './types'

/** Register a season's theme here once its folder exists. Unregistered seasons use the default scene. */
const THEMES: Partial<Record<Season, SeasonTheme>> = {}

export function getTheme(season: Season): SeasonTheme {
  return THEMES[season] ?? defaultTheme
}
