import httpx
import pytest

from harvest_ingest.nass import API_URL, NassError, fetch, request_key

KEY = "SECRET-KEY-123"
PARAMS = {"state_alpha": "IA", "commodity_desc": "CORN", "year": "2026"}


def http(handler):
    return httpx.Client(transport=httpx.MockTransport(handler))


def test_fetch_returns_raw_body_and_sends_key(nass_sample):
    seen = {}

    def handler(request):
        seen["url"] = request.url
        return httpx.Response(200, text=nass_sample)

    result = fetch(http(handler), KEY, PARAMS)

    assert str(seen["url"]).startswith(API_URL)
    assert seen["url"].params["key"] == KEY
    assert seen["url"].params["state_alpha"] == "IA"
    assert result.body == nass_sample
    assert result.request_key == "commodity_desc=CORN&state_alpha=IA&year=2026"


def test_request_key_is_sorted_and_excludes_key():
    assert request_key({"b": "2", "key": KEY, "a": "x y"}) == "a=x+y&b=2"


@pytest.mark.parametrize(
    "response, match",
    [
        (httpx.Response(401, text=f"bad key {KEY}"), "HTTP 401"),
        (httpx.Response(200, text="<html>"), "not JSON"),
        (httpx.Response(200, json={"error": [f"bad request - invalid query {KEY}"]}), "API error"),
        (httpx.Response(200, json=[1, 2]), "unexpected shape"),
    ],
)
def test_errors_raise_without_key(response, match):
    with pytest.raises(NassError, match=match) as info:
        fetch(http(lambda r: response), KEY, PARAMS)
    assert KEY not in str(info.value)


def test_transport_error_redacts_key_from_url():
    def handler(request):
        raise httpx.ConnectError(f"failed {request.url}", request=request)

    with pytest.raises(NassError) as info:
        fetch(http(handler), KEY, PARAMS)
    assert KEY not in str(info.value)
    assert "[REDACTED]" in str(info.value)
