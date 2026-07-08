import sys
import os
import importlib
from datetime import date, datetime

# Ensure parent directory is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "advanced-features")))

print("==================================================================")
print("             LearnFlow AI - Member 4 Demo Runner                 ")
print("==================================================================\n")

# --- 1. Analytics Engine Verification ---
print("--- 1. Running Analytics Engine Visualizations ---")
from analytics.visualizations.weekly_activity import get_weekly_activity_data
from analytics.visualizations.subject_performance import get_subject_performance_data
from analytics.visualizations.topic_distribution import get_topic_distribution_data
from analytics.visualizations.focus_gauge import get_focus_gauge_data

sessions = [
    {
        "start_time": "2026-07-08T09:00:00",
        "end_time": "2026-07-08T09:45:00",
        "active_time_minutes": 40.0,
        "focus_rate": 88.89,
        "completion_rate": 90.0,
        "topic": "Linear Algebra",
        "subject": "Mathematics"
    },
    {
        "start_time": "2026-07-07T14:00:00",
        "end_time": "2026-07-07T15:00:00",
        "active_time_minutes": 50.0,
        "focus_rate": 83.33,
        "completion_rate": 100.0,
        "topic": "Gradient Descent",
        "subject": "Machine Learning"
    }
]
events = [
    {"event_type": "tab_hidden", "timestamp": "2026-07-08T09:15:00"},
    {"event_type": "user_idle", "timestamp": "2026-07-08T09:30:00"},
    {"event_type": "user_active", "timestamp": "2026-07-08T09:33:00"}
]

print("\nWeekly Activity Output:")
print(get_weekly_activity_data(sessions, target_date=date(2026, 7, 8)))

print("\nTopic Distribution Output:")
print(get_topic_distribution_data(sessions))

print("\nFocus Gauge Output:")
print(get_focus_gauge_data(sessions, events))
print("\n" + "-"*50 + "\n")

# --- 2. Advanced Features Verification ---

# Dynamic imports for hyphenated folders
formula_extractor_mod = importlib.import_module("formula-extraction.extractor")
FormulaExtractor = formula_extractor_mod.FormulaExtractor

search_engine_mod = importlib.import_module("semantic-search.search_engine")
SemanticSearchEngine = search_engine_mod.SemanticSearchEngine

mind_maps_gen = importlib.import_module("mind-maps.generator")
generate_mind_map_from_text = mind_maps_gen.generate_mind_map_from_text

mind_maps_layout = importlib.import_module("mind-maps.layout")
calculate_tree_layout = mind_maps_layout.calculate_tree_layout

mind_maps_renderer = importlib.import_module("mind-maps.renderer")
MindMapRenderer = mind_maps_renderer.MindMapRenderer

bookmark_manager_mod = importlib.import_module("smart-bookmarks.bookmark_manager")
BookmarkManager = bookmark_manager_mod.BookmarkManager

bookmark_search_mod = importlib.import_module("smart-bookmarks.search")
BookmarkSearcher = bookmark_search_mod.BookmarkSearcher

summarizer_mod = importlib.import_module("research-summarizer.summarizer")
ResearchPaperSummarizer = summarizer_mod.ResearchPaperSummarizer

section_parser_mod = importlib.import_module("research-summarizer.section_parser")
SectionParser = section_parser_mod.SectionParser

findings_extractor_mod = importlib.import_module("research-summarizer.findings_extractor")
FindingsExtractor = findings_extractor_mod.FindingsExtractor

command_parser_mod = importlib.import_module("voice-interaction.command_parser")
VoiceCommandParser = command_parser_mod.VoiceCommandParser

# A. Formula Extraction
print("--- 2. Formula Extraction ---")
extractor = FormulaExtractor(use_llm=False)
formulas = extractor.extract("Einstein stated that energy equals mass times speed of light squared (E = mc^2), while Newton defined force equals mass times acceleration.")
for f in formulas:
    print(f"Name: {f['name']} | Match: '{f['raw_text']}' | LaTeX: {f['latex']} | Block: {f['display_math']}")
print("\n" + "-"*50 + "\n")

