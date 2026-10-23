"""ingest_run lifecycle and raw_payload storage."""

from datetime import datetime, timedelta
from typing import Protocol

ERROR_MAX_CHARS = 1000


class Database(Protocol):
    def query(self, sql: str, params: tuple = ()) -> list[dict]: ...


def iso(now: datetime) -> str:
    return now.isoformat(timespec="seconds")


def start_run(db: Database, source: str, now: datetime) -> int:
    rows = db.query(
        "INSERT INTO ingest_run (source, started_at, status, rows_upserted) VALUES (?, ?, 'running', 0) RETURNING id",
        (source, iso(now)),
    )
    return int(rows[0]["id"])


def finish_run(
    db: Database, run_id: int, status: str, rows_upserted: int, error: str | None, now: datetime
) -> None:
    if status not in ("ok", "error"):
        raise ValueError(f"invalid finish status: {status}")
    db.query(
        "UPDATE ingest_run SET status = ?, rows_upserted = ?, error = ?, finished_at = ? WHERE id = ?",
        (status, rows_upserted, error[:ERROR_MAX_CHARS] if error else None, iso(now), run_id),
    )


def save_raw_payload(db: Database, source: str, request_key: str, body: str, now: datetime) -> None:
    db.query(
        "INSERT INTO raw_payload (source, request_key, fetched_at, body) VALUES (?, ?, ?, ?)",
        (source, request_key, iso(now), body),
    )


def prune_raw_payloads(db: Database, now: datetime, days: int = 90) -> None:
    # Timestamps share one fixed ISO format, so string comparison orders them correctly.
    db.query("DELETE FROM raw_payload WHERE fetched_at < ?", (iso(now - timedelta(days=days)),))
