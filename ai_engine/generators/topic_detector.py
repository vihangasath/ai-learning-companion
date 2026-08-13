import os
import json
from pathlib import Path
from typing import Optional


class TopicDetector:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        prompt_path = Path(__file__).parent.parent / "prompts" / "topic_prompt.txt"
        self.prompt_template = prompt_path.read_text() if prompt_path.exists() else ""

    def detect(self, text: str) -> list[dict]:
        if not self.api_key:
            return self._mock_topics()

        try:
            return self._llm_topics(text)
        except Exception:
            return self._mock_topics()

    def _llm_topics(self, text: str) -> list[dict]:
        from langchain_openai import ChatOpenAI
        from langchain.prompts import ChatPromptTemplate

        llm = ChatOpenAI(
            model=os.getenv("OPENAI_MODEL_NAME", "gpt-4o-mini"),
            temperature=float(os.getenv("LLM_TEMPERATURE", "0.3")),
            api_key=self.api_key,
        )
        prompt = ChatPromptTemplate.from_template(self.prompt_template)
        chain = prompt | llm

        result = chain.invoke({"text": text[:8000]})
        return json.loads(result.content.strip().strip("```json").strip("```").strip())

    def extract_formulas(self, text: str) -> list[dict]:
        try:
            import sys
            sys.path.insert(0, str(Path(__file__).parent.parent.parent))
            from advanced_features.formula_extraction.extractor import FormulaExtractor
            extractor = FormulaExtractor(use_llm=bool(self.api_key), api_key=self.api_key or None)
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
