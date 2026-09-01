import re
from typing import Optional


class TextCleaner:
    def clean(self, text: Optional[str]) -> str:
        if not text:
            return ""

        text = self._remove_timestamps(text)
        text = self._remove_html_tags(text)
        text = self._normalize_whitespace(text)
        text = self._remove_noise(text)
        text = self._fix_unicode(text)

        return text.strip()

    def _remove_timestamps(self, text: str) -> str:
        patterns = [
            r"\d{1,2}:\d{2}(?::\d{2})?",  # 00:00 or 00:00:00
            r"\[\d{1,2}:\d{2}(?::\d{2})?\]",  # [00:00]
            r"\(\d{1,2}:\d{2}(?::\d{2})?\)",  # (00:00)
        ]
        for pattern in patterns:
            text = re.sub(pattern, "", text)
        return text

    def _remove_html_tags(self, text: str) -> str:
        return re.sub(r"<[^>]+>", "", text)

    def _normalize_whitespace(self, text: str) -> str:
        text = re.sub(r"\n+", "\n", text)
        text = re.sub(r"\r", "", text)
        text = re.sub(r"\t", " ", text)
        text = re.sub(r" +", " ", text)
        return text

    def _remove_noise(self, text: str) -> str:
        noise_patterns = [
            r"\[Music\]",
            r"\[Applause\]",
            r"\[Laughter\]",
            r"\[ __ \]",
            r"♪.*?♪",
            r"♫.*?♫",
        ]
        for pattern in noise_patterns:
            text = re.sub(pattern, "", text, flags=re.IGNORECASE)
        return text

    def _fix_unicode(self, text: str) -> str:
        replacements = {
            "\u2018": "'",
            "\u2019": "'",
            "\u201c": '"',
            "\u201d": '"',
            "\u2013": "-",
            "\u2014": "--",
            "\u2026": "...",
            "\u00a0": " ",
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        return text


text_cleaner = TextCleaner()
