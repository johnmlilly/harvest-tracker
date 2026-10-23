from datetime import datetime, timezone

import pytest

from harvest_ingest.store import finish_run, prune_raw_payloads, save_raw_payload, start_run
from tests.conftest import FakeDB

NOW = datetime(2026, 10, 22, 21, 0, 0, tzinfo=timezone.utc)


def test_start_run_inserts_running_row_and_returns_id():
    db = FakeDB(responses=[[{"id": 42}]])
    assert start_run(db, "nass_quickstats", NOW) == 42
    sql, params = db.calls[0]
    assert "INSERT INTO ingest_run" in sql and "'running'" in sql and "RETURNING id" in sql
    assert params == ("nass_quickstats", "2026-10-22T21:00:00+00:00")


def test_finish_run_ok():
    db = FakeDB()
    finish_run(db, 42, "ok", 1, None, NOW)
    sql, params = db.calls[0]
    assert sql.startswith("UPDATE ingest_run")
    assert params == ("ok", 1, None, "2026-10-22T21:00:00+00:00", 42)


def test_finish_run_error_truncates_message():
    db = FakeDB()
    finish_run(db, 42, "error", 0, "x" * 1500, NOW)
    assert db.calls[0][1][2] == "x" * 1000


def test_finish_run_rejects_unknown_status():
    with pytest.raises(ValueError):
        finish_run(FakeDB(), 1, "running", 0, None, NOW)


def test_save_raw_payload():
    db = FakeDB()
    save_raw_payload(db, "nass_quickstats", "a=1", '{"data": []}', NOW)
    sql, params = db.calls[0]
    assert "INSERT INTO raw_payload" in sql
    assert params == ("nass_quickstats", "a=1", "2026-10-22T21:00:00+00:00", '{"data": []}')


def test_prune_uses_90_day_cutoff():
    db = FakeDB()
    prune_raw_payloads(db, NOW)
    sql, params = db.calls[0]
    assert sql == "DELETE FROM raw_payload WHERE fetched_at < ?"
    assert params == ("2026-07-24T21:00:00+00:00",)
