# Harvest Season Tracker: Plan (v1)

Family learning site that tracks harvest seasons for Iowa crops: dates, daylight, frost, heat accumulation, and live USDA harvest progress, with fun animations. Data feeds itself on a weekly schedule.

## Scope (v1)
- State: Iowa (single central-Iowa location point, e.g. Des Moines, tz America/Chicago)
- Crops: corn, soybeans, snap beans
- Audience: family use only, no accounts
- Hosting: Cloudflare (frontend, API, database). Scheduled ingest runs on GitHub Actions.
- Deferred (not in v1): lessons, quizzes, glossary, journal, safety module, other states, Virginia home-garden layer

## Stack
- Frontend: Vite + TypeScript, Svelte (React is acceptable, pick one at start). Inline SVG + CSS animations for scenes, a small canvas layer for particles, GSAP only if needed. Served from Workers static assets.
- API: Python, FastAPI on a Cloudflare Python Worker (ASGI entrypoint, deployed with `pywrangler`)
- Database: Cloudflare D1 (SQLite-based). Migrations are plain numbered `.sql` files applied with `wrangler d1 migrations`. No SQLAlchemy or Alembic; query through the D1 binding.
- Ingestion: plain Python scripts run by a scheduled GitHub Actions workflow, writing to D1 through the Cloudflare D1 REST API
- Sunrise/sunset: computed locally (`astral`), not stored
- Python packages in the Worker must be pure-Python or Pyodide-compatible

## Architecture
```
GitHub Actions (cron) -> ingest scripts -> D1 (REST API)
                                              |
browser -> Workers static assets (frontend)   |
browser -> Python Worker (FastAPI, read-only) -> D1 binding
                                              -> NWS forecast (live, cached)
```
- The frontend never calls outside APIs directly
- The Worker only reads from D1. Only the ingest job writes.
- Forecast is fetched live by the Worker from NWS and cached (KV or Cache API, about 1 hour TTL). It is not stored in D1.
- Store raw payloads so parsers can be re-run without re-fetching; prune rows older than 90 days.
- Every ingest writes an `ingest_run` row; the UI shows "data last updated" and a stale-data banner.

Suggested layout:
```
.github/workflows/ingest.yml
backend/   wrangler.jsonc  pyproject.toml  src/ (api, services)  migrations/ (0001_init.sql ...)  tests/
ingest/    (Python scripts, shared with tests)
frontend/  src/
data/      seed/ (usual dates CSVs, crop stages)
```

