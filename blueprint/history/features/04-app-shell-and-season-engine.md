# Feature: App shell and season engine

**From build-plan:** feature 4
**Build attempt:** 1
**Branch:** feature/app-shell-and-season-engine
**Status:** verified

## Goal

Replace the Vite starter page with the real app shell: a season resolver that
knows today's meteorological season in Des Moines time, a theme registry where
each season plugs in its own scene and palette (falling back to a default
scene), URL overrides for previewing any season, time, or progress, and a scene
list page. The shell wears the approved frontier-journal look, and a shared
scene kit (sky, light, landscape parts) lets Feature 5 build the Fall scene
without touching core code.

## Design reference

Approved mockups in `prototypes/` (revision 2, 2026-10-23):

- `prototypes/theme.css` - tokens to port: walnut/paper/ink/brass, season page
  colors, fonts, spacing, and per-season/per-time scene light variables
- `prototypes/mockup.css` - plank header, brass buttons, parchment cards, scene
  frame and plaque, scene animation rules
- `prototypes/home.html`, `prototypes/scenes.html` - layout of home and scene list
- `prototypes/art.js` - SVG drawings to port as React components

`prototypes/` is reference only. It stays committed after this feature because
`prototypes/art.js` still holds the Fall art (combine, grain cart, farmer, geese,
corn) that Feature 5 ports; it is removed when that art is in the app.

## In scope

- Season config in one place: meteorological start months (Mar 1, Jun 1,
  Sep 1, Dec 1) and the location timezone `America/Chicago`.
- Pure season resolver: `Date` -> `spring | summer | fall | winter`, resolved in
  the location timezone, not the browser's.
- URL override parser for `?season=`, `?time=`, `?progress=`, applied on every
  page and preserved across in-app navigation.
- Theme registry with a typed theme contract and a default fallback theme.
- Routes (decided 2026-10-23): `/` home, `/scenes` scene list, `/crops/:slug`
  reserved for Feature 7. Scene list is linked in the navigation.
- Home page: the big season scene in a wooden frame with a brass plaque, plus a
  kid-friendly season heading.
- Scene list page: one parchment card per season with a scene preview, which
  theme it uses, and a link to `/?season=<name>`.
- Not-found page for unknown paths, with a link home.
- Frontier-journal theme: tokens ported from `prototypes/theme.css`; muted
  season page color (sage, wheat, rust, slate) chosen from the effective season;
  wooden plank header with brand mark; brass nav buttons; parchment card.
- Self-hosted fonts: Rye (titles, labels, buttons) and Atkinson Hyperlegible
  (body) via `@fontsource/rye` and `@fontsource/atkinson-hyperlegible`.
- Scene kit: shared SVG defs, a scene frame that sets `data-season` and
  `data-time`, sky gradient and sun/moon glow from CSS variables, land light
  filters for dusk and night, a night layer for glowing lights, and the
  landscape parts the default scene uses (hills, tree, cloud, farmstead with
  night lights, field rows, moon, stars).
- Default scene redrawn with the kit: generic farm under a sky that follows
  `time`, gentle cloud glide.
- Project-wide scene rules in core: scenes `aria-hidden`, honor
  `prefers-reduced-motion` (static scene), pause animation while the tab is
  hidden.
- Remove the Vite starter content and assets; set the page title.

## Out of scope

- Fall scene and its parts: combine, grain cart tractor, farmer, geese, cut
  stalks, corn and stubble art, chaff (Feature 5). Spring tractor and planter
  (Feature 16). Snow caps, grain bins, snowfall (Feature 10). These port from
  `prototypes/art.js` with the scene that uses them.
- Animated per-season logo or loader (Feature 5). The brand mark is static.
- Fact cards with progress bars (Feature 7). The parchment card ships now
  because the scene list and not-found pages use it; the progress bar does not.
- Real day/dusk/night from sunrise and sunset (Feature 6). Until then time of
  day is `day` unless `?time=` overrides it.
- Any `/api/*` call or crop page. `/crops/:slug` renders not-found until Feature 7.
- Tappable elements and particles.

## Build loop

`workflow.stepReview` is `feature`: build all steps, then present one review
packet for the whole feature. `workflow.checkpointCommits` is `disabled`; no
commits during implementation. `/complete` creates the final commit and, with
`git.landing: "pull-request"`, offers the push and PR.

## Build steps

- [x] 1. **Season engine logic.** `frontend/src/seasons/config.ts`,
  `resolveSeason.ts`, `overrides.ts`, each with a `.test.ts`.
  Done when: `npm test` passes boundary and override cases.
