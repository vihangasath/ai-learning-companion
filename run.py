"""
LearnFlow AI - Unified Backend Runner
Use: python run.py
"""
import uvicorn
import os

if __name__ == "__main__":
    # Ensure the root directory is in the PYTHONPATH
    os.environ["PYTHONPATH"] = os.path.dirname(os.path.abspath(__file__))
    
    print("🚀 Starting LearnFlow AI Unified Backend on http://localhost:8001")
    print("📚 Docs at http://localhost:8001/docs")
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8001, reload=True)
