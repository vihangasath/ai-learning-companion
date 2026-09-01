from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.core.database import engine, Base
import backend.app.models
from backend.app.api.routes import auth, content, notes, flashcards, quiz, recommendations, analytics, knowledge, memory

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(notes.router, prefix="/api/notes", tags=["Notes"])
app.include_router(flashcards.router, prefix="/api/flashcards", tags=["Flashcards"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["Knowledge Graph"])
app.include_router(memory.router, prefix="/api/memory", tags=["Memory"])


@app.get("/health")
def health_check():
    return {"status": "ok", "app": settings.app_name}
