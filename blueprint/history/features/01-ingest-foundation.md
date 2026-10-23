# Feature: Ingest foundation

**From build-plan:** feature 1
**Build attempt:** 1
**Status:** verified
**Branch:** `feature/ingest-foundation`

## Goal

Give the ingest job the plumbing every later source needs: write to D1 over the
Cloudflare REST API, log each run in `ingest_run`, keep raw responses in
`raw_payload`, and fail loudly. Proven when one real USDA NASS Quick Stats
response is saved to D1 by a GitHub Actions run.

## In scope

- D1 REST client in `ingest/` (single-statement query with params).
- `ingest_run` lifecycle: insert `running`, finish as `ok` or `error` with the error text.
- `raw_payload` storage plus pruning of rows older than 90 days.
- Quick Stats fetch that returns the raw response body (no parsing).
- One job wired into `python -m harvest_ingest`: fetch Iowa corn progress for the
  current year, store it raw, prune, log the run.
- Required env vars validated up front; non-zero exit on any failure.
- Manual live proof through `workflow_dispatch` once the NASS key and D1 setup exist.

## Out of scope

- Parsing Quick Stats into `crop_progress`, soybeans, backfill, upserts (Feature 2).
- Any API endpoint or frontend change (Features 3+).
- Enabling the cron schedule (Feature 8).
- Batch writes and backfill batch sizes (Feature 2), beyond recording what the docs say.
- Frost, GDD, forecast sources.

## Build loop

`workflow.stepReview` is `feature` and `workflow.checkpointCommits` is `disabled`:
build all steps, run the checks after each, then present one review packet. No
checkpoint commits. `/complete` makes the final feature commit.

## Build steps

