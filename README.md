# Harvest Season Tracker

Family learning site tracking Iowa harvest seasons. See [PLAN.md](PLAN.md).

## Layout
- `frontend/` - Vite + React + TypeScript (served as Workers static assets)
- `backend/` - FastAPI on a Cloudflare Python Worker, D1 migrations in `backend/migrations/`
- `ingest/` - scheduled ingest scripts (GitHub Actions → D1 REST API)
- `data/seed/` - baseline CSVs
- `docs/reference/` - design references

## Prereqs
Node 24+, [uv](https://docs.astral.sh/uv/).

## Dev
```sh
# backend (http://localhost:8787)
cd backend && npm install && uv sync && npm run migrate:local && npm run dev

# frontend (http://localhost:5173, proxies /api to 8787)
cd frontend && npm install && npm run dev
```

## Tests
```sh
cd backend && uv run pytest
cd ingest && uv run pytest
```

## CI
- `Verify` (`.github/workflows/verify.yml`) runs `./scripts/verify.sh` on pull requests and pushes to `main`.
- `Dependencies` (`.github/workflows/dependency-review.yml`) reviews new dependencies on pull requests and runs a weekly npm and pip-audit check.
- Dependabot opens weekly update PRs for npm, uv, and GitHub Actions.

> TODO: make Verify required on `main`. After the first green Verify run on GitHub, go to
> Settings -> Rules -> Rulesets -> New branch ruleset, target the default branch, enable
> "Require status checks to pass", and add the `verify` check.
