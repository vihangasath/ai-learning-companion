import os
import json
from pathlib import Path

from backend.app.ai_engine.models.llm_config import llm_config, build_chat_model, extract_text


class FlashcardGenerator:
    def __init__(self):
        prompt_path = Path(__file__).parent.parent / "prompts" / "flashcard_prompt.txt"
        self.prompt_template = prompt_path.read_text() if prompt_path.exists() else ""

    def generate(self, text: str) -> list[dict]:
        if llm_config.active_provider == "mock":
            return self._mock_flashcards()

        try:
            return self._llm_flashcards(text)
        except Exception:
            return self._mock_flashcards()

    def _llm_flashcards(self, text: str) -> list[dict]:
        from langchain_core.prompts import ChatPromptTemplate

        llm = build_chat_model()
        prompt = ChatPromptTemplate.from_template(self.prompt_template)
        chain = prompt | llm

        result = chain.invoke({"text": text[:8000]})
        return json.loads(extract_text(result).strip().strip("```json").strip("```").strip())

    def _mock_flashcards(self) -> list[dict]:
        return [
            {"question": "What is supervised learning?", "answer": "Training models on labeled data where input-output pairs are provided.", "difficulty": "easy"},
            {"question": "What is the role of backpropagation in neural networks?", "answer": "It calculates gradients of the loss function with respect to weights to update them during training.", "difficulty": "medium"},
            {"question": "Explain the bias-variance tradeoff.", "answer": "Bias is error from wrong assumptions; variance is error from sensitivity to training data. Tradeoff balances underfitting and overfitting.", "difficulty": "hard"},
            {"question": "What does a loss function measure?", "answer": "The difference between predicted and actual values in a model.", "difficulty": "easy"},
            {"question": "How does L1 regularization differ from L2 regularization?", "answer": "L1 adds absolute weight penalties (sparsity), L2 adds squared weight penalties (smaller but non-zero weights).", "difficulty": "medium"},
            {"question": "What is gradient descent?", "answer": "An optimization algorithm that iteratively moves toward the minimum of a loss function by following the negative gradient.", "difficulty": "medium"},
            {"question": "Define cross-validation.", "answer": "A technique to evaluate model performance by partitioning data into training and validation subsets multiple times.", "difficulty": "easy"},
            {"question": "What are ensemble methods?", "answer": "Techniques that combine multiple models to produce better predictions than any single model (e.g., Random Forest, Boosting).", "difficulty": "medium"},
            {"question": "What is the vanishing gradient problem?", "answer": "Gradients become extremely small in deep networks, preventing earlier layers from learning effectively.", "difficulty": "hard"},
            {"question": "What is feature engineering?", "answer": "The process of selecting, modifying, or creating features to improve machine learning model performance.", "difficulty": "easy"},
        ]


flashcard_generator = FlashcardGenerator()
