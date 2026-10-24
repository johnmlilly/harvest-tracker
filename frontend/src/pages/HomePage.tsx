import type { Season, TimeOfDay } from '../seasons/config'
import type { SeasonTheme } from '../seasons/types'

interface HomePageProps {
  season: Season
  theme: SeasonTheme
  time: TimeOfDay
  progress?: number
}

export function HomePage({ season, theme, time, progress }: HomePageProps) {
  const { Scene } = theme
  return (
    <>
      <div className="scene-frame">
        <Scene season={season} time={time} progress={progress} />
        <span className="plaque" aria-hidden="true">
          Iowa &middot; {season}
        </span>
      </div>
      <h1>It's {season} in Iowa!</h1>
    </>
  )
}
