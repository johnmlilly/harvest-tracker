"""Minimal Cloudflare D1 REST client (single statement per request)."""

from typing import Any, Sequence

import httpx

API_BASE = "https://api.cloudflare.com/client/v4"


class D1Error(Exception):
    pass


class D1Client:
    def __init__(self, account_id: str, database_id: str, api_token: str, http: httpx.Client):
        self._url = f"{API_BASE}/accounts/{account_id}/d1/database/{database_id}/query"
        self._headers = {"Authorization": f"Bearer {api_token}"}
        self._http = http

    def query(self, sql: str, params: Sequence[Any] = ()) -> list[dict[str, Any]]:
        try:
            resp = self._http.post(self._url, headers=self._headers, json={"sql": sql, "params": list(params)})
        except httpx.HTTPError as exc:
            raise D1Error(f"request failed: {exc}") from exc

        try:
            payload = resp.json()
        except ValueError:
            raise D1Error(f"HTTP {resp.status_code}: response was not JSON") from None

        if resp.status_code != 200 or not payload.get("success"):
            messages = "; ".join(e.get("message", "") for e in payload.get("errors") or []) or "no error message"
            raise D1Error(f"HTTP {resp.status_code}: {messages}")

        results = payload.get("result") or [{}]
        if results[0].get("success") is False:
            raise D1Error("statement failed")
        return results[0].get("results") or []
