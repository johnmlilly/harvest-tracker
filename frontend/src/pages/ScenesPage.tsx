import type { CSSProperties } from 'react'
import { Card } from '../app/Card'
import { Link } from '../app/Link'
import { SEASONS } from '../seasons/config'
import { getTheme } from '../seasons/registry'
import { seasonMonths } from '../seasons/seasonMonths'

/** Every season with a preview of the scene it shows. */
export function ScenesPage() {
  return (
    <>
      <h1>Scenes</h1>
      <ul className="scene-grid">
        {SEASONS.map((season) => {
          const theme = getTheme(season)
          const { Scene } = theme
          const ownScene = theme.id !== 'default'
          return (
            <li key={season} style={theme.palette as CSSProperties}>
              <Link to={`/?season=${season}`} className="scene-card">
                <Card title={season} aside={seasonMonths(season)}>
                  <Scene season={season} time="day" />
                  <div className="scene-card__meta">
                    <span className={ownScene ? 'tag tag--own' : 'tag tag--default'}>
                      {ownScene ? 'Has its own scene' : 'Default scene'}
                    </span>
                  </div>
                </Card>
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
