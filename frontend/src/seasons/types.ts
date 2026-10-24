import type { ComponentType } from 'react'
import type { Season, TimeOfDay } from './config'

export interface SceneProps {
  /** Effective season, so shared scene parts pick that season's land colors. */
  season: Season
  time: TimeOfDay
  /** Percent harvested (0-100), when known. */
  progress?: number
}

/** What a season folder exports. The core app knows only this shape, never season details. */
export interface SeasonTheme {
  id: string
  /** Kid-facing name, e.g. "Fall". */
  label: string
  /** CSS custom properties applied to the app shell. */
  palette: Record<`--${string}`, string>
  /** Decorative scene; the shell renders it inside an `aria-hidden` container. */
  Scene: ComponentType<SceneProps>
}
