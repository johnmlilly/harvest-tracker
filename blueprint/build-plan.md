# Build Plan

Features in rough build order. Details come later in `/feature`.

## Milestone 1: Live harvest slice

- [x] 1. **Ingest foundation** - D1 REST client, `ingest_run` logging, `raw_payload` storage; one real Quick Stats response saved from a GitHub Actions run
  - TODO: get a NASS Quick Stats API key (until then, build against a saved sample response)
  - TODO: confirm D1 REST write limits and batch size
  - TODO: fill `database_id` in `backend/wrangler.jsonc`
  - TODO: decide frontend route paths (home, crop page, scene list) before Feature 4
- [ ] 4. **App shell and season engine** - season resolver, theme registry with default fallback scene, dev URL overrides, scene list page
- [ ] 5. **Fall scene** - combine driven by percent harvested, leaves, geese, harvest moon, animated fall logo/loader, reduced-motion fallback
- [ ] 2. **Crop progress ingest** - Iowa corn and soybean weekly progress with multi-year backfill and idempotent upserts
  - TODO: confirm Quick Stats query parameters for Iowa corn and soybean progress
- [ ] 3. **Progress API** - `/api/crops`, `/api/crops/{slug}/progress` with last-year and 5-year-average comparison, `/api/health` with last ingest
- [ ] 6. **Day and night sky** - day, dusk, night palettes from Des Moines sunrise and sunset computed with `astral` and served by the API
- [ ] 7. **Home fact cards and crop pages** - kid-friendly picture cards and a per-crop progress chart vs last year and average
- [ ] 8. **Go live** - deploy to Cloudflare, enable the weekly schedule, "last updated" and stale-data banner
  - TODO: measure Python Worker CPU time against the free 10 ms limit
  - TODO: check whether GitHub pauses scheduled workflows on inactive repos
  - TODO: domain (workers.dev is fine to start)

## Milestone 2: Replay and winter

- [ ] 9. **Harvest replay** - week-by-week slider that animates a season from stored history
- [ ] 10. **Winter scene** - snowfall, quiet field under stars, glowing grain bin, countdown to spring planting

## Milestone 3: Baseline calendar

- [ ] 11. **Baseline data** - seed crops, stages, and usual plant/harvest dates for all three crops (snap bean source resolved)
  - TODO: resolve snap bean baseline source (NASS vegetable handbook vs Iowa State Extension)
- [ ] 12. **Season calendar** - begin, peak, end for each crop with no live APIs

## Milestone 4: Weather layer

- [ ] 13. **Frost** - NCEI frost normals and first-frost countdown, frost sparkle
- [ ] 14. **Heat accumulation** - daily temps ingest, GDD per crop, GDD-driven corn height
- [ ] 15. **Live forecast** - NWS forecast in the Worker with caching, rain/snow overlay
  - TODO: set the NWS User-Agent contact in `backend/wrangler.jsonc`

## Milestone 5: More seasons and explainers

- [ ] 16. **Spring scene** - tractor planting, seedlings, rain, returning birds
- [ ] 17. **Summer scene** - growing corn, fireflies after sunset, heat shimmer, flowering beans
- [ ] 18. **Milestone events** - 50% harvested, last field done, first frost, solstice animations
- [ ] 19. **Explainer visuals** - sun arc with day-length slider, harvest race bars, kernel black-layer cutaway, season wheel

## Milestone 6: Polish

- [ ] 20. **Polish** - attribution footer, mobile layout pass, final accessibility and performance check

## Later (not v1)

- Virginia home layer
- Lessons, quizzes, glossary, journal, safety module, other states
