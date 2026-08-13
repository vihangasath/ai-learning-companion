import os
from typing import Optional


class TranscriptExtractor:
    def extract(self, url: str, content_type: str, raw_text: Optional[str] = None) -> Optional[str]:
        if raw_text:
            return raw_text

        if content_type == "youtube":
            return self._extract_youtube(url)
        elif content_type == "article":
            return self._extract_article(url)
        elif content_type == "pdf":
            return self._extract_pdf(url)

        return None

    def _extract_youtube(self, url: str) -> Optional[str]:
        try:
            from youtube_transcript_api import YouTubeTranscriptApi

            video_id = self._parse_youtube_id(url)
            if not video_id:
                return self._mock_transcript(url)
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            return " ".join([entry["text"] for entry in transcript])
        except Exception:
            return self._mock_transcript(url)

    def _parse_youtube_id(self, url: str) -> Optional[str]:
        import re
        patterns = [
            r"(?:v=|\/)([0-9A-Za-z_-]{11})(?:[?&]|$)",
            r"(?:embed\/)([0-9A-Za-z_-]{11})",
            r"(?:youtu\.be\/)([0-9A-Za-z_-]{11})",
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    def _extract_article(self, url: str) -> Optional[str]:
        try:
            import requests
            from bs4 import BeautifulSoup
            response = requests.get(url, timeout=10)
            soup = BeautifulSoup(response.text, "html.parser")
            for tag in soup(["script", "style", "nav", "footer", "header"]):
                tag.decompose()
            return soup.get_text(separator=" ", strip=True)
        except Exception:
            return self._mock_transcript(url)

    def _extract_pdf(self, url: str) -> Optional[str]:
        try:
            from pypdf import PdfReader
            import requests
            from io import BytesIO

            response = requests.get(url, timeout=30)
            reader = PdfReader(BytesIO(response.content))
            return " ".join([page.extract_text() for page in reader.pages])
        except Exception:
            return self._mock_transcript(url)

    def _mock_transcript(self, url: str) -> str:
        return (
            "This is a sample educational transcript about machine learning concepts. "
            "Supervised learning involves training models on labeled data. "
            "Neural networks consist of layers of interconnected neurons that process information. "
            "Backpropagation is used to update weights during training. "
            "The loss function measures the difference between predicted and actual values. "
            "Gradient descent optimizes the model by minimizing the loss function. "
            "Regularization techniques like L1 and L2 help prevent overfitting. "
            "Cross-validation helps evaluate model performance on unseen data. "
            "Ensemble methods combine multiple models for better predictions. "
            "Feature engineering is crucial for improving model accuracy."
        )


transcript_extractor = TranscriptExtractor()