- [x] **Step 1 - D1 REST client** - `ingest/harvest_ingest/d1.py` with `D1Client(account_id, database_id, api_token, http)` and `query(sql, params) -> list[dict]`, POSTing to the D1 query endpoint. Raises `D1Error` on HTTP failure or `success: false`. First confirm the endpoint, request body, response shape, and documented limits (statements per request, payload size, rate limits) against current Cloudflare docs, and record the findings in Notes. *Done when:* pytest using `httpx.MockTransport` covers the request (URL, bearer header, JSON body), returned rows, and both error paths, and `uv run pytest` passes in `ingest/`.
- [x] **Step 2 - Run log and raw payload store** - `ingest/harvest_ingest/store.py`: `start_run(db, source, now) -> int` (`INSERT ... RETURNING id`), `finish_run(db, run_id, status, rows_upserted, error, now)`, `save_raw_payload(db, source, request_key, body, now)`, `prune_raw_payloads(db, now, days=90)`. The clock is passed in. *Done when:* tests with a fake D1 client assert the exact SQL params, the `running`/`ok`/`error` values, ISO timestamps, and the 90-day cutoff, and pytest passes.
- [x] **Step 3 - Quick Stats fetch** - `ingest/harvest_ingest/nass.py`: `fetch(http, api_key, params) -> FetchResult(request_key, body)` against `https://quickstats.nass.usda.gov/api/api_GET/`. `request_key` is the sorted, URL-encoded params without `key`. Raises `NassError` on non-200, invalid JSON, or an `error` field. Error text never contains the key. *Done when:* tests with `MockTransport` and a synthetic fixture cover success, the `request_key` format, each error path, and key redaction, and pytest passes.
- [x] **Step 4 - Job entry point** - `__main__.py` reads `NASS_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `D1_DATABASE_ID`. Any missing: print which names (never values) to stderr and exit 2 with no network calls. Otherwise: `start_run("nass_quickstats")`, fetch, save raw, prune, then `finish_run(ok, rows_upserted=1)`. On any error: `finish_run(error, redacted message)`, exit 1. If logging the failure also fails, still exit 1. Update `tests/test_main.py`. *Done when:* tests cover the missing-env exit 2, the success path's call order, the error path, and redaction (fake clients, no network), and `./scripts/verify.sh` passes.
- [x] **Step 5 - Live proof (needs user actions)** - With the user:
  - Create the D1 database and fill `database_id` in `backend/wrangler.jsonc`.
  - Apply `0001_init.sql` remotely (`npm run migrate:remote` in `backend/`).
  - Create a Cloudflare API token scoped to D1 edit on this database only.
  - Add the 4 GitHub secrets.
  - Push the branch (only after the user approves).
  - Run `gh workflow run ingest.yml --ref feature/ingest-foundation`.

  Blocked until the NASS key exists. *Done when:* the Actions run is green, and `wrangler d1 execute harvest-tracker --remote` shows a new `ingest_run` row with status `ok` plus a `raw_payload` row whose `body` is the real Quick Stats JSON.

- [x] **Step 6 - Repair F-01** - redact the full NASS error body before truncating it to 200 chars (`nass.py`). *Done when:* a regression test with the key straddling the 200-char boundary passes and `./scripts/verify.sh` passes.

## Files / areas

- New: `ingest/harvest_ingest/d1.py`, `store.py`, `nass.py`
- Changed: `ingest/harvest_ingest/__main__.py`
- Tests: `ingest/tests/test_d1.py`, `test_store.py`, `test_nass.py`, `test_main.py`; fixture `ingest/tests/fixtures/nass_sample.json`
- Step 5 only: `backend/wrangler.jsonc` (`database_id`)
- Unchanged: `.github/workflows/ingest.yml` already passes the 4 secrets and supports `workflow_dispatch`

## Data / contracts

- **Tables:** `ingest_run` and `raw_payload` from `backend/migrations/0001_init.sql`. No migration changes.
- **Timestamps:** `datetime.now(timezone.utc).isoformat(timespec="seconds")`, e.g. `2026-10-22T21:00:00+00:00`, used for `started_at`, `finished_at`, `fetched_at`. Pruning compares these ISO strings, so the format must stay fixed.
- **ingest_run:** `source = "nass_quickstats"`.
  - Start: `status "running"`, `rows_upserted 0`.
  - Finish: `status "ok"` or `"error"`, `finished_at` set.
  - `error` holds `"<ExceptionType>: <message>"`, redacted and truncated to 1000 chars; it is null on `ok`.
  - `rows_upserted` counts rows the job wrote (1 here: the raw payload).
- **raw_payload:** `source = "nass_quickstats"`, `request_key` as in Step 3, `body` the exact response text. Prune: `DELETE FROM raw_payload WHERE fetched_at < <now - 90 days>`.
- **Quick Stats params (Feature 1):** `source_desc=SURVEY`, `sector_desc=CROPS`, `commodity_desc=CORN`, `statisticcat_desc=PROGRESS`, `agg_level_desc=STATE`, `state_alpha=IA`, `year=<current UTC year>`, `format=JSON`. Exact values are confirmed in Feature 2; here any non-error response counts.
- **D1 request:** `POST https://api.cloudflare.com/client/v4/accounts/{account_id}/d1/database/{database_id}/query`, `Authorization: Bearer <token>`, body `{"sql": ..., "params": [...]}`. Always parameterized; SQL is never built by string formatting. Step 1 confirms the exact shape.
- **Secrets:** the NASS key (sent as the `key` query param) and the Cloudflare token never appear in stdout, stderr, exception text, `ingest_run.error`, or `request_key`. httpx errors include the request URL, so redact the key value from any message before printing or storing.
- **Exit codes:** 0 success, 1 job failure, 2 missing configuration.

## Testing

- Runner: pytest in `ingest/` (`uv run pytest`); final gate `./scripts/verify.sh`.
- Logic tests:
  - D1 request and response handling.
  - Store SQL, params, and timestamps.
  - Prune cutoff.
  - `request_key` building.
  - NASS error handling and key redaction.
  - Entry-point exit codes and order of calls.