## Scheduled ingest (GitHub Actions)
- Workflow `ingest.yml`: `schedule` cron plus `workflow_dispatch` for manual runs.
- Schedule: Tuesday and Wednesday mornings UTC (e.g. `17 13 * * 2,3`). NASS reports land Mondays; the second run is a retry. All writes are idempotent upserts, so reruns are safe.
- Jobs per run: Quick Stats crop progress (Iowa corn, soybeans), GDD backfill through yesterday, frost normals (only if missing).
- Secrets (GitHub repo secrets): `NASS_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `D1_DATABASE_ID`.
- The Cloudflare API token must be scoped to D1 edit on this one database only.
- The workflow must fail loudly (non-zero exit) when a source errors, so GitHub notifies. Also record the error in `ingest_run`.
- Caveats to verify in Phase 0:
  - Scheduled workflows run on UTC and can start late.
  - GitHub may disable scheduled workflows after a period of repo inactivity. Check current behavior and keep the stale-data banner as the safety net.
  - Confirm the D1 REST query endpoint and batch write limits from Python.

## UI and season scenes
The UI is the main attraction. Each season gets its own small, unique animated scene that changes the look and feel of the whole site, and the set of scenes can grow over time.

Look (decided Oct 2026): a frontier journal inspired by 1990s Oregon Trail, with layered, smooth vector scenes (not pixel art). See `blueprint/project-plan.md` section 7 and the mockups in `prototypes/`.

**Seasons:** four calendar seasons using meteorological dates (Mar 1, Jun 1, Sep 1, Dec 1) in the location's timezone. Configurable in one place.

**Starter scene ideas (one signature animation each):**
- Spring: a tiny tractor crosses the field planting; seedlings pop up row by row; rain showers; birds return.
- Summer: corn grows taller as accumulated GDD rises; fireflies appear after sunset; heat shimmer; bean plants flower.
- Fall: a combine works the corn edge (the edge moves as % harvested rises) while a grain cart pulls alongside to unload; falling leaves; geese in a V; harvest moon at night; frost sparkle after first frost.
- Winter: snowfall; quiet field under stars; glowing grain bin; countdown to spring planting.

**Data-driven where possible:**
- Corn edge (where the combine works) = `crop_progress` % harvested
- Corn height = accumulated GDD / `maturity_gdd`
- Day, dusk, and night palettes from computed sunrise/sunset
- Rain/snow overlay from the NWS forecast
- Frost sparkle from frost normals/forecast

**Design rules:**
- Animated logo: the site logo/icon is itself a small animated mark with a simple idle loop, and it changes per season (e.g. sprout in spring, sun in summer, corn or leaf in fall, snowflake in winter). It doubles as the loading state.
- Theme registry: `frontend/src/seasons/<name>/` each exports palette, scene component, ambient effects, and event animations. The core app knows nothing about season details.
- New scenes and events can be added without touching core code. That is how it "evolves": milestone events (50% harvested, last field done, first frost, solstice) and per-year variants.
- A few elements react to tap/click (birds fly off, tractor wiggles). No audio by default.
- Accessibility and performance: honor `prefers-reduced-motion` (static scene), pause when the tab is hidden, cap particle counts, keep scenes decorative (`aria-hidden`) so content stays readable on phones.
- Dev preview: URL overrides such as `?season=fall&time=dusk&progress=60`, plus a page that lists every scene.
- No database changes. Theme config lives in code.

## Data sources
| Need | Source | Notes |
|---|---|---|
| Weekly harvest progress | USDA NASS Quick Stats API | Free API key required; max 50,000 records per query. Reports are weekly (Mondays), stop in late November, resume in spring. State-level. Verify exact query parameter values against the Quick Stats docs (docs page was not reachable during planning). |
| Baseline "usual" dates | NASS usual planting/harvest handbooks (field crops ~2010 edition, vegetables 2007) | PDF/text only. Parse once into a seed CSV and spot-check by hand. Dated, treat as baseline. |
| Snap bean baseline | Check NASS vegetable handbook for Iowa first; fall back to Iowa State Extension garden planting guide | Open item, resolve in Phase 0. |
| Frost dates | NOAA NCEI freeze/frost probability tables (1991-2020 normals) | Files/tables, not an API. Ingest for the nearest station. |
| Forecast | NWS api.weather.gov | No key. Descriptive User-Agent header required. Resolve lat/lon -> office/grid via /points, cache it. Fetched live by the Worker, not by the ingest job. |
| GDD temps | NASA POWER or Open-Meteo | Compute GDD ourselves. Open-Meteo: free non-commercial, CC BY 4.0 attribution required. |
| Daylight | Computed locally | No external call. |

Attribution footer must credit USDA NASS, NOAA/NWS, and Open-Meteo/NASA POWER (whichever is used).

## Schema (D1 / SQLite, dates as ISO text)
Applied as numbered `.sql` migrations. D1 manages its own connections, so there is no `PRAGMA foreign_keys` line.

```sql
CREATE TABLE location (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  tz TEXT NOT NULL,
  nws_office TEXT,
  nws_grid_x INTEGER,
  nws_grid_y INTEGER,
  ncei_station_id TEXT
);

CREATE TABLE crop (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('field','vegetable')),
  nass_commodity TEXT,          -- null for snap beans
  gdd_base_f REAL,              -- nullable; corn commonly 50F base / 86F cap
  gdd_cap_f REAL,
  maturity_gdd INTEGER          -- nullable, varies by hybrid/variety
);

CREATE TABLE crop_stage (
  id INTEGER PRIMARY KEY,
  crop_id INTEGER NOT NULL REFERENCES crop(id),
  seq INTEGER NOT NULL,
  code TEXT,                    -- e.g. R6, R8
  name TEXT NOT NULL,
  description TEXT,
  typical_moisture_pct REAL,
  UNIQUE (crop_id, seq)
);

CREATE TABLE usual_dates (
  id INTEGER PRIMARY KEY,
  crop_id INTEGER NOT NULL REFERENCES crop(id),
  state TEXT NOT NULL,
  activity TEXT NOT NULL CHECK (activity IN ('plant','harvest')),
  begin_md TEXT,                -- 'MM-DD', repeats every year
  peak_start_md TEXT,
  peak_end_md TEXT,
  end_md TEXT,
  source TEXT NOT NULL,
  source_year INTEGER,
  UNIQUE (crop_id, state, activity, source)
);

CREATE TABLE crop_progress (
  id INTEGER PRIMARY KEY,
  crop_id INTEGER NOT NULL REFERENCES crop(id),
  state TEXT NOT NULL,
  year INTEGER NOT NULL,
  week_ending TEXT NOT NULL,
  stat TEXT NOT NULL,           -- planted | mature | harvested (extend via migration)
  pct REAL NOT NULL,
  fetched_at TEXT NOT NULL,
  UNIQUE (crop_id, state, week_ending, stat)   -- ingest upserts on this
);
-- Last-year and 5-year-average comparisons come from a view/query over stored history,
-- not from the API. Backfill several past years on first run.

CREATE TABLE frost_normal (
  id INTEGER PRIMARY KEY,
  location_id INTEGER NOT NULL REFERENCES location(id),
  season TEXT NOT NULL CHECK (season IN ('spring','fall')),
  threshold_f INTEGER NOT NULL,   -- 36, 32, 28
  prob_pct INTEGER NOT NULL,
  date_md TEXT NOT NULL,
  normals_period TEXT NOT NULL,   -- '1991-2020'
  UNIQUE (location_id, season, threshold_f, prob_pct)
);