- [x] 2. **Theme registry and default theme.** `seasons/types.ts`,
  `registry.ts` (+ test), `seasons/default/`.
  Done when: registry test proves fallback; `npm run build` passes.
- [x] 3. **App shell and routing.** `app/routes.ts` (+ test), `useLocation.ts`,
  `Link.tsx`, `usePageVisibility.ts`, shell `App.tsx`, starter content removed.
  Done when: route tests pass; nav and back/forward work.
- [x] 4. **Pages.** `pages/HomePage.tsx`, `ScenesPage.tsx`, `NotFoundPage.tsx`;
  build-plan route TODO removed. Done when: pages render per route and Verify passes.
- [x] 5. **Theme tokens and fonts.** Install `@fontsource/rye` and
  `@fontsource/atkinson-hyperlegible` (npm, `frontend/`), import them in
  `main.tsx`, port tokens from `prototypes/theme.css` into `frontend/src/index.css`
  (drop the Google Fonts `@import`), and set `data-season` on the shell root so
  the page color follows the effective season.
  Done when: build passes, built CSS references only local font files, and
  `/?season=winter` shows the slate page color.
- [x] 6. **Scene kit.** Add `frontend/src/scenes/` with `SceneDefs.tsx`
  (gradients, filters, rendered once by `App`), `SceneFrame.tsx` (svg with
  `viewBox="0 0 1600 900"`, `data-season`, `data-time`, `aria-hidden`, land and
  night layers), part components (`Hills`, `Tree`, `Cloud`, `Farmstead`,
  `FarmLights`, `FieldRows`, `Moon`, `Stars`), and `scenes.css` (sky, light,
  per-season land variables, animations, reduced-motion and paused rules).
  Done when: build passes and the parts render without console errors.
- [x] 7. **Default scene redraw.** Rewrite `seasons/default/DefaultScene.tsx` on
  the kit and delete `DefaultScene.css`. Done when: `/` shows hills, tree line,
  farmstead, field, clouds and sun; `?time=dusk` warms the land and lowers the
  sun; `?time=night` shows moon, stars and glowing barn windows.
- [x] 8. **Shell restyle.** Plank header with static corn brand mark, brass nav
  buttons, scene frame with plaque on home, `Card` component
  (`frontend/src/app/Card.tsx`) used by the scene list and not-found pages.
  Done when: home, `/scenes`, and `/nope` match the prototype styling at laptop
  width and stack cleanly at phone width; focus outlines visible on links.
- [x] 9. **Final pass.** Compare against `prototypes/` side by side; run
  `npm run lint` and `./scripts/verify.sh`. Done when: both pass.

## Files / areas

- `frontend/src/seasons/` - `config.ts`, `resolveSeason.ts`, `overrides.ts`,
  `types.ts`, `registry.ts`, `default/` (+ tests next to source)
- `frontend/src/scenes/` - scene kit: `SceneDefs.tsx`, `SceneFrame.tsx`, part
  components, `scenes.css`
- `frontend/src/app/` - `routes.ts`, `useLocation.ts`, `Link.tsx`,
  `usePageVisibility.ts`, `Card.tsx` (+ `routes.test.ts`)
- `frontend/src/pages/` - `HomePage.tsx`, `ScenesPage.tsx`, `NotFoundPage.tsx`
- `frontend/src/App.tsx`, `frontend/src/main.tsx`, `frontend/src/index.css`,
  `frontend/index.html`
- `frontend/package.json`, `frontend/package-lock.json` - two font packages
- Deleted: `frontend/src/App.css`, `frontend/src/assets/*`,
  `frontend/public/icons.svg`, `frontend/src/seasons/default/DefaultScene.css`
- Reused: `frontend/src/lib/percent.ts` (`clampPercent`) for `?progress=`
- `blueprint/build-plan.md` - drop the resolved route TODO (done)
- No backend changes. `backend/wrangler.jsonc` already sets
  `not_found_handling: "single-page-application"` with `run_worker_first: ["/api/*"]`.

## Data / contracts

No persisted data, no API. Internal TypeScript contracts:

