# Coding Standards

> Tuned by `/onboard` for Vite + React + TypeScript (frontend), FastAPI on a
> Cloudflare Python Worker with D1 (backend), and plain Python ingest scripts.
> `> TODO` marks conventions the young codebase does not show yet.

## Project Structure

- `frontend/` - Vite + React + TypeScript SPA, built to `frontend/dist`
- `backend/` - FastAPI app in `backend/src/` (entry `main.py`), D1 migrations in
  `backend/migrations/NNNN_name.sql`, pytest in `backend/tests/`
- `ingest/` - scheduled ingest package `harvest_ingest`, run by
  `.github/workflows/ingest.yml`
- `data/seed/` - baseline CSVs; `docs/reference/` - design references
- One Worker serves both: static assets from `frontend/dist`, only `/api/*` runs Python

## Package Managers

- Frontend: npm (`frontend/package-lock.json`)
- Python (backend, ingest): uv (`uv.lock`); Python 3.13+
- Wrangler is an npm dev dependency of `backend/`; Python Worker commands go
  through `uv run pywrangler`

## TypeScript

- Strict mode (Vite template defaults); no `any`, use proper types or `unknown`
- Type API responses explicitly; keep shared API types in one place
  > TODO: location for API types once the first endpoint is consumed

## React

- Functional components and hooks only
- Keep components focused; extract reusable logic into custom hooks
- Season scenes are decorative: `aria-hidden`, honor `prefers-reduced-motion`,
  pause when the tab is hidden, cap particle counts
- Season themes live in `frontend/src/seasons/<name>/` and register through a
  theme registry; core app code must not know season details
  > TODO: confirm registry shape when the first scene is built

## Styling

- Plain CSS (Vite template). Inline SVG + CSS animations for scenes, a small
  canvas layer for particles, GSAP only if needed
- Design tokens as CSS custom properties
  > TODO: token file location and naming once Phase 2 starts

## Naming

- React components: PascalCase files (`SeasonScene.tsx`)
- TS functions and variables: camelCase; constants: SCREAMING_SNAKE_CASE
- Python: snake_case modules and functions, PascalCase classes (PEP 8)
- Migrations: zero-padded sequence plus snake_case name (`0002_add_view.sql`)

## Backend (Python Worker)

- FastAPI app, exposed with `Default = asgi.entrypoint(app)` from `workers`
- All routes under `/api/`. The API is read-only: it never writes to D1
- Packages must be pure-Python or Pyodide-compatible; check before adding one
- The `workers` module exists only in the Workers runtime; tests stub it in
  `backend/tests/conftest.py`
- Free plan CPU limit is 10 ms per request; keep handlers cheap

## Database (D1)

- Schema changes are new numbered `.sql` files in `backend/migrations/`, applied
  with `wrangler d1 migrations apply`. Never edit an applied migration
- No ORM. Query through the D1 binding (`DB`) with parameterized `prepare(...).bind(...)`,
  never string-formatted SQL
- Dates are ISO text; month-day values are `MM-DD`
- Add indexes for read paths; avoid full-table scans (free-tier row caps)

## Data Flow and Boundaries

- The frontend calls only this project's `/api/*`, never outside APIs
- Only the ingest job writes to D1, over the D1 REST API
- Ingest writes are idempotent upserts; every run records an `ingest_run` row
- Forecast is fetched live from NWS by the Worker and cached, not stored
- Validate query parameters with FastAPI/Pydantic types at the route boundary

## Error Handling

- API: raise `HTTPException` with a clear status for bad input or missing data;
  never leak stack traces or upstream payloads
- Ingest: fail loudly (non-zero exit) when a source errors, and record the error
  in `ingest_run`
- Frontend: show a friendly fallback and the stale-data banner instead of crashing
  > TODO: frontend error UI pattern

## Secrets

- Never commit secrets. Local Worker secrets go in `backend/.dev.vars` (ignored);
  ingest secrets are GitHub repo secrets (`NASS_API_KEY`, `CLOUDFLARE_*`, `D1_DATABASE_ID`)

## Testing

The blueprint installs no test runner; testing is opt-in at the project level,
because the overlay can't know your stack. Adding unit testing is an explicit
setup task the AI can do through the normal workflow, either as a build-plan item
or with `/tests`. The setup should choose the stack-native runner, wire the
scripts or commands, add a small example test, and update the Commands section
of `AGENTS.md`.