CREATE TABLE gdd_daily (
  location_id INTEGER NOT NULL REFERENCES location(id),
  date TEXT NOT NULL,
  tmax_f REAL NOT NULL,
  tmin_f REAL NOT NULL,
  gdd_f REAL NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (location_id, date)
);

CREATE TABLE ingest_run (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL,           -- running | ok | error
  rows_upserted INTEGER DEFAULT 0,
  error TEXT
);

CREATE TABLE raw_payload (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,
  request_key TEXT NOT NULL,
  fetched_at TEXT NOT NULL,
  body TEXT NOT NULL
);
```

Add indexes on common read paths (e.g. `crop_progress(crop_id, state, week_ending)`, `gdd_daily(location_id, date)`). D1's free tier enforces daily row read/write caps, so avoid full table scans.

## Read-only API (sketch)
- `GET /api/health` (last successful ingest per source)
- `GET /api/crops`
- `GET /api/crops/{slug}/calendar` (usual dates)
- `GET /api/crops/{slug}/progress?year=` (with last-year and 5-yr-avg comparison)
- `GET /api/daylight?start=&end=` (computed)
- `GET /api/frost`
- `GET /api/forecast` (live from NWS, cached)
- `GET /api/gdd?crop=&since=`

## Phases
0. **Setup and source checks**
   - Scaffold repo, frontend shell, Python Worker with a FastAPI hello-world; create the D1 database and run `0001_init.sql`.
   - Confirm FastAPI and `astral` import and run in the Python Worker, and note the Worker plan's CPU limit against a real request.
   - Create the Cloudflare API token and GitHub secrets; confirm a Python script can write to D1 over the REST API.
   - Get a Quick Stats key; confirm query parameters for Iowa corn and soybean progress.
   - Resolve the snap bean baseline source for Iowa.
   - Done when: one real Quick Stats response is saved to `raw_payload` from a GitHub Actions run, and the snap bean source is decided.
1. **Static baseline**
   - Seed crops, stages, usual dates. Build season calendar and computed sunrise/sunset.
   - Done when: the calendar shows begin/peak/end for all three crops with no live APIs.
2. **UI foundation + Fall scene**
   - Design tokens, season resolver, theme registry, dev URL overrides.
   - Fall scene (combine, falling leaves, geese, harvest moon) using baseline data and a `?progress=` override.
   - Animated logo/loader for Fall.
   - Day/dusk/night palettes from computed sunrise/sunset. Reduced-motion fallback.
   - Done when: the Fall scene looks good on phone and desktop, and switching season or time via URL works.
3. **Live harvest data**
   - Scheduled ingest workflow (Tuesday/Wednesday), idempotent upserts, `ingest_run` logging, historical backfill.
   - "Ahead/behind average" view. The combine now reads real % harvested.
   - Done when: a new week appears with no manual steps and the scene updates.
4. **Weather layer**
   - Live NWS forecast in the Worker with caching, NCEI frost normals, GDD from daily temps, first-frost countdown.
   - Rain/snow overlays, frost sparkle, GDD-driven corn height.
   - Done when: each crop page shows frost risk and heat accumulated.
5. **Remaining scenes and explainer visuals**
   - Spring, Summer, Winter scenes, one at a time, plus milestone event animations.
   - Explainer visuals: sun arc with day-length slider, harvest progress race bars, corn kernel black-layer cutaway, season wheel.
   - Done when: every season has a scene and all animations run from API data, not hardcoded values.
6. **Polish**
   - Attribution footer, "data last updated" and stale-data banner, mobile layout check, tests for ingest parsers, deploy script or CI deploy.

## Risks / open items
- Quick Stats key process and limits are unverified (docs page was blocked during research).
- Handbook PDFs are old; one-time parse needs manual spot-check.
- Frost data is files, not an API.
- Off-season (about December to March) has no weekly progress; baseline data must carry the site.
- Snap beans have no live progress data; they rely on baseline dates, frost, and GDD only.
- Python Workers on the free plan have a tight CPU limit (10 ms per request). If real requests exceed it, move to Workers Paid.
- GitHub Actions scheduling can be late or paused; rely on the stale-data banner and manual `workflow_dispatch`.
- D1 REST API write limits and batch size are unverified.

## Check later
- **D1 cost:** look up D1 pricing beyond the free tier (row reads, row writes, storage) and estimate this site's monthly usage once live data is flowing (after Phase 3). Free-tier daily row caps are enforced.
- **D1 REST API write limits:** confirm rate limits, max statements per batch, and payload size for writes from GitHub Actions (Python). Decide batch sizes for the historical backfill. Check by end of Phase 0.
- **Python Worker CPU limits on the free plan:** measure real CPU time per request (the free limit is 10 ms) for FastAPI cold and warm starts, and decide whether Workers Paid is needed. Check by end of Phase 0.
