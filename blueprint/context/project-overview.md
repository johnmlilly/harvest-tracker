# Harvest Season Tracker - Project Overview

<!-- blueprint:source-hash 53b28ed111ad477cdf6e66336660e746b492b2cf413067901c2a45f11fe5936a -->

> Homeschool learning site for kids 6 to 10 that shows Iowa's harvest live, in pictures: animated season scenes driven by real USDA, NOAA, and NWS data.

## Problem

The family moved to the country and is watching harvest happen around them. Public harvest data (USDA, NOAA, NWS) is written for farmers and analysts. This site turns it into pictures kids understand: a combine crossing a field as percent harvested rises, a sky that matches the real time of day, and comparisons like "more than last year."

Success: the kids ask to "check the harvest" and can say what changed since last week; the site updates weekly with no manual steps; any day, the scene feels alive.

## Users

- **Learners, ages 6 to 10** - currently 4 to 6, so a parent reads along. Need pictures over text, grade 1 to 3 copy, big tap targets.
- **Parent** - opens it for a quick weekly check (after the Tuesday update) or an at-a-glance live look.
- Laptop first, responsive to phone. Family only: no accounts, no logins, no personal data.

## Usage model

- One family, a handful of users. Internet-facing, read-only.
- No user input stored. Only the ingest job writes data.
- Trust boundaries: Cloudflare API token scope (D1 edit on this database only), GitHub secrets, query parameters on the public API.
- Non-requirements: multi-tenant, auth, compliance, high availability.

## Features

Build-plan order (IDs are stable, so the list is not numeric). Milestone 1 is the headline: a thin live slice shipped while harvest is still happening (USDA weekly reports stop in late November). Features 4 and 5 come before 2 and 3 so the Fall scene is visible early, driven by the `?progress=` override until real data arrives.

**Milestone 1: Live harvest slice**
- **1. Ingest foundation** - D1 REST client, `ingest_run` logging, `raw_payload` storage; done when a real Quick Stats response is saved from a GitHub Actions run.
- **4. App shell and season engine** - season resolver, theme registry with default fallback scene, dev URL overrides, scene list page; ports the frontier-journal theme and illustrated scene art kit from `prototypes/`.
- **5. Fall scene** - combine works the corn edge (edge = percent harvested); grain cart unloading cycle; leaves, geese, harvest moon; animated fall logo/loader; reduced-motion fallback.
- **2. Crop progress ingest** - Iowa corn and soybean weekly progress, multi-year backfill, idempotent upserts.
- **3. Progress API** - `/api/crops`, `/api/crops/{slug}/progress` (with last-year and 5-year-average comparison), `/api/health` (last successful ingest per source).
- **6. Day and night sky** - day, dusk, night palettes from Des Moines sunrise/sunset computed with `astral` and served by the API.
- **7. Home fact cards and crop pages** - kid-friendly picture cards; per-crop chart vs last year and average.
- **8. Go live** - deploy to Cloudflare, enable weekly schedule, "last updated" and stale-data banner.

**Milestone 2: Replay and winter**
- **9. Harvest replay** - week-by-week slider animating a season from stored history.
- **10. Winter scene** - snowfall, field under stars, glowing grain bin, countdown to spring planting.

**Milestone 3: Baseline calendar**
- **11. Baseline data** - seed crops, stages, usual plant/harvest dates for all three crops.
- **12. Season calendar** - begin, peak, end per crop, no live APIs.

**Milestone 4: Weather layer**
- **13. Frost** - NCEI frost normals, first-frost countdown, frost sparkle.
- **14. Heat accumulation** - daily temps ingest, GDD per crop, GDD-driven corn height.
- **15. Live forecast** - NWS forecast in the Worker, cached; rain/snow overlay.

**Milestone 5: More seasons and explainers**
- **16. Spring scene** - tractor planting, seedlings, rain, returning birds.
- **17. Summer scene** - growing corn, fireflies after sunset, heat shimmer, flowering beans.
- **18. Milestone events** - 50% harvested, last field done, first frost, solstice.
- **19. Explainer visuals** - sun arc with day-length slider, harvest race bars, kernel black-layer cutaway, season wheel.

