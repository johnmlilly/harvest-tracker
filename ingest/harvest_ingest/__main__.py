"""Entry point: `uv run python -m harvest_ingest`. Exit 0 ok, 1 job failure, 2 missing configuration."""

import os
import sys
from collections.abc import Callable, Mapping
from datetime import datetime, timezone

import httpx

from harvest_ingest import nass, store
from harvest_ingest.d1 import D1Client

SOURCE = "nass_quickstats"
REQUIRED_ENV = ("NASS_API_KEY", "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN", "D1_DATABASE_ID")


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def corn_progress_params(year: int) -> dict[str, str]:
    return {
        "source_desc": "SURVEY",
        "sector_desc": "CROPS",
        "commodity_desc": "CORN",
        "statisticcat_desc": "PROGRESS",
        "agg_level_desc": "STATE",
        "state_alpha": "IA",
        "year": str(year),
        "format": "JSON",
    }


def main(
    env: Mapping[str, str] = os.environ,
    http: httpx.Client | None = None,
    now: Callable[[], datetime] = utc_now,
) -> int:
    missing = [name for name in REQUIRED_ENV if not env.get(name)]
    if missing:
        print(f"harvest_ingest: missing required env: {', '.join(missing)}", file=sys.stderr)
        return 2

    api_key = env["NASS_API_KEY"]
    secrets = (api_key, env["CLOUDFLARE_API_TOKEN"])

    def scrub(text: str) -> str:
        for secret in secrets:
            text = nass.redact(text, secret)
        return text

    http = http or httpx.Client(timeout=30)
    db = D1Client(env["CLOUDFLARE_ACCOUNT_ID"], env["D1_DATABASE_ID"], env["CLOUDFLARE_API_TOKEN"], http)

    run_id = None
    try:
        run_id = store.start_run(db, SOURCE, now())
        result = nass.fetch(http, api_key, corn_progress_params(now().year))
        store.save_raw_payload(db, SOURCE, result.request_key, result.body, now())
        store.prune_raw_payloads(db, now())
        store.finish_run(db, run_id, "ok", 1, None, now())
    except Exception as exc:
        message = scrub(f"{type(exc).__name__}: {exc}")
        print(f"harvest_ingest: {SOURCE} failed: {message}", file=sys.stderr)
        if run_id is not None:
            try:
                store.finish_run(db, run_id, "error", 0, message, now())
            except Exception as log_exc:
                print(f"harvest_ingest: could not record failure: {scrub(str(log_exc))}", file=sys.stderr)
        return 1

    print(f"harvest_ingest: {SOURCE} ok (run {run_id})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
