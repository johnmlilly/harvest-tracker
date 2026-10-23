import json
from datetime import datetime, timezone

import httpx

from harvest_ingest.__main__ import main

NOW = datetime(2026, 10, 22, 21, 0, 0, tzinfo=timezone.utc)
ENV = {
    "NASS_API_KEY": "NASS-SECRET",
    "CLOUDFLARE_ACCOUNT_ID": "acct",
    "CLOUDFLARE_API_TOKEN": "CF-SECRET",
    "D1_DATABASE_ID": "db-uuid",
}


def d1_ok(rows=None):
    return httpx.Response(200, json={"success": True, "result": [{"success": True, "results": rows or []}]})


class Router:
    """Fake network: records D1 SQL in order and serves NASS from a fixture or error."""

    def __init__(self, nass_response, fail_finish=False):
        self.sql = []
        self.nass_response = nass_response
        self.fail_finish = fail_finish

    def __call__(self, request):
        if request.url.host == "quickstats.nass.usda.gov":
            return self.nass_response
        sql = json.loads(request.content)["sql"]
        self.sql.append(sql)
        if sql.startswith("INSERT INTO ingest_run"):
            return d1_ok([{"id": 5}])
        if self.fail_finish and sql.startswith("UPDATE ingest_run"):
            return httpx.Response(500, json={"success": False, "errors": [{"message": "down"}]})
        return d1_ok()


def run(router, env=ENV):
    return main(env=env, http=httpx.Client(transport=httpx.MockTransport(router)), now=lambda: NOW)


def test_missing_env_exits_2_without_network(capsys):
    router = Router(httpx.Response(200, text="{}"))
    env = {k: v for k, v in ENV.items() if k != "D1_DATABASE_ID"}
    assert run(router, env) == 2
    err = capsys.readouterr().err
    assert "D1_DATABASE_ID" in err and "NASS-SECRET" not in err
    assert router.sql == []


def test_success_logs_run_saves_payload_and_prunes(nass_sample):
    router = Router(httpx.Response(200, text=nass_sample))
    assert run(router) == 0
    assert [s.split()[0:3] for s in router.sql] == [
        ["INSERT", "INTO", "ingest_run"],
        ["INSERT", "INTO", "raw_payload"],
        ["DELETE", "FROM", "raw_payload"],
        ["UPDATE", "ingest_run", "SET"],
    ]


def test_source_error_records_redacted_error_and_exits_1(capsys):
    router = Router(httpx.Response(403, text="invalid key NASS-SECRET"))
    seen = []
    original = router.__call__

    def capture(request):
        if request.url.host != "quickstats.nass.usda.gov":
            seen.append(json.loads(request.content))
        return original(request)

    assert main(env=ENV, http=httpx.Client(transport=httpx.MockTransport(capture)), now=lambda: NOW) == 1
    finish = seen[-1]
    assert finish["sql"].startswith("UPDATE ingest_run")
    assert finish["params"][0] == "error"
    assert "NassError: HTTP 403" in finish["params"][2]
    out = capsys.readouterr()
    for text in (json.dumps(seen), out.err, out.out):
        assert "NASS-SECRET" not in text and "CF-SECRET" not in text


def test_failure_to_record_error_still_exits_1(capsys):
    router = Router(httpx.Response(500, text="oops"), fail_finish=True)
    assert run(router) == 1
    assert "could not record failure" in capsys.readouterr().err