**Milestone 6: Polish**
- **20. Polish** - attribution footer, mobile layout pass, accessibility and performance check.

Later, not v1: Virginia home layer; lessons, quizzes, glossary, journal, safety module, other states.

## Data model

D1 (SQLite). Dates are ISO text; recurring dates are `MM-DD`. Schema is locked in `backend/migrations/0001_init.sql`; change it only through new numbered migrations.

### location
- `id` (int PK), `name`, `state` (text), `lat`, `lon` (real), `tz` (text, `America/Chicago`)
- `nws_office` (text), `nws_grid_x`, `nws_grid_y` (int), `ncei_station_id` (text) - nullable, filled once resolved
- One row in v1: Des Moines, IA.

### crop
- `id` (int PK), `slug` (text unique), `name` (text), `kind` (`field` | `vegetable`)
- `nass_commodity` (text, null for snap beans)
- `gdd_base_f`, `gdd_cap_f` (real, nullable; corn 50/86), `maturity_gdd` (int, nullable)
- Rows: corn, soybeans, snap beans.

### crop_stage
- `id`, `crop_id` -> crop, `seq` (int), `code` (text, e.g. R6), `name`, `description`, `typical_moisture_pct` (real)
- Unique (`crop_id`, `seq`).

### usual_dates
- `id`, `crop_id` -> crop, `state`, `activity` (`plant` | `harvest`)
- `begin_md`, `peak_start_md`, `peak_end_md`, `end_md` (text `MM-DD`)
- `source` (text), `source_year` (int); unique (`crop_id`, `state`, `activity`, `source`).

### crop_progress
- `id`, `crop_id` -> crop, `state`, `year` (int), `week_ending` (text date)
- `stat` (`planted` | `mature` | `harvested`), `pct` (real), `fetched_at` (text)
- Upsert key: unique (`crop_id`, `state`, `week_ending`, `stat`).
- Last-year and 5-year-average comparisons are computed from stored history (Features 2, 3, 7, 9 depend on this shape).

### frost_normal
- `id`, `location_id` -> location, `season` (`spring` | `fall`), `threshold_f` (int: 36, 32, 28), `prob_pct` (int), `date_md` (text), `normals_period` (text, `1991-2020`)
- Unique (`location_id`, `season`, `threshold_f`, `prob_pct`).

### gdd_daily
- PK (`location_id` -> location, `date`); `tmax_f`, `tmin_f`, `gdd_f` (real); `source` (text).

### ingest_run
- `id`, `source`, `started_at`, `finished_at`, `status` (`running` | `ok` | `error`), `rows_upserted` (int), `error` (text).
- Drives `/api/health`, "last updated", and the stale-data banner.

### raw_payload
- `id`, `source`, `request_key`, `fetched_at`, `body` (text); pruned after 90 days.

Not stored: forecast (Worker fetches live, ~1 hour cache), sunrise/sunset (computed), scene/theme config (code).

Rules:
- Off-season (about December to March) has no weekly progress; the stale-data banner must not fire just for that.
- Snap beans have no live progress; they use baseline dates, frost, and GDD.
- Week endings and seasons resolve in the location timezone.

## Tech stack

- **Vite + React + TypeScript** - frontend SPA; inline SVG + CSS animation scenes, small canvas particle layer, GSAP only if needed.
- **FastAPI on a Cloudflare Python Worker** - read-only `/api/*`; `asgi.entrypoint`, deployed with `pywrangler`; pure-Python or Pyodide-compatible packages only.
- **Cloudflare D1** - database; plain numbered `.sql` migrations, no ORM; queried through the `DB` binding.
- **Python ingest package (`ingest/`)** - run by GitHub Actions; writes D1 through the D1 REST API.
- **astral** - sunrise/sunset computed in the Worker and served by the API; the frontend never computes sun times.
- **npm + uv** - frontend and Wrangler via npm; Python 3.14 via uv (pinned to match the Workers Pyodide runtime).
- **Vitest + pytest** - unit tests; `./scripts/verify.sh` is the combined Verify.
- Sources: USDA NASS Quick Stats (key), NASS usual-dates handbooks, NOAA NCEI frost tables, NWS api.weather.gov (User-Agent required), Open-Meteo or NASA POWER for daily temps.