- All tests use `httpx.MockTransport` or fake clients. No network in tests.
- The fixture `nass_sample.json` is a trimmed real response (the 2 latest Iowa corn PCT HARVESTED records from the Step 5 run).
- Live D1 and Quick Stats behavior is only proven by Step 5. Do not claim it earlier.

## Notes for the AI

- Ingest is plain CPython (3.14, uv), not Pyodide. Use `httpx` (already a dependency); add no new runtime dependencies.
- The Worker never writes D1. All writes stay in `ingest/`.
- Keep `D1Client` single-statement until Feature 2 needs batching. Record what the docs say about batch support, limits, and rate limits here after Step 1, to close the build-plan TODO.
- Inject the HTTP client and the clock so tests stay deterministic.
- Step 5 includes remote changes: a Cloudflare resource, a token, GitHub secrets, a push, and a workflow run. Each needs the user's explicit approval. The user can do them in the dashboard instead.
- `rows_upserted` meaning for later jobs: rows written by that run.

### D1 REST findings (Step 1, Cloudflare docs, 2026-10-22)

- `POST /accounts/{account_id}/d1/database/{database_id}/query`, Bearer token with D1 Read/Write.
- Body is either `{"sql", "params"}` or `{"batch": [{"sql", "params"}, ...]}`. Multi-statement `sql` also runs as a batch.
- Response: `{success, errors[], messages[], result: [{results[], success, meta{changes, last_row_id, rows_read, rows_written, ...}}]}`.
- Limits: 100 KB per SQL statement, 100 bound parameters per query, 2 MB per row or string, 30 s per API call (covers the whole batch).
- Not documented: REST rate limit, statements per batch, request payload cap.
- Free plan: daily row read/write caps are enforced (since 2026-09-01); queries fail until midnight UTC.
- Live proof (Step 5): Actions run 39887834976 on `feature/ingest-foundation` passed. Remote `ingest_run` id 1 is `ok`, and `raw_payload` id 1 holds 62,149 bytes: 66 records covering PCT PLANTED, EMERGED, SILKING, DOUGH, DENTED, MATURE, HARVESTED. Latest harvested: 26% for week ending 2026-10-18.
- Implication for Feature 2: batch upserts and keep each statement under 100 parameters (about 12 `crop_progress` rows of 8 columns per multi-row insert).


<!-- blueprint:completion {"schemaVersion":2,"specBytes":9568,"specSha256":"7191eed46f57884f725de4dab0987422472e0281984a5fb11a4f403794c77da2","branch":"refs/heads/feature/ingest-foundation","head":"8ce70ce4e07d2561c5768133f82f497bc8fe9166","baseRef":"refs/heads/main","baseCommit":"62c54a5cfcb8862761723ca11ef37413638800ba","sourceTree":"c839b25916b77cbd7c4168e47e8d72c01484d31d","landing":"local-merge","absentOptional":[]} -->

## Findings

### 1/F-01 [P2] closed - NASS error body is truncated before the key is redacted

**File:** ingest/harvest_ingest/nass.py:38
**Found:** 2026-10-23 by /audit independent (scope: current; lens: security)
**Why it matters:** Slicing resp.text[:200] before redact() lets a key echoed across the 200-char boundary leak its prefix into exception text, stderr/Actions logs, and ingest_run.error; __main__.scrub cannot catch the partial. Reproduced with MockTransport. Breaks the spec Secrets contract; P2 because the trigger (NASS echoing the key in a non-200 body) is unobserved.
**Suggested fix:** f"HTTP {resp.status_code}: {redact(resp.text, api_key)[:200]}"; add a test with the key across the boundary.
**Resolution:** Fixed by /implement (spec Step 6): redact the full body before truncating; regression test places the key across the 200-char boundary. Awaiting re-review.
Closed 2026-10-23 by /audit independent (fresh subagent, claude-opus-5-5) at 8ce70ce: nass.py:38 now redacts the full body before slicing to 200 chars; test_nass.py::test_key_straddling_truncation_boundary_is_not_leaked would fail against the old order (key prefix kept) and passes now. Other NassError paths still redact; main's scrub and finish_run truncate after redaction. No new defect introduced.

