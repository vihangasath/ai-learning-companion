"""Quick test runner for LearnFlow AI backend & AI engine."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))

os.environ["DATABASE_URL"] = "sqlite:///./test_learnflow.db"

passed = 0
failed = 0


def test(name, fn):
    global passed, failed
    try:
        fn()
        print(f"  PASS  {name}")
        passed += 1
    except Exception as e:
        print(f"  FAIL  {name}: {e}")
        failed += 1


def suite_ai_engine():
    print("\n=== AI Engine ===")
    from ai_engine.processors.text_cleaner import text_cleaner
    from ai_engine.processors.chunker import text_chunker
    from ai_engine.processors.embedding_generator import embedding_generator
    from ai_engine.generators.summary_generator import summary_generator
    from ai_engine.generators.note_generator import note_generator
    from ai_engine.generators.flashcard_generator import flashcard_generator
    from ai_engine.generators.quiz_generator import quiz_generator
    from ai_engine.generators.topic_detector import topic_detector
    from ai_engine.pipelines.content_pipeline import ContentPipeline

    SAMPLE = "Machine learning is a subset of artificial intelligence."

    test("text_cleaner", lambda: (
        lambda c: (None if "Hello" in c and "<p>" not in c else 1/0)
    )(text_cleaner.clean("<p>Hello World</p>\n[Music]")))

    test("text_chunker", lambda: (
        lambda c: (None if len(c) > 0 and "chunk_index" in c[0] else 1/0)
    )(text_chunker.chunk(SAMPLE * 50)))

    test("embedding_generator", lambda: (
        lambda e: (None if len(e) == 1 and len(e[0]) == 1536 else 1/0)
    )(embedding_generator.generate([SAMPLE])))

    test("summary_generator", lambda: (
        lambda r: (None if "short_summary" in r and "detailed_summary" in r else 1/0)
    )(summary_generator.generate(SAMPLE)))

    test("note_generator", lambda: (
        lambda r: (None if "title" in r and "sections" in r else 1/0)
    )(note_generator.generate(SAMPLE)))

    test("flashcard_generator", lambda: (
        lambda r: (None if len(r) > 0 and "question" in r[0] else 1/0)
    )(flashcard_generator.generate(SAMPLE)))

    test("quiz_generator", lambda: (
        lambda r: (None if len(r) > 0 and "question" in r[0] else 1/0)
    )(quiz_generator.generate(SAMPLE)))

    test("topic_detector", lambda: (
        lambda r: (None if len(r) > 0 and "topic" in r[0] else 1/0)
    )(topic_detector.detect(SAMPLE)))

    test("formula_extraction", lambda: (
        lambda f: (None if len(f) > 0 and "name" in f[0] else 1/0)
    )(topic_detector.extract_formulas(SAMPLE)))

    test("content_pipeline", lambda: (
        lambda r: (None if all(k in r for k in ["title", "summary", "detailed_notes", "flashcards", "quiz", "topics", "formulas"]) else 1/0)
    )(ContentPipeline().run("https://example.com", "article", raw_text=SAMPLE)))


def suite_backend():
    print("\n=== Backend API ===")
    from backend.app.core.database import engine, Base
    import backend.app.models
    Base.metadata.create_all(bind=engine)

    from fastapi.testclient import TestClient
    from backend.app.main import app
    client = TestClient(app)

    test("health_check", lambda: (
        lambda r: (None if r.status_code == 200 and r.json()["status"] == "ok" else 1/0)
    )(client.get("/health")))

    test("register", lambda: (
        lambda r: (None if r.status_code == 201 else 1/0)
    )(client.post("/api/auth/register", json={
        "email": "test@example.com", "password": "test12345", "name": "Test"
    })))

    test("analyze_content", lambda: (
        lambda r: (None if r.status_code == 200 and "content_id" in r.json()["data"] else 1/0)
    )(client.post("/api/content/analyze", json={
        "url": "https://youtube.com/watch?v=test", "content_type": "youtube"
    })))

    test("get_notes", lambda: (
        lambda r: (None if r.status_code == 200 else 1/0)
    )(client.get("/api/notes/user/all")))

    test("recommendations", lambda: (
        lambda r: (None if r.status_code == 200 else 1/0)
    )(client.get("/api/recommendations")))

    test("analytics_event", lambda: (
        lambda r: (None if r.status_code == 200 else 1/0)
    )(client.post("/api/analytics/event", json={
        "event_type": "video_play", "content_id": "test123",
        "session_id": "s1", "metadata": {}
    })))

    for ep in ["study-time", "focus", "streaks", "performance", "subjects", "recent", "heatmap"]:
        test(f"analytics_{ep}", lambda e=ep: (
            lambda r: (None if r.status_code == 200 else 1/0)
        )(client.get(f"/api/analytics/{e}")))


if __name__ == "__main__":
    suite_ai_engine()
    suite_backend()
    total = passed + failed
    print(f"\n{'='*40}\n{passed}/{total} passed")
    sys.exit(0 if failed == 0 else 1)
