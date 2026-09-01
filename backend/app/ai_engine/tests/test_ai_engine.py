from backend.app.ai_engine.processors.text_cleaner import text_cleaner
from backend.app.ai_engine.processors.chunker import text_chunker
from backend.app.ai_engine.processors.embedding_generator import embedding_generator
from backend.app.ai_engine.generators.summary_generator import summary_generator
from backend.app.ai_engine.generators.note_generator import note_generator
from backend.app.ai_engine.generators.flashcard_generator import flashcard_generator
from backend.app.ai_engine.generators.quiz_generator import quiz_generator
from backend.app.ai_engine.generators.topic_detector import topic_detector
from backend.app.ai_engine.pipelines.content_pipeline import ContentPipeline


SAMPLE_TEXT = (
    "Machine learning is a subset of artificial intelligence. "
    "Supervised learning uses labeled data to train models. "
    "Neural networks are composed of layers of interconnected neurons. "
    "Backpropagation is used to update weights during training. "
    "Gradient descent minimizes the loss function iteratively."
)


def test_text_cleaner():
    dirty = "<p>Hello  World</p>  \n\n[Music]"
    cleaned = text_cleaner.clean(dirty)
    assert "Hello World" in cleaned
    assert "<p>" not in cleaned
    assert "[Music]" not in cleaned


def test_text_chunker():
    chunks = text_chunker.chunk(SAMPLE_TEXT)
    assert len(chunks) > 0
    assert "chunk_index" in chunks[0]
    assert "text" in chunks[0]


def test_embedding_generator():
    embeddings = embedding_generator.generate([SAMPLE_TEXT])
    assert len(embeddings) == 1
    assert len(embeddings[0]) == 1536


def test_summary_generator():
    result = summary_generator.generate(SAMPLE_TEXT)
    assert "short_summary" in result
    assert "detailed_summary" in result


def test_note_generator():
    result = note_generator.generate(SAMPLE_TEXT)
    assert "title" in result
    assert "sections" in result


def test_flashcard_generator():
    result = flashcard_generator.generate(SAMPLE_TEXT)
    assert len(result) > 0
    assert "question" in result[0]
    assert "answer" in result[0]


def test_quiz_generator():
    result = quiz_generator.generate(SAMPLE_TEXT)
    assert len(result) > 0
    assert "question" in result[0]
    assert "options" in result[0]


def test_topic_detector():
    result = topic_detector.detect(SAMPLE_TEXT)
    assert len(result) > 0
    assert "topic" in result[0]
    assert "keywords" in result[0]


def test_formula_extraction():
    formulas = topic_detector.extract_formulas(SAMPLE_TEXT)
    assert len(formulas) > 0
    assert "name" in formulas[0]
    assert "latex" in formulas[0]


def test_content_pipeline():
    pipeline = ContentPipeline()
    result = pipeline.run(
        url="https://example.com/test",
        content_type="article",
        raw_text=SAMPLE_TEXT,
    )
    assert "title" in result
    assert "summary" in result
    assert "detailed_notes" in result
    assert "flashcards" in result
    assert "quiz" in result
    assert "topics" in result
    assert "formulas" in result
