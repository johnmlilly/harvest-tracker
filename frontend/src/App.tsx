import type { CSSProperties } from 'react'
import { Link } from './app/Link'
import { matchRoute } from './app/routes'
import { useLocation } from './app/useLocation'
import { usePageHidden } from './app/usePageVisibility'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ScenesPage } from './pages/ScenesPage'
import { SceneDefs } from './scenes/SceneDefs'
import { parseOverrides } from './seasons/overrides'
import { getTheme } from './seasons/registry'
import { resolveSeason } from './seasons/resolveSeason'

function BrandMark() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path d="M32 6 C44 10 46 30 40 52 L32 58 L24 52 C18 30 20 10 32 6Z" fill="#e9c24a" />
      <path
        d="M28 12 L26 52 M32 8 V56 M36 12 L38 52 M22 20 H42 M21 28 H43 M21 36 H43 M22 44 H42"
        stroke="#c99a2a"
        strokeWidth="1.5"
        opacity=".7"
        fill="none"
      />
      <path d="M24 52 C14 42 12 26 18 14 C22 30 26 42 32 58Z" fill="#5f9a3c" />
      <path d="M40 52 C50 42 52 26 46 14 C42 30 38 42 32 58Z" fill="#4a8530" />
    </svg>
  )
}

function App() {
  const { pathname, search } = useLocation()
  const hidden = usePageHidden()
  const route = matchRoute(pathname)
  const overrides = parseOverrides(search)
  const season = overrides.season ?? resolveSeason()
  const theme = getTheme(season)

  return (
    <div
      className="shell"
      data-season={season}
      data-paused={hidden || undefined}
      style={theme.palette as CSSProperties}
    >
      <SceneDefs />
      <div className="shell__page">
        <header className="plank">
          <Link to="/" className="brand">
            <BrandMark />
            Harvest Tracker
          </Link>
          <nav aria-label="Main">
            <ul className="nav">
              <li>
                <Link to="/" className="btn" aria-current={route.name === 'home' ? 'page' : undefined}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/scenes" className="btn" aria-current={route.name === 'scenes' ? 'page' : undefined}>
                  Scenes
                </Link>
              </li>
            </ul>
          </nav>
        </header>
        <main>
          {route.name === 'home' && (
            <HomePage season={season} theme={theme} time={overrides.time ?? 'day'} progress={overrides.progress} />
          )}
          {route.name === 'scenes' && <ScenesPage />}
          {route.name === 'notFound' && <NotFoundPage />}
        </main>
      </div>
    </div>
  )
}

export default App
