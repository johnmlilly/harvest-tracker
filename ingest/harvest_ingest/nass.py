"""USDA NASS Quick Stats fetch. Returns the raw body; parsing lives elsewhere."""

import json
from dataclasses import dataclass
from urllib.parse import urlencode

import httpx

API_URL = "https://quickstats.nass.usda.gov/api/api_GET/"


class NassError(Exception):
    pass


@dataclass(frozen=True)
class FetchResult:
    request_key: str
    body: str


def request_key(params: dict[str, str]) -> str:
    return urlencode(sorted((k, v) for k, v in params.items() if k != "key"))


def redact(text: str, secret: str) -> str:
    return text.replace(secret, "[REDACTED]") if secret else text


def fetch(http: httpx.Client, api_key: str, params: dict[str, str]) -> FetchResult:
    try:
        resp = http.get(API_URL, params={**params, "key": api_key})
    except httpx.HTTPError as exc:
        # httpx error text can include the full URL, which carries the key.
        raise NassError(redact(f"request failed: {exc}", api_key)) from None

    if resp.status_code != 200:
        raise NassError(redact(f"HTTP {resp.status_code}: {resp.text[:200]}", api_key))
    try:
        payload = json.loads(resp.text)
    except ValueError:
        raise NassError("response was not JSON") from None
    if not isinstance(payload, dict) or "error" in payload:
        detail = payload.get("error") if isinstance(payload, dict) else "unexpected shape"
        raise NassError(redact(f"API error: {detail}", api_key))

    return FetchResult(request_key=request_key(params), body=resp.text)
