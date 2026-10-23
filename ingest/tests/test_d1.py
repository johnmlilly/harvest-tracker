import json

import httpx
import pytest

from harvest_ingest.d1 import D1Client, D1Error


def client(handler):
    return D1Client("acct", "db-uuid", "tok", httpx.Client(transport=httpx.MockTransport(handler)))


def test_query_posts_sql_and_returns_rows():
    seen = {}

    def handler(request):
        seen["request"] = request
        return httpx.Response(200, json={"success": True, "errors": [], "result": [{"success": True, "results": [{"id": 7}]}]})

    rows = client(handler).query("SELECT ? AS id", (7,))

    req = seen["request"]
    assert req.method == "POST"
    assert str(req.url) == "https://api.cloudflare.com/client/v4/accounts/acct/d1/database/db-uuid/query"
    assert req.headers["Authorization"] == "Bearer tok"
    assert json.loads(req.content) == {"sql": "SELECT ? AS id", "params": [7]}
    assert rows == [{"id": 7}]


def test_query_without_results_returns_empty_list():
    rows = client(lambda r: httpx.Response(200, json={"success": True, "result": [{"success": True}]})).query("DELETE FROM t")
    assert rows == []


def test_http_error_raises_with_api_message():
    def handler(request):
        return httpx.Response(400, json={"success": False, "errors": [{"code": 7500, "message": "no such table: x"}]})

    with pytest.raises(D1Error, match="HTTP 400: no such table: x"):
        client(handler).query("SELECT * FROM x")


def test_success_false_raises():
    with pytest.raises(D1Error, match="HTTP 200"):
        client(lambda r: httpx.Response(200, json={"success": False, "errors": []})).query("SELECT 1")


def test_non_json_response_raises():
    with pytest.raises(D1Error, match="not JSON"):
        client(lambda r: httpx.Response(502, text="<html>bad gateway</html>")).query("SELECT 1")


def test_transport_error_never_includes_token():
    def handler(request):
        raise httpx.ConnectError("boom", request=request)

    with pytest.raises(D1Error) as info:
        client(handler).query("SELECT 1")
    assert "tok" not in str(info.value)
