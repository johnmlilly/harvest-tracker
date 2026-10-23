from pathlib import Path

import pytest


class FakeDB:
    """Records queries; returns queued rows (default: none)."""

    def __init__(self, responses=None):
        self.calls = []
        self._responses = list(responses or [])

    def query(self, sql, params=()):
        self.calls.append((sql, tuple(params)))
        return self._responses.pop(0) if self._responses else []


@pytest.fixture
def nass_sample() -> str:
    return (Path(__file__).parent / "fixtures" / "nass_sample.json").read_text()
