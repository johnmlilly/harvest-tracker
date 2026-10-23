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
