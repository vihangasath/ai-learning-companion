import pytest
import os
import tempfile
import importlib
import sys
from unittest.mock import patch, MagicMock

# Resolve path to include advanced-features folder
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

# Dynamic imports to handle hyphenated folder names
formula_formatter = importlib.import_module("formula-extraction.formatter")
format_to_latex = formula_formatter.format_to_latex
wrap_math_block = formula_formatter.wrap_math_block

formula_extractor = importlib.import_module("formula-extraction.extractor")
FormulaExtractor = formula_extractor.FormulaExtractor

# Import semantic-search
query_embedder = importlib.import_module("semantic-search.query_embedder")
QueryEmbedder = query_embedder.QueryEmbedder

index_manager = importlib.import_module("semantic-search.index_manager")
IndexManager = index_manager.IndexManager

search_engine = importlib.import_module("semantic-search.search_engine")
SemanticSearchEngine = search_engine.SemanticSearchEngine

# Import mind-maps
mind_maps_generator = importlib.import_module("mind-maps.generator")
generate_mind_map_from_text = mind_maps_generator.generate_mind_map_from_text

mind_maps_layout = importlib.import_module("mind-maps.layout")
calculate_tree_layout = mind_maps_layout.calculate_tree_layout

mind_maps_renderer = importlib.import_module("mind-maps.renderer")
MindMapRenderer = mind_maps_renderer.MindMapRenderer

# Import smart-bookmarks
bookmark_manager = importlib.import_module("smart-bookmarks.bookmark_manager")
BookmarkManager = bookmark_manager.BookmarkManager

# Import research-summarizer
pdf_extractor = importlib.import_module("research-summarizer.pdf_extractor")
PDFExtractor = pdf_extractor.PDFExtractor

section_parser = importlib.import_module("research-summarizer.section_parser")
SectionParser = section_parser.SectionParser

summarizer = importlib.import_module("research-summarizer.summarizer")
ResearchPaperSummarizer = summarizer.ResearchPaperSummarizer

findings_extractor = importlib.import_module("research-summarizer.findings_extractor")
FindingsExtractor = findings_extractor.FindingsExtractor

# Import voice-interaction
speech_recognizer = importlib.import_module("voice-interaction.speech_recognizer")
VoiceSpeechRecognizer = speech_recognizer.VoiceSpeechRecognizer

tts_engine = importlib.import_module("voice-interaction.tts_engine")
VoiceTTSEngine = tts_engine.VoiceTTSEngine

command_parser = importlib.import_module("voice-interaction.command_parser")
VoiceCommandParser = command_parser.VoiceCommandParser


# --- 1. Formula Extraction Tests ---

def test_formula_extraction():
    extractor = FormulaExtractor(use_llm=False)
    
    # Textual triggers
    results1 = extractor.extract("Force equals mass times acceleration is the classic law.")
    assert len(results1) == 1
    assert results1[0]["latex"] == "F = ma"
    
    # Direct symbol match
    results2 = extractor.extract("What about E = mc^2?")
    assert len(results2) == 1
    assert results2[0]["latex"] == "E = mc^{2}"
    
    # Formatter checks
    assert format_to_latex("A = pi * r^2") == "A = \\pi r^{2}"
    assert format_to_latex("sqrt(x)") == "\\sqrt{x}"
    assert wrap_math_block("E=mc^2") == "$$E=mc^2$$"


# --- 2. Semantic Search Tests ---

def test_semantic_search():
    # Use index manager with a temporary directory to avoid database conflicts
    with tempfile.TemporaryDirectory() as tmpdir:
        engine = SemanticSearchEngine(api_key=None, collection_name="test_collection", persist_directory=tmpdir)
        
        # Index document (uses mock embeddings under the hood)
        engine.index_document("doc-1", "Introduction to Machine Learning", {"topic": "ML"})
        engine.index_document("doc-2", "Gradient Descent Optimization", {"topic": "ML"})
        engine.index_document("doc-3", "Data Science and NumPy tutorial", {"topic": "Python"})
        
        # Run query search
        res = engine.search("optimization techniques", n_results=2)
        assert len(res) >= 1
        # Document 2 should be returned
        assert any(item["id"] == "doc-2" for item in res)
        
        # Filter search
        res_filtered = engine.search("machine learning", n_results=2, filters={"topic": "Python"})
        assert len(res_filtered) == 1
        assert res_filtered[0]["id"] == "doc-3"


