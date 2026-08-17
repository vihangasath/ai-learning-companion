from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_register_user():
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "testpassword123",
        "name": "Test User",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"


def test_login():
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "testpassword123",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "access_token" in data["data"]


def test_analyze_content():
    response = client.post("/api/content/analyze", json={
        "url": "https://youtube.com/watch?v=test123",
        "content_type": "youtube",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "content_id" in data["data"]
    assert "flashcards" in data["data"]
    assert "quiz" in data["data"]


def test_get_notes():
    response = client.get("/api/notes/user/all")
    assert response.status_code == 200


def test_get_recommendations():
    response = client.get("/api/recommendations")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


def test_record_analytics_event():
    response = client.post("/api/analytics/event", json={
        "event_type": "video_play",
        "content_id": "test123",
        "session_id": "session-1",
        "metadata": {"duration": 30},
    })
    assert response.status_code == 200


def test_analytics_endpoints():
    for endpoint in ["/api/analytics/study-time", "/api/analytics/focus",
                     "/api/analytics/streaks", "/api/analytics/performance",
                     "/api/analytics/subjects", "/api/analytics/recent",
                     "/api/analytics/heatmap"]:
        response = client.get(endpoint)
        assert response.status_code == 200, f"{endpoint} failed"
