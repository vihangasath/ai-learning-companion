import json
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from backend.app.models.quiz import Quiz, QuizResult


class QuizService:
    def get_by_content_id(self, db: Session, content_id: str, user_id: str) -> Quiz | None:
        return (
            db.query(Quiz)
            .filter(Quiz.content_id == content_id, Quiz.user_id == user_id)
            .first()
        )

    def get_all_by_user(self, db: Session, user_id: str, skip: int = 0, limit: int = 50) -> list[Quiz]:
        return (
            db.query(Quiz)
            .filter(Quiz.user_id == user_id)
            .order_by(Quiz.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def submit_quiz(self, db: Session, user_id: str, quiz_id: str, answers: list[dict]) -> dict:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise ValueError("Quiz not found")

        questions = json.loads(quiz.questions) if isinstance(quiz.questions, str) else quiz.questions
        correct = 0
        total = len(questions)

        for i, q in enumerate(questions):
            user_answer = answers[i] if i < len(answers) else {}
            if user_answer.get("selected") == q.get("correct_answer"):
                correct += 1

        score = round((correct / total) * 100, 2) if total > 0 else 0

        result = QuizResult(
            id=str(uuid.uuid4()),
            quiz_id=quiz_id,
            user_id=user_id,
            score=score,
            total_questions=total,
            correct_answers=correct,
            answers=json.dumps(answers),
        )
        db.add(result)
        db.commit()

        return {
            "quiz_id": quiz_id,
            "score": score,
            "total_questions": total,
            "correct_answers": correct,
            "answers": answers,
            "completed_at": datetime.utcnow(),
        }


quiz_service = QuizService()
