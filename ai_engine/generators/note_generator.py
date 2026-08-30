import os
import json
from pathlib import Path


class NoteGenerator:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        prompt_path = Path(__file__).parent.parent / "prompts" / "note_prompt.txt"
        self.prompt_template = prompt_path.read_text() if prompt_path.exists() else ""

    def generate(self, text: str, title_hint: str = "") -> dict:
        if not self.api_key:
            return self._mock_notes(title_hint)

        try:
            return self._llm_notes(text)
        except Exception:
            return self._mock_notes(title_hint)

    def _llm_notes(self, text: str) -> dict:
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

    def _mock_notes(self, title_hint: str = "") -> dict:
        return {
            "title": title_hint or "Machine Learning Fundamentals",
            "sections": [
                {
                    "heading": "Supervised Learning",
                    "points": [
                    "Training on labeled datasets with input-output pairs",
                    "Common algorithms: Linear Regression, Decision Trees, SVM",
                    "Goal is to learn a mapping function from inputs to outputs",
                ]},
                {
                    "heading": "Neural Networks",
                    "points": [
                    "Composed of input, hidden, and output layers",
                    "Neurons use activation functions (ReLU, Sigmoid, Tanh)",
                    "Weights are adjusted through backpropagation",
                ]},
                {
                    "heading": "Optimization",
                    "points": [
                    "Loss functions measure prediction error (MSE, Cross-entropy)",
                    "Gradient descent iteratively minimizes the loss",
                    "Learning rate controls step size during optimization",
                ]},
                {
                    "heading": "Model Evaluation",
                    "points": [
                    "Cross-validation splits data into training and validation sets",
                    "Metrics include accuracy, precision, recall, F1-score",
                    "Regularization prevents overfitting (L1, L2, Dropout)",
                ]},
            ],
        }


note_generator = NoteGenerator()
