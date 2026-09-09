"""
LearnFlow AI - Unified Backend Runner
Use: python run.py
"""
import uvicorn
import os

if __name__ == "__main__":
    # Ensure the root directory is in the PYTHONPATH
    os.environ["PYTHONPATH"] = os.path.dirname(os.path.abspath(__file__))

    # Default port 8000 to match the dashboard API client; override with PORT env var.
    port = int(os.environ.get("PORT", "8000"))
    # Auto-reload is disabled to avoid spawning competing workers (multiple stale
    # processes kept fighting for the port in this environment). Restart to apply changes.
    reload = os.environ.get("RELOAD", "").lower() in ("1", "true", "yes")

    print(f"Starting LearnFlow AI Unified Backend on http://localhost:{port}")
    print(f"Docs at http://localhost:{port}/docs")
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=reload)
