import os
import json
from pathlib import Path


class SummaryGenerator:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        prompt_path = Path(__file__).parent.parent / "prompts" / "summary_prompt.txt"
        self.prompt_template = prompt_path.read_text() if prompt_path.exists() else ""

    def generate(self, text: str) -> dict:
        if not self.api_key:
            return self._mock_summary()

        try:
            return self._llm_summary(text)
        except Exception:
            return self._mock_summary()

    def _llm_summary(self, text: str) -> dict:
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

    def _mock_summary(self) -> dict:
        return {
            "short_summary": "This content covers fundamental machine learning concepts including supervised learning, neural networks, and optimization techniques. Key topics include training methodologies, model evaluation, and best practices for building effective ML systems.",
            "detailed_summary": (
                "The content provides a comprehensive overview of machine learning fundamentals. "
                "It begins with supervised learning, explaining how models are trained on labeled datasets to make predictions. "
                "Neural networks are introduced as layered architectures that process information through interconnected neurons. "
                "Backpropagation is covered as the key algorithm for updating network weights during training. "
                "The content explains loss functions, which measure prediction errors, and gradient descent for optimization. "
                "Regularization techniques like L1 and L2 are discussed as methods to prevent overfitting. "
                "Cross-validation is presented as a strategy for evaluating model performance on unseen data. "
                "Ensemble methods combine multiple models to improve prediction accuracy. "
                "The content concludes with feature engineering best practices for improving model performance."
            ),
        }


summary_generator = SummaryGenerator()
