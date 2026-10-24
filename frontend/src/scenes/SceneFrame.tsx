import type { ReactNode } from 'react'
import type { Season, TimeOfDay } from '../seasons/config'
import './scenes.css'

interface SceneFrameProps {
  season: Season
  time: TimeOfDay
  /** Sun, moon, stars, clouds, birds: drawn over the CSS sky, not relit. */
  sky?: ReactNode
  /** Everything on the ground. Dusk and night relight this layer. */
  children: ReactNode
  /** Lights that glow above the darkened land; rendered only at night. */
  lights?: ReactNode
}

/** A 1600x900 decorative scene. Sky and land colors come from CSS variables keyed by season and time. */
export function SceneFrame({ season, time, sky, children, lights }: SceneFrameProps) {
  return (
    <svg
      className="scene"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      data-season={season}
      data-time={time}
      aria-hidden="true"
      focusable="false"
    >
      {sky}
      <g className="scene__land">{children}</g>
      {time === 'night' && lights}
    </svg>
  )
}
