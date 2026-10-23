# Project Plan

## 1. Problem - What problem are we solving?

We recently moved to the country and are watching harvest happen around us. This
project turns that into a homeschool lesson: a small, charming website that shows
where the harvest stands right now, why it happens when it does, and how this year
compares to normal.

The source plan is `PLAN.md` (v1). This file captures the decisions made since.

Why it should exist: harvest data is public (USDA, NOAA, NWS) but written for
farmers and analysts. Kids need it turned into pictures: a combine crossing a field
as the percent harvested rises, a sky that matches the real time of day, and simple
comparisons like "more than last year."

Success looks like:
- The kids ask to "check the harvest" and can say in their own words what changed
  since last week.
- The site updates itself every week with no manual steps.
- A parent can open it any day and the scene feels alive (time of day), even
  between weekly data updates.

## 2. Users - Who is this for?

- Primary learners: ages 6 to 10. Our own kids are currently 4 to 6, so in
  practice a parent sits with them and reads along.
- Context: homeschool supplement. Two usage patterns, both supported:
  - At-a-glance live view: open it any time to see the current state.
  - Weekly quick check: after the Tuesday update, look together at what changed.
- Device: laptop most of the time. Must be responsive and readable on a phone.
- Family use only. No accounts, no logins, no personal data.

Design consequences:
- Pictures and animation carry the meaning. Text is short, plain, grade 1 to 3
  reading level.
- Every number has a picture partner (percent harvested = combine position).
- Big tap targets; a few scene elements react to taps.

## 3. Features - What does the MVP need?

MVP is built as a thin live slice first, because harvest is happening now and
weekly USDA reports stop in late November.

Slice 1 (live harvest):
- Weekly ingest of Iowa corn and soybean progress from USDA NASS Quick Stats,
  with historical backfill (several past years) for comparisons and replay.
- Read-only API for progress with last-year and 5-year-average comparison, plus
  a health endpoint reporting the last successful ingest.
- Home screen: large season scene on top, 2 to 3 picture "fact cards" below
  (e.g. "Corn: 78% picked. More than last year!").
- Fall scene: combine moves across the field by real percent harvested; falling
  leaves, geese, harvest moon at night. Animated seasonal logo that doubles as
  the loader.
- Day, dusk, and night palettes from sunrise/sunset computed locally (`astral`).
- Per-crop page with a simple progress chart (this year vs last year vs average).
- "Data last updated" and a stale-data banner.
- Dev preview URL overrides (`?season=fall&time=dusk&progress=60`) and a page
  listing every scene, so scenes can be tested off-season.
- Deployed to Cloudflare with the weekly schedule turned on.

After the slice:
- Replay: a week-by-week slider that animates a past or current season from
  stored history.
- Baseline calendar: usual plant/harvest begin, peak, end dates for all three crops.
- Weather layer: NCEI frost normals and first-frost countdown, GDD from daily
  temps with corn height driven by GDD, live NWS forecast with rain/snow overlay
  and frost sparkle.
- Remaining season scenes (Winter, Spring, Summer), milestone event animations,
  and explainer visuals (sun arc with day-length slider, harvest race bars, corn
  kernel black-layer cutaway, season wheel).
- Polish: attribution footer, mobile layout pass.

Non-goals for v1 (deferred, from `PLAN.md`): lessons, quizzes, glossary, journal,
safety module, other states, accounts, audio by default.

Later possibilities:
- Virginia home layer (our actual location), after the Iowa version teaches the idea.

## 4. Data - What are we storing?

D1 (SQLite) schema from `PLAN.md`, already in `backend/migrations/0001_init.sql`:

- `location` - one central-Iowa point (Des Moines, America/Chicago), NWS grid and
  NCEI station ids.
- `crop` - corn, soybeans, snap beans; NASS commodity name (null for snap beans),
  GDD base/cap, maturity GDD.
- `crop_stage` - ordered growth stages per crop.
- `usual_dates` - baseline plant/harvest windows as `MM-DD`, with source and year.
- `crop_progress` - weekly percent by crop, state, week ending, stat
  (planted | mature | harvested). Upsert key: (crop, state, week_ending, stat).
- `frost_normal` - 1991-2020 spring/fall frost dates by threshold and probability.
- `gdd_daily` - daily max/min temps and computed GDD.
- `ingest_run` - one row per ingest job run with status and error.
- `raw_payload` - raw source responses for re-parsing; pruned after 90 days.

Not stored: forecast (fetched live by the Worker, cached about 1 hour), sunrise and
sunset (computed), theme/scene config (lives in code).

Business rules and edge cases:
- Last-year and 5-year-average comparisons are computed from stored history, not
  requested from the API. Backfill several past years on first run.
- Off-season (about December to March) has no weekly progress. Baseline data and
  scenes must carry the site; the stale-data banner must not fire just because
  it is off-season.
- Snap beans have no live progress. They rely on baseline dates, frost, and GDD.
- Week-ending dates and seasons resolve in the location timezone.

## 5. Tech - What stack are we using?

