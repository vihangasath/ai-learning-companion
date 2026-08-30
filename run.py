
"""
Windows-friendly server runner - No PATH issues
Use: python run.py
Instead of: uvicorn main:app --reload --port 8001
"""
import uvicorn

if __name__ == "__main__":
    print("🚀 Starting LearnFlow AI Member 3 Backend on http://localhost:8001")
    print("📚 Docs at http://localhost:8001/docs")
    print("🔌 DB Check: Check console for 'Connecting to DB: ...'")
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