# --- 3. Mind Map Tests ---

def test_mind_maps():
    text = "# Deep Learning\n- Convolutional Neural Networks\n- Recurrent Neural Networks\n- Transformers"
    
    # Test generator (mock)
    mind_map = generate_mind_map_from_text(text, api_key=None)
    assert "nodes" in mind_map
    assert len(mind_map["nodes"]) >= 2
    
    # Test layout
    nodes = [{"id": "1", "label": "ML"}, {"id": "2", "label": "Supervised"}, {"id": "3", "label": "Unsupervised"}]
    edges = [{"source": "1", "target": "2"}, {"source": "1", "target": "3"}]
    positioned = calculate_tree_layout(nodes, edges)
    
    assert "position" in positioned[0]
    assert positioned[0]["position"]["y"] == 0
    assert positioned[1]["position"]["y"] == 120
    
    # Test renderer
    rf_json = MindMapRenderer.to_react_flow(positioned, edges)
    assert "nodes" in rf_json
    assert rf_json["nodes"][0]["data"]["label"] == "ML"
    
    mermaid_str = MindMapRenderer.to_mermaid(nodes, edges)
    assert "graph TD" in mermaid_str


# --- 4. Smart Bookmarks Tests ---

def test_smart_bookmarks():
    manager = BookmarkManager(use_llm=False)
    
    # Create definition bookmark
    bm1 = manager.create_bookmark("user-1", "content-1", "http://url", "Photosynthesis is defined as the process where plants make food.", timestamp_seconds=12)
    assert bm1["category"] == "Definition"
    
    # Create formula bookmark
    bm2 = manager.create_bookmark("user-1", "content-1", "http://url", "F = ma", timestamp_seconds=45)
    assert bm2["category"] == "Formula"
    
    # Create question bookmark
    bm3 = manager.create_bookmark("user-1", "content-1", "http://url", "What is the capital of France?", timestamp_seconds=90)
    assert bm3["category"] == "Question"
    
    # Retrieve and delete
    assert manager.get_bookmark(bm1["id"]) is not None
    assert manager.delete_bookmark(bm1["id"]) is True
    assert manager.get_bookmark(bm1["id"]) is None


# --- 5. Research Summarizer Tests ---

def test_research_summarizer():
    raw_text = "Abstract\nThis paper introduces a new approach to NLP.\n1. Introduction\nNatural Language Processing has evolved.\nReferences\n1. Smith et al."
    
    # Test section parsing
    sections = SectionParser.parse_sections(raw_text)
    assert "Abstract" in sections
    assert "Introduction" in sections
    assert "References" in sections
    
    # Test summarization (mock)
    summarizer = ResearchPaperSummarizer(use_llm=False)
    summary = summarizer.summarize_sections(sections)
    assert "Abstract" in summary
    assert "Introduction" in summary
    
    # Test findings extraction (mock)
    extractor = FindingsExtractor(use_llm=False)
    findings = extractor.extract_findings(raw_text)
    assert "contributions" in findings
    assert "key_findings" in findings


# --- 6. Voice Interaction Tests ---

def test_voice_interaction():
    # Test command parser
    parser = VoiceCommandParser(use_llm=False)
    
    cmd1 = parser.parse_command("Please explain this concept to me again.")
    assert cmd1["intent"] == "EXPLAIN_AGAIN"
    
    cmd2 = parser.parse_command("I want to do a quiz now.")
    assert cmd2["intent"] == "GENERATE_QUIZ"
    
    # Test speech recognizer (mock transcription)
    recognizer = VoiceSpeechRecognizer(api_key=None)
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        f.write(b"dummy audio content")
        file_path = f.name
        
    try:
        transcription = recognizer.transcribe_audio(file_path)
        assert len(transcription) > 0
    finally:
        os.remove(file_path)
        
    # Test TTS engine (mock synthesis)
    tts = VoiceTTSEngine(api_key=None)
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
        output_path = f.name
        
    try:
        success = tts.synthesize_speech("Hello world", output_path)
        assert success is True
        assert os.path.exists(output_path)
    finally:
        os.remove(output_path)