Architecture rules:
- Frontend calls only this project's `/api/*`. Worker only reads D1; only ingest writes.
- Theme registry in `frontend/src/seasons/<name>/` (palette, scene, ambient effects, event animations); core app knows no season details. Seasons without a scene fall back to a default.
- Seasons are meteorological (Mar 1, Jun 1, Sep 1, Dec 1) in the location timezone, configured in one place.

## Monetization

None. Family homeschool project; stay in free tiers. Revisit Workers Paid only if Python Worker CPU time exceeds the free 10 ms limit.

## UI/UX

- The UI is the main attraction: each season has its own animated scene that restyles the whole site.
- **Look:** frontier journal inspired by 1990s Oregon Trail (never copied). Parchment cards on a muted season-colored page (sage spring, wheat summer, rust fall, slate winter), wooden plank header, brass buttons, ink-brown text.
- **Fonts (self-hosted):** Rye for titles, labels, buttons; Atkinson Hyperlegible for anything kids read.
- **Scenes:** layered smooth vector illustration, not pixel art. Gradient sky with sun glow, hazy far hills, detailed tree line, perspective field rows, soft shadows. Figures detailed but friendly; machines green and yellow, no brand marks.
- **Light:** day, dusk, night relight the whole scene through shared light settings; barn windows and machine lights glow at night.
- **Motion:** smooth and gentle. Machines work in place: combine at the corn edge (stalks fall into the header, tank fills); grain cart tractor pulls alongside, unloads, drives off. Turns happen off-screen; no visible flips.
- **Design reference:** `prototypes/` (`theme.css`, `home.html`, `scenes.html`, `art.js`) until Feature 4 ports theme and art into the app.

### Routes

| Path | Page | Built in |
|---|---|---|
| `/` | Home: big season scene, then 2 to 3 picture fact cards (e.g. "Corn: 78% picked. More than last year!") | 4 (cards in 7) |
| `/scenes` | Scene list, linked in the navigation | 4 |
| `/crops/:slug` | Crop page: progress chart vs last year and average; replay slider later | 7 |

- Dev overrides on every page: `?season=fall&time=dusk&progress=60`.
- Data bindings: corn edge = percent harvested, corn height = GDD, sky = sunrise/sunset, weather overlays = forecast, frost sparkle = frost data.
- Kid-first copy ("picked" alongside "harvested"); every number has a picture partner. Minimal navigation.
- A few tappable elements (birds fly off, tractor wiggles). No audio by default.
- Honor `prefers-reduced-motion`, pause when tab hidden, cap particles, scenes `aria-hidden`. Laptop first, responsive to phone.

## Deployment

- **Host:** Cloudflare. One Worker serves `frontend/dist` as static assets and runs Python only for `/api/*`.
- **Deploy:** `npm run deploy` in `backend/` (builds frontend, then `pywrangler deploy`).
- **Database:** D1 `harvest-tracker`, binding `DB`; `wrangler d1 migrations apply --remote`.
- **Scheduled work:** `.github/workflows/ingest.yml`, cron Tuesday and Wednesday mornings UTC (Wednesday retries) plus `workflow_dispatch`; idempotent upserts; fails loudly on source errors.
- **GitHub secrets:** `NASS_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `D1_DATABASE_ID`.
- **Worker vars:** `NWS_USER_AGENT`.
- **Health:** `GET /api/health`.
- **Domain:** > TODO (workers.dev to start).

## Open questions

> Tracked as TODOs on the build-plan feature that needs them. Resolve in the plans, then re-run `/overview`.

- Feature 1 (done) still lists TODOs for NASS key, D1 write limits, and `database_id`. All three are resolved (see `blueprint/history/features/01-ingest-foundation.md`); the notes can be removed from the plan.
- Feature 2: Quick Stats query parameters for Iowa corn and soybean progress.
- Feature 8: Python Worker CPU time vs the free 10 ms limit, GitHub pausing scheduled workflows, domain.
- Feature 11: snap bean baseline source.
- Feature 15: NWS User-Agent contact in `backend/wrangler.jsonc`.
