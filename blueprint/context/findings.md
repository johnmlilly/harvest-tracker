# Findings

> **Generated file.** The findings ledger: review findings raised by `/audit`
> against the work in progress, each with a durable ID, severity (P0-P3), and
> status. `/implement` marks repaired findings `fixed`, a later `/audit` pass
> moves them to `closed`, and `/complete` refuses to land while any P0 or P1
> finding is `open` or `fixed`, then archives resolved findings with the work
> and resets this file.

### F-02 [P3] open - D1Client assumes a JSON object response

**File:** ingest/harvest_ingest/d1.py:31
**Found:** 2026-10-23 by /audit independent (scope: current; lens: quality)
**Why it matters:** Valid but non-object JSON (or a non-list result) raises AttributeError, not D1Error; the job still exits 1 but the recorded error type is misleading.
**Suggested fix:** isinstance(payload, dict) check raising D1Error("unexpected response shape"), as nass.fetch already does.
**Resolution:** User chose to fix F-01 only for now; left open (P3, non-blocking). Re-confirmed 2026-10-23 at 8ce70ce: d1.py:31-34 still calls payload.get / e.get without a type check.

### F-03 [P3] open - Entry-point tests skip the start_run failure path and the finish_run ok params

**File:** ingest/tests/test_main.py:55
**Found:** 2026-10-23 by /audit independent (scope: current; lens: tests)
**Why it matters:** No test covers start_run failing (exit 1, no UPDATE sent); the success test checks only SQL verb order, not the ("ok", 1, None, ...) finish params or that the raw payload body and request_key pass through. The store unit tests reduce the risk.
**Suggested fix:** Add a test where INSERT INTO ingest_run returns 500 (assert exit 1, no UPDATE); assert the final UPDATE and raw_payload INSERT params in the success test.
**Resolution:** User chose to fix F-01 only for now; left open (P3, non-blocking). Re-confirmed 2026-10-23 at 8ce70ce: still no start_run failure test and no finish/raw_payload param assertions. Also noted: the CF-SECRET absence check in test_source_error is vacuous because no failure message ever contains the token, so main's token scrub is unexercised.
