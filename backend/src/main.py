from fastapi import FastAPI

app = FastAPI(title="Harvest Season Tracker API")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


from workers import asgi  # noqa: E402  (Workers runtime module; import after app is defined)

Default = asgi.entrypoint(app)