## Independent review

# Independent Review

**Status:** passed
**Target commit:** 8ce70ce4e07d2561c5768133f82f497bc8fe9166
**Base commit:** 62c54a5cfcb8862761723ca11ef37413638800ba
**Base ref:** main
**Spec hash:** 7191eed46f57884f725de4dab0987422472e0281984a5fb11a4f403794c77da2
**Prepared by:** claude
**Builder model:** claude-opus-5-5
**Requested reviewer:** claude
**Requested model:** claude-opus-5-5
**Requested execution:** automatic
**Requested at:** 2026-10-23T02:15:00Z
**Workflow:** regular
**Check required:** no
**Reviewer adapter:** claude
**Reviewer model:** claude-opus-5-5
**Reviewer context:** fresh subagent
**Actual execution:** automatic
**Reviewed at:** 2026-10-23T02:40:00Z
**Scope:** current
**Lenses:** quality, security, performance, tests
**Verdict:** passed
**Check result:** not-required

## Handoff

Review the active spec and the complete `62c54a5cfcb8862761723ca11ef37413638800ba..8ce70ce4e07d2561c5768133f82f497bc8fe9166` delta in a fresh
session or isolated subagent without the builder conversation. Run all Audit lenses from scratch.
Run Check when required above. Do not edit product code, accept findings, or
reuse the existing findings as the review scope.

## Commands

- `git rev-parse HEAD` / `git merge-base main HEAD`: pass (HEAD equals target; merge base equals base commit)
- `shasum -a 256 blueprint/context/current-feature.md`: pass (matches spec hash; spec is tracked)
- `git status --porcelain --untracked-files=all`: pass (only review.md and findings.md modified)
- `./scripts/verify.sh`: pass (exit 0; frontend build ok, backend 1 passed, ingest 24 passed)

## Evidence

- Reviewed full delta: ingest/harvest_ingest/{__main__,d1,nass,store}.py, ingest/tests/*, fixture, backend/wrangler.jsonc, spec changes; cross-checked backend/migrations/0001_init.sql and .github/workflows/ingest.yml.
- Security: all D1 SQL is parameterized; NASS key redacted on every NassError path (full body redacted before truncation at nass.py:38); main scrubs both secrets before stderr and ingest_run.error; token only in Authorization header; committed database_id is an identifier, not a secret.
- Performance: one fetch and four single-statement D1 calls per run; prune uses idx_raw_payload_fetched; 62 KB live body is within documented D1 limits.
- Tests: no skipped, focused, or placeholder tests; all network mocked via httpx.MockTransport.

## Findings

- F-01 [P2] closed (repair verified at nass.py:38 with boundary regression test)
- F-02 [P3] open (re-confirmed, non-blocking)
- F-03 [P3] open (re-confirmed, non-blocking)
- No new findings

## Remaining risk

- Live D1 and Quick Stats behavior not re-run by this reviewer (no network); relies on the spec's recorded Step 5 Actions run.
- Redaction matches the exact secret string only; an encoded form of a key echoed by an upstream service would not be caught (no evidence this occurs).

## Try it now

Confirms the ingest job refuses to run without its configuration and never prints secret values. Safe, local, no network.

```sh
cd ingest
env -u NASS_API_KEY -u CLOUDFLARE_ACCOUNT_ID -u CLOUDFLARE_API_TOKEN -u D1_DATABASE_ID uv run python -m harvest_ingest; echo "exit $?"
```

Expect:

```text
harvest_ingest: missing required env: NASS_API_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, D1_DATABASE_ID
exit 2
```

Failure signs: any exit code other than 2, a Python traceback, or a network attempt.
