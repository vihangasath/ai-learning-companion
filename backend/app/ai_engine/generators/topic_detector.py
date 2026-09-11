import os
import json
from pathlib import Path
from typing import Optional

from backend.app.ai_engine.models.llm_config import llm_config, build_chat_model, extract_text


class TopicDetector:
    def __init__(self):
        prompt_path = Path(__file__).parent.parent / "prompts" / "topic_prompt.txt"
        self.prompt_template = prompt_path.read_text() if prompt_path.exists() else ""

    def detect(self, text: str) -> list[dict]:
        if llm_config.active_provider == "mock":
            return self._mock_topics()

        try:
            return self._llm_topics(text)
        except Exception:
            return self._mock_topics()

    def _llm_topics(self, text: str) -> list[dict]:
        from langchain_core.prompts import ChatPromptTemplate

        llm = build_chat_model()
        prompt = ChatPromptTemplate.from_template(self.prompt_template)
        chain = prompt | llm

        result = chain.invoke({"text": text[:8000]})
        return json.loads(extract_text(result).strip().strip("```json").strip("```").strip())

    def extract_formulas(self, text: str) -> list[dict]:
        try:
            from backend.app.advanced_features.formula_extraction.extractor import FormulaExtractor
            api_key = llm_config.gemini_api_key or llm_config.openai_api_key
            extractor = FormulaExtractor(use_llm=bool(api_key), api_key=api_key or None)
            return extractor.extract(text)
        except Exception:
            return self._mock_formulas()

    def _mock_topics(self) -> list[dict]:
        return [
            {"topic": "Supervised Learning", "keywords": ["labeled data", "training", "classification", "regression"], "confidence": 0.95},
            {"topic": "Neural Networks", "keywords": ["layers", "neurons", "activation functions", "deep learning"], "confidence": 0.92},
            {"topic": "Optimization", "keywords": ["gradient descent", "loss function", "learning rate", "convergence"], "confidence": 0.88},
            {"topic": "Model Evaluation", "keywords": ["cross-validation", "overfitting", "regularization", "metrics"], "confidence": 0.85},
            {"topic": "Feature Engineering", "keywords": ["feature selection", "transformation", "scaling", "encoding"], "confidence": 0.78},
        ]

    def _mock_formulas(self) -> list[dict]:
        return [
            {
                "name": "Mean Squared Error",
                "raw_text": "MSE = (1/n) * sum(y_i - y_pred_i)^2",
                "latex": "MSE = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2",
                "display_math": "$$MSE = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2$$",
                "source": "mock",
            },
            {
                "name": "Gradient Descent Update",
                "raw_text": "theta = theta - alpha * grad(J)",
                "latex": "\\theta := \\theta - \\alpha \\nabla J(\\theta)",
                "display_math": "$$\\theta := \\theta - \\alpha \\nabla J(\\theta)$$",
                "source": "mock",
            },
        ]


topic_detector = TopicDetector()