When `AGENTS.md` declares a `Verify` command, treat it as the umbrella automated
gate. It combines only the checks this project actually has, in this order when
available: typecheck, tests, then build. The command does not enable an absent
test runner or replace focused evidence. It gives local work and optional CI one
exact command to run. `/ci` owns Verify and CI setup. `/tests` adds the real test
command to Verify when it already exists, but never creates CI only because
testing was configured.

**The opt-in switch is one signal: a `test` command in the Commands section of
`AGENTS.md`.** Declare one and **tests become a gate for logic-bearing steps**,
not an optional extra; leave it out and the loop verifies logic with the evidence
it already uses (run it, a screenshot, the build). Adding the runner is itself a
deliberate step, never a silent mid-step install. This is the single definition
of the switch; the skills and `ai-interaction.md` only point back here.

- **What to test (the scope rule):** pure logic where a wrong answer is possible -
  parsers, formatters, validators, id/slug builders, server actions. These have
  assertable inputs and outputs and real edge cases (empty, missing, malformed).
- **What not to test:** UI components and integration-level surfaces (render or
  export routes, anything driving a real browser or external service). Verify those
  with a screenshot and the build, not brittle unit tests.
- **The gate (when a runner is configured):** a build step that adds in-scope logic
  must ship a passing test in the same reviewable diff. The project's test command
  must be green before the step is approved, before any checkpoint commit, and
  before `/complete` merges. UI and integration-only steps are exempt and ride on
  screenshot plus build evidence.
- **When it's named:** the `/feature` spec's Testing section predicts the coverage,
  `/implement` writes the test with the step, and if a step surfaces logic the spec
  didn't foresee, add a focused test then.
- An empty suite should fail, not pass, so "no tests ran" never looks like "passed".
- TypeScript test files live next to source (`feature.test.ts`); Python tests live in `tests/`.
- Run them via the project's test command (see Commands in `AGENTS.md`), not a
  hardcoded tool name.

Stack binding: Python logic (API services, ingest parsers, GDD and season math)
uses pytest under each package's `tests/` directory, with network calls stubbed.
Python tests live in `tests/` rather than next to source. Frontend TypeScript logic
(season resolver, percent and date math) uses Vitest, with `vi.useFakeTimers()` for
time-dependent code. Scenes and components are verified visually, not unit tested.

## Browser Verification

For UI and integration behavior, prefer real browser evidence over reading the
code and assuming it works.

- Browser automation is separately opt-in through `/tests browser`. That setup
  reuses a compatible runner or prefers Playwright for supported projects, then
  documents the exact command as `Browser tests` in `AGENTS.md`.
- When `Browser tests` is declared, add focused coverage for stable behavioral
  done-whens when it is proportionate, and run the documented command during
  `/check`. Do not assume it proves visual fidelity, real authenticated-profile
  behavior, browser chrome, or another claim the test does not observe.
- If no Browser tests command is declared, do not add a runner silently in the
  middle of an unrelated feature. Use the available dev server, browser
  screenshots, build output, API output, or manual evidence instead.
- Browser tests are not part of the default Verify command or CI unless the user
  separately chooses that slower gate.
- Browser evidence is especially important for flows that click, type, submit,
  navigate, download files, render complex layouts, or depend on client-side
  state.

## Code Quality

- No commented-out code unless specified
- No unused imports or variables
- Keep functions under 50 lines when possible

## Comments

Write code that explains itself; comment only what the code cannot say.
Over-commenting is a common AI tell, so resist it.

- Comment the **why**, not the **what**. Delete any comment that restates the code.
- No banner/header blocks, section dividers, or step-by-step narration of obvious
  code. A file does not need a comment announcing each region.
- A comment earns its place only when it captures something the code can't: a
  non-obvious decision, a gotcha or workaround, why a value is what it is, or a
  link to a spec or issue.
- Prefer self-documenting names and small functions over explanatory comments.
- Keep doc comments minimal: a one-line purpose on an exported type or function is
  plenty; don't write JSDoc that just repeats the signature.
- When in doubt, leave the comment out.

## Writing

- No em dashes (U+2014) in generated content: docs, comments, commit messages,
  READMEs, specs. They read as AI-generated.
- Use a hyphen for `term - description` separators; rephrase prose with commas,
  parentheses, or a colon. Avoid en dashes and the ellipsis character too.