Confirmed (scaffolded):
- Frontend: Vite + React + TypeScript. Inline SVG + CSS animations for scenes,
  small canvas layer for particles, GSAP only if needed. (React replaced Svelte.)
- API: FastAPI on a Cloudflare Python Worker (`asgi.entrypoint`), deployed with
  `pywrangler`. Packages must be pure-Python or Pyodide-compatible.
- Database: Cloudflare D1, plain numbered `.sql` migrations, no ORM.
- Ingest: Python package (`ingest/`) run by GitHub Actions, writing to D1 via the
  D1 REST API.
- Sunrise/sunset: `astral`, computed locally in the Worker and served by the API
  (the frontend never computes sun times itself).
- Tooling: npm (frontend, Wrangler), uv (Python 3.14, pinned in `.python-version`
  to match the Workers Pyodide runtime).
- Tests: Vitest (frontend), pytest (backend, ingest). `./scripts/verify.sh` runs
  typecheck, tests, and build; GitHub runs it on every pull request.

Architecture rules:
- Frontend only calls this project's `/api/*`.
- Worker only reads from D1; only the ingest job writes.
- Theme registry: `frontend/src/seasons/<name>/` exports palette, scene,
  ambient effects, event animations. Core app knows nothing about season details.
- Seasons are meteorological (Mar 1, Jun 1, Sep 1, Dec 1) in the location timezone,
  configured in one place.
- A season without a built scene falls back to a default scene so the site never
  breaks (Winter starts Dec 1, likely before its scene exists).

Data sources: USDA NASS Quick Stats (key required), NASS usual-dates handbooks,
NOAA NCEI frost tables, NWS api.weather.gov (User-Agent required), Open-Meteo or
NASA POWER for daily temps.

## 6. Monetize - How will this make money?

It will not. Family homeschool project. Stay inside free tiers where possible
(Workers, D1, GitHub Actions); revisit Workers Paid only if Python Worker CPU time
exceeds the free 10 ms limit.

## 7. UI/UX - How should this look and feel?

- The UI is the main attraction. Each season has its own small animated scene that
  changes the look of the whole site.
- Reference feel: the small, charming idle loop of the Claude Code animated icon.
  Store a screenshot or GIF in `docs/reference/` when available.
- Home: big scene, then 2 to 3 picture fact cards. Crop pages for deeper views.
  Minimal navigation.
- Kid-first copy: short sentences, friendly words ("picked" alongside "harvested").
- Starter scene ideas and data bindings as listed in `PLAN.md` (combine = percent
  harvested, corn height = GDD, sky = sunrise/sunset, weather overlays = forecast,
  frost sparkle = frost data).
- A few tappable elements (birds fly off, tractor wiggles). No audio by default.
- Accessibility and performance: honor `prefers-reduced-motion`, pause when the tab
  is hidden, cap particles, scenes are `aria-hidden` and decorative.
- Laptop first, responsive to phone.
- TODO: frontend route paths (home, crop page, scene list) are undecided. Decide
  when Feature 1 starts.

## 8. Deployment - Where and how will this ship?

- Host: Cloudflare. One Worker serves the built frontend (`frontend/dist`) as
  static assets and runs Python only for `/api/*`.
- Deploy: `npm run deploy` in `backend/` (builds frontend, then `pywrangler deploy`).
- Database: D1 `harvest-tracker`, binding `DB`; migrations via
  `wrangler d1 migrations apply --remote`.
- Scheduled work: `.github/workflows/ingest.yml`, cron Tuesday and Wednesday
  mornings UTC (Wednesday is the retry), plus manual `workflow_dispatch`.
  Idempotent upserts; fails loudly on source errors.
- GitHub secrets: `NASS_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`
  (D1 edit on this database only), `D1_DATABASE_ID`.
- Worker vars: `NWS_USER_AGENT`.
- Health check: `GET /api/health`.
- Domain: TODO (workers.dev is fine to start).

## 9. Usage model and constraints

- One family, a handful of users, no accounts. Internet-facing but read-only.
- No user input is stored. The only writes come from the ingest job.
- Real trust boundaries: Cloudflare API token scope, GitHub secrets, query
  parameters on the public API.
- Explicit non-requirements: multi-tenant, auth, compliance, high availability.

## 10. Risks, open items, TODOs

- TODO: get a NASS Quick Stats API key (blocks live data; build against a saved
  sample response until then).
- TODO: confirm Quick Stats query parameters for Iowa corn and soybean progress.
- TODO: resolve snap bean baseline source (NASS vegetable handbook vs Iowa State
  Extension).
- TODO: confirm D1 REST write limits and batch size; measure Python Worker CPU time
  against the free 10 ms limit.
- TODO: check whether GitHub pauses scheduled workflows on inactive repos.
- TODO: fill `database_id` and NWS contact in `backend/wrangler.jsonc`.
- Timing risk: Iowa harvest is mostly done by mid-November and reports stop in late
  November. Slice 1 may catch only a few live weeks; replay covers the rest.
- Accepted: kids live in Virginia but see Iowa numbers in v1.
- Handbook usual dates are old (2007/2010); treat as baseline and spot-check.