```ts
type Season = 'spring' | 'summer' | 'fall' | 'winter'
type TimeOfDay = 'day' | 'dusk' | 'night'

LOCATION_TZ = 'America/Chicago'
SEASON_START_MONTHS: Record<Season, number> = { spring: 3, summer: 6, fall: 9, winter: 12 }

resolveSeason(now?: Date): Season
parseOverrides(search: string): Overrides   // exact lowercase enums; progress finite -> clampPercent

interface SceneProps { time: TimeOfDay; progress?: number }
interface SeasonTheme {
  id: string
  label: string
  palette: Record<`--${string}`, string>    // CSS custom properties on the shell root
  Scene: ComponentType<SceneProps>
}
getTheme(season: Season): SeasonTheme

type Route = { name: 'home' } | { name: 'scenes' } | { name: 'notFound' }
matchRoute(pathname: string): Route

// scene kit
SceneFrame({ season, time, children, night? })  // children = land layer; night = above-light layer
```

Behavior rules:
- Effective season = `overrides.season ?? resolveSeason()`; effective time =
  `overrides.time ?? 'day'`; progress passed through only when overridden.
- Overrides are enabled in all builds; invalid values are ignored silently and
  never render as HTML.
- Page color: `.shell[data-season]` picks `--bg-spring|summer|fall|winter`
  tokens; a theme palette may override `--page-bg`.
- Scene light: sky and sun/moon glow come from CSS variables keyed by
  `data-time`; land colors from variables keyed by `data-season`; dusk and night
  apply a color-matrix filter to the land layer only; night lights render above it.
- Scene art draws only from kit parts and CSS variables, so a season scene
  changes colors through variables, not new drawings.

## Testing

Vitest, next to source, fixed `Date` inputs for time:
- `resolveSeason.test.ts`, `overrides.test.ts`, `registry.test.ts`,
  `routes.test.ts` (done, 16 tests).

Steps 5 to 8 are styling and SVG: verified visually on the dev server and
preview build, not unit tested. No Browser tests command is declared, so `/check`
uses manual browser evidence.

## Notes for the AI

- Keep core app code free of season details: `App.tsx` and pages only use
  `getTheme`, `Season`, and theme fields. Season art lives under
  `seasons/<name>/`; the kit under `scenes/` is shared and season-agnostic.
- Port drawings from `prototypes/art.js` as JSX with the same coordinates.
  Each part's origin is its bottom center; place parts with `transform`.
- Animated groups: put the CSS animation class on an outer `<g>` and the
  placement `transform` attribute on an inner `<g>`; a CSS transform replaces the
  attribute otherwise. Scale-from-center effects need `transform-box: fill-box`.
- Gradients and filters live once in `SceneDefs`; gradient stop colors are fixed
  values because CSS variables in defs resolve at the defs, not the scene.
- Hidden-tab pause: `data-paused` on the shell root sets
  `animation-play-state: paused` for scene descendants. Reduced motion turns
  scene animations off.
- The land color-matrix filter re-renders while things animate; check the home
  scene stays smooth on a laptop and keep the default scene's animation light.
- Big tap targets (44px), visible focus outline, laptop first, check phone width.
- `Link` calls `preventDefault` only for plain left clicks.
- Local env note: backend and ingest `.venv/bin/pytest` launchers were missing
  earlier; `uv sync --locked --reinstall-package pytest` restored them. No repo
  change.


<!-- blueprint:completion {"schemaVersion":2,"specBytes":11562,"specSha256":"f27ebf6178404bb6adf1181fb4a13bb446ad25e0bca5dfc726fa558bd0f69701","branch":"refs/heads/feature/app-shell-and-season-engine","head":"d2781df6e67989c3982fcdb2acd6af349984ecde","baseRef":"refs/heads/main","baseCommit":"d2781df6e67989c3982fcdb2acd6af349984ecde","sourceTree":"49ab910de93a40fbff1c9e7e0d331b682b3d775a","landing":"pull-request","absentOptional":[]} -->

## Try it now

With the dev server running (`cd frontend && npm run dev`):

1. Open http://localhost:5173/. Expect the wooden plank header, the farm scene in a wood frame with an **"Iowa · Fall"** plaque (in fall), a rust page, and **"It's fall in Iowa!"**.
2. Open `/?time=dusk`. Expect a purple-to-orange sky, a low sun behind the hills, and warmer land.
3. Open `/?season=winter&time=night`. Expect a slate page, snowy ground, moon, stars, and glowing barn windows.
4. Click **Scenes**. Expect four parchment cards ("March to May" through "December to February"), each tagged **Default scene**; the query string is kept.
5. Open `/nope`. Expect the **"Lost on the trail"** card with **Go home**.
6. Narrow the window to phone width. Expect the header to stack and the scene to scale down.
7. DevTools > Rendering > emulate `prefers-reduced-motion: reduce`. Expect clouds and stars to stop.
