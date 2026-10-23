#!/usr/bin/env bash
# Verify: typecheck, tests, and build for every part. CI runs this same script.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> frontend"
(cd frontend && npm run verify)

echo "==> backend"
(cd backend && uv run --locked pytest)

echo "==> ingest"
(cd ingest && uv run --locked pytest)
