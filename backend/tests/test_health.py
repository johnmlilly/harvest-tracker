from fastapi import FastAPI
from fastapi.testclient import TestClient


def test_health_route_shape():
    # Imports the app without the Workers runtime; main.py's `workers` import is stubbed in conftest.
    from main import app

    assert isinstance(app, FastAPI)
    resp = TestClient(app).get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}
