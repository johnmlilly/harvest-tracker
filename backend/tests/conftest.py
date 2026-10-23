import sys
import types

# `workers` only exists inside the Python Workers runtime. Stub it so tests can import main.py.
if "workers" not in sys.modules:
    try:
        import workers  # noqa: F401
    except ImportError:
        stub = types.ModuleType("workers")
        stub.asgi = types.SimpleNamespace(entrypoint=lambda app: app)
        sys.modules["workers"] = stub
