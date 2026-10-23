# Build Plan

Features in rough build order. Details come later in `/feature`.

Before Feature 1: run `/tests` to set up testing (mirror the johnsblog repo).

## Milestone 1: Live harvest slice

- [ ] 1. **Ingest foundation** - D1 REST client, `ingest_run` logging, `raw_payload` storage; one real Quick Stats response saved from a GitHub Actions run
- [ ] 2. **Crop progress ingest** - Iowa corn and soybean weekly progress with multi-year backfill and idempotent upserts
- [ ] 3. **Progress API** - `/api/crops`, `/api/crops/{slug}/progress` with last-year and 5-year-average comparison, `/api/health` with last ingest
- [ ] 4. **App shell and season engine** - season resolver, theme registry with default fallback scene, dev URL overrides, scene list page
- [ ] 5. **Fall scene** - combine driven by percent harvested, leaves, geese, harvest moon, animated fall logo/loader, reduced-motion fallback
- [ ] 6. **Day and night sky** - day, dusk, night palettes from computed Des Moines sunrise and sunset
- [ ] 7. **Home fact cards and crop pages** - kid-friendly picture cards and a per-crop progress chart vs last year and average
- [ ] 8. **Go live** - deploy to Cloudflare, enable the weekly schedule, "last updated" and stale-data banner

## Milestone 2: Replay and winter

- [ ] 9. **Harvest replay** - week-by-week slider that animates a season from stored history
- [ ] 10. **Winter scene** - snowfall, quiet field under stars, glowing grain bin, countdown to spring planting

## Milestone 3: Baseline calendar

- [ ] 11. **Baseline data** - seed crops, stages, and usual plant/harvest dates for all three crops (snap bean source resolved)
- [ ] 12. **Season calendar** - begin, peak, end for each crop with no live APIs

## Milestone 4: Weather layer

- [ ] 13. **Frost** - NCEI frost normals and first-frost countdown, frost sparkle
- [ ] 14. **Heat accumulation** - daily temps ingest, GDD per crop, GDD-driven corn height
- [ ] 15. **Live forecast** - NWS forecast in the Worker with caching, rain/snow overlay

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
