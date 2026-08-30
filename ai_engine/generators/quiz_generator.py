import os
import json
from pathlib import Path


class QuizGenerator:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        prompt_path = Path(__file__).parent.parent / "prompts" / "quiz_prompt.txt"
        self.prompt_template = prompt_path.read_text() if prompt_path.exists() else ""

    def generate(self, text: str) -> list[dict]:
        if not self.api_key:
            return self._mock_quiz()

        try:
            return self._llm_quiz(text)
        except Exception:
            return self._mock_quiz()

    def _llm_quiz(self, text: str) -> list[dict]:
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

    def _mock_quiz(self) -> list[dict]:
        return [
            {
                "question": "What type of learning uses labeled training data?",
                "options": ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Transfer learning"],
                "correct_answer": "Supervised learning",
                "type": "multiple_choice",
                "explanation": "Supervised learning uses labeled datasets where each training example has an input-output pair.",
            },
            {
                "question": "Backpropagation is used to update weights in a neural network.",
                "options": ["True", "False"],
                "correct_answer": "True",
                "type": "true_false",
                "explanation": "Backpropagation computes gradients of the loss with respect to each weight, enabling gradient-based optimization.",
            },
            {
                "question": "Which technique helps prevent overfitting by adding a penalty to the loss function?",
                "options": ["Regularization", "Normalization", "Standardization", "Vectorization"],
                "correct_answer": "Regularization",
                "type": "multiple_choice",
                "explanation": "Regularization (L1, L2) adds a penalty term to the loss function to discourage complex models.",
            },
            {
                "question": "What does cross-validation evaluate?",
                "options": ["Model performance on unseen data", "Training speed", "Memory usage", "Code quality"],
                "correct_answer": "Model performance on unseen data",
                "type": "multiple_choice",
                "explanation": "Cross-validation partitions data into training and validation sets to estimate out-of-sample performance.",
            },
            {
                "question": "Ensemble methods combine multiple models to improve predictions.",
                "options": ["True", "False"],
                "correct_answer": "True",
                "type": "true_false",
                "explanation": "Ensemble methods like Random Forest and Gradient Boosting combine multiple models for better accuracy and robustness.",
            },
        ]


quiz_generator = QuizGenerator()