# B. Semantic Search
print("--- 3. Semantic Search ---")
# Use a temporary directory to initialize ChromaDB index
import tempfile
with tempfile.TemporaryDirectory() as tmpdir:
    search_engine = SemanticSearchEngine(api_key=None, collection_name="demo_collection", persist_directory=tmpdir)
    search_engine.index_document("doc-1", "Introduction to Artificial Neural Networks and Backpropagation", {"topic": "ML"})
    search_engine.index_document("doc-2", "Linear Regression and gradient descent equations", {"topic": "Math"})
    
    print("Searching for 'neural networks':")
    results = search_engine.search("neural networks", n_results=2)
    for r in results:
        print(f"Doc ID: {r['id']} | Similarity: {r['similarity_score']} | Content: '{r['text']}'")
print("\n" + "-"*50 + "\n")

# C. Mind Map Generation
print("--- 4. Mind Map Generation & Layout ---")
sample_notes = """
# Machine Learning Basics
## Supervised Learning
- Linear Regression
- Decision Trees
## Unsupervised Learning
- K-Means Clustering
"""
mind_map = generate_mind_map_from_text(sample_notes, api_key=None)
positioned_nodes = calculate_tree_layout(mind_map["nodes"], mind_map["edges"])
mermaid_diagram = MindMapRenderer.to_mermaid(positioned_nodes, mind_map["edges"])

print("React Flow Node Positions Sample:")
for node in positioned_nodes[:3]:
    print(f"Node ID: {node['id']} | Label: '{node['label']}' | Coordinates: {node['position']}")
    
print("\nMermaid.js Diagram Output:")
print(mermaid_diagram)
print("\n" + "-"*50 + "\n")

# D. Smart Bookmarks
print("--- 5. Smart Bookmarks Auto-Categorization ---")
bm_manager = BookmarkManager(use_llm=False)
bm1 = bm_manager.create_bookmark(
    user_id="user-456",
    content_id="vid-1",
    content_url="http://youtube.com/watch?v=1",
    text="A derivative is defined as the rate of change of a function with respect to a variable.",
    timestamp_seconds=45
)
bm2 = bm_manager.create_bookmark(
    user_id="user-456",
    content_id="vid-1",
    content_url="http://youtube.com/watch?v=1",
    text="For example, if we throw a ball, its velocity is the derivative of position over time.",
    timestamp_seconds=60
)
print(f"Bookmark 1: Category = {bm1['category']} | Label = '{bm1['label']}'")
print(f"Bookmark 2: Category = {bm2['category']} | Label = '{bm2['label']}'")
print("\n" + "-"*50 + "\n")

# E. Research Summarizer
print("--- 6. Research Summarizer ---")
sample_paper = """
Abstract
We present a study on deep learning for vision tasks.
Introduction
Computer vision has been revolutionized by deep neural networks.
Methodology
We train a 50-layer ResNet model on the ImageNet database.
Results
Our model achieves 93% top-5 accuracy on the dataset.
References
1. He et al., Deep Residual Learning for Image Recognition.
"""
sections = SectionParser.parse_sections(sample_paper)
print("Parsed Sections:")
print(list(sections.keys()))

summarizer = ResearchPaperSummarizer(use_llm=False)
summarized_sections = summarizer.summarize_sections(sections)
print("\nSummary of Introduction:")
print(summarized_sections.get("Introduction"))

findings_ext = FindingsExtractor(use_llm=False)
findings = findings_ext.extract_findings(sample_paper)
print("\nExtracted Key Findings:")
print(findings)
print("\n" + "-"*50 + "\n")

# F. Voice Interaction Command Parser
print("--- 7. Voice Interaction Command Parser ---")
voice_parser = VoiceCommandParser(use_llm=False)
cmd_explain = voice_parser.parse_command("Can you explain this part to me?")
cmd_quiz = voice_parser.parse_command("Let's do a quiz!")

print(f"Speech Input: 'Can you explain this part to me?' -> Intent: {cmd_explain['intent']} (Confidence: {cmd_explain['confidence']})")
print(f"Speech Input: 'Let's do a quiz!' -> Intent: {cmd_quiz['intent']} (Confidence: {cmd_quiz['confidence']})")
print("==================================================================")
