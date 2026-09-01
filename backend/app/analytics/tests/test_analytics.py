import pytest
from datetime import datetime, date, timedelta

# Import metrics
from backend.app.analytics.metrics.study_metrics import calculate_total_study_time, calculate_average_daily_study_time, calculate_peak_hours
from backend.app.analytics.metrics.focus_metrics import calculate_focus_rate, calculate_distraction_frequency, calculate_idle_time
from backend.app.analytics.metrics.streak_metrics import calculate_streaks, calculate_consistency_score
from backend.app.analytics.metrics.performance_metrics import calculate_quiz_accuracy, calculate_improvement_rate, calculate_mastery_score, calculate_learning_velocity
from backend.app.analytics.metrics.engagement_metrics import calculate_completion_rate, count_completed_videos, count_notes_generated, count_flashcards_reviewed

# Import collectors
from backend.app.analytics.collectors.video_collector import VideoEventCollector, VIDEO_PLAY
from backend.app.analytics.collectors.user_activity_collector import UserActivityCollector, TAB_HIDDEN
from backend.app.analytics.collectors.ai_interaction_collector import AIInteractionCollector, QUIZ_GENERATED
from backend.app.analytics.collectors.session_collector import SessionEventCollector, SESSION_START

# Import processors
from backend.app.analytics.processors.study_time_processor import StudyTimeProcessor
from backend.app.analytics.processors.focus_processor import FocusProcessor
from backend.app.analytics.processors.consistency_processor import ConsistencyProcessor
from backend.app.analytics.processors.completion_processor import CompletionProcessor
from backend.app.analytics.processors.performance_processor import PerformanceProcessor
from backend.app.analytics.processors.productivity_processor import ProductivityProcessor

# Import visualizations
from backend.app.analytics.visualizations.weekly_activity import get_weekly_activity_data
from backend.app.analytics.visualizations.subject_performance import get_subject_performance_data
from backend.app.analytics.visualizations.heatmap_data import get_heatmap_data
from backend.app.analytics.visualizations.topic_distribution import get_topic_distribution_data
from backend.app.analytics.visualizations.streak_timeline import get_streak_timeline_data
from backend.app.analytics.visualizations.focus_gauge import get_focus_gauge_data


# --- 1. Metrics Tests ---

def test_study_metrics():
    sessions = [
        {"active_time_minutes": 30.0},
        {"active_time_minutes": 45.0},
        {"start_time": "2026-06-01T09:00:00", "end_time": "2026-06-01T09:15:00"}
    ]
    assert calculate_total_study_time(sessions) == 90.0
    assert calculate_average_daily_study_time(sessions, 2) == 45.0
    
    peak = calculate_peak_hours(sessions)
    assert len(peak) >= 1
    assert peak[0] == 9

def test_focus_metrics():
    assert calculate_focus_rate(40.0, 50.0) == 80.0
    
    events = [
        {"event_type": "tab_hidden"},
        {"event_type": "user_idle"},
        {"event_type": "user_active"}
    ]
    assert calculate_distraction_frequency(events) == 2
    
    # Idle time estimation
    timeline_events = [
        {"event_type": "user_idle", "timestamp": "2026-06-01T09:00:00"},
        {"event_type": "user_active", "timestamp": "2026-06-01T09:05:00"},
        {"event_type": "user_idle", "timestamp": "2026-06-01T09:10:00"},
        {"event_type": "user_active", "timestamp": "2026-06-01T09:20:00"}
    ]
    assert calculate_idle_time(timeline_events) == 15.0

def test_streak_metrics():
    study_dates = [
        date(2026, 6, 1),
        date(2026, 6, 2),
        date(2026, 6, 3),
        date(2026, 6, 5),
        date(2026, 6, 6)
    ]
    current, longest = calculate_streaks(study_dates)
    assert longest == 3
    # Since dates are in the past, current streak is broken (0)
    assert current == 0
    
    # Test active streak
    today = date.today()
    yesterday = today - timedelta(days=1)
    current_active, longest_active = calculate_streaks([yesterday, today])
    assert current_active == 2
    assert longest_active == 2

    assert calculate_consistency_score(15, 30) == 50.0

def test_performance_metrics():
    quizzes = [
        {"score": 80.0},
        {"correct_answers": 4, "total_questions": 5}  # 80.0%
    ]
    assert calculate_quiz_accuracy(quizzes) == 80.0
    
    # Mastery score
    assert calculate_mastery_score(80.0, 90.0, 5) == (80.0*0.4 + 90.0*0.3 + 50.0*0.3)

def test_engagement_metrics():
    assert calculate_completion_rate(90.0, 100.0) == 90.0
    
    videos = [
        {"completion_rate": 95.0},
        {"watched_duration": 40.0, "total_video_duration": 50.0}  # 80% completion
    ]
    assert count_completed_videos(videos, completion_threshold=90.0) == 1


# --- 2. Collector Tests ---

def test_collectors():
    payload = {
        "event_type": "video_play",
        "user_id": "user-123",
        "session_id": "session-456",
        "content_id": "video-789",
        "timestamp": "2026-06-01T09:00:00",
        "metadata": {"playhead_seconds": 10.0, "total_duration_seconds": 120.0}
    }
    video_res = VideoEventCollector.collect(payload)
    assert video_res["event_type"] == VIDEO_PLAY
    assert video_res["playhead_seconds"] == 10.0
    
    activity_payload = {
        "event_type": "tab_hidden",
        "user_id": "user-123",
        "session_id": "session-456",
        "content_id": "video-789",
        "timestamp": "2026-06-01T09:02:00",
        "metadata": {"duration_seconds": 15.0}
    }
    act_res = UserActivityCollector.collect(activity_payload)
    assert act_res["event_type"] == TAB_HIDDEN
    
    ai_payload = {
        "event_type": "quiz_generated",
        "user_id": "user-123",
        "session_id": "session-456",
        "content_id": "video-789",
        "timestamp": "2026-06-01T09:03:00",
        "metadata": {"tool_name": "quiz", "tokens_used": 150}
    }
    ai_res = AIInteractionCollector.collect(ai_payload)
    assert ai_res["event_type"] == QUIZ_GENERATED
    assert ai_res["tokens_used"] == 150
    
    sess_payload = {
        "event_type": "session_start",
        "user_id": "user-123",
        "session_id": "session-456",
        "content_id": "video-789",
        "timestamp": "2026-06-01T09:00:00",
        "metadata": {"content_type": "video"}
    }
    sess_res = SessionEventCollector.collect(sess_payload)
    assert sess_res["event_type"] == SESSION_START


# --- 3. Processor Tests ---

def test_processors():
    sessions = [
        {"start_time": "2026-06-01T09:00:00", "end_time": "2026-06-01T09:45:00", "active_time_minutes": 40.0, "focus_rate": 80.0, "completion_rate": 90.0, "topic": "Math"}
    ]
    events = [
        {"event_type": "user_idle", "timestamp": "2026-06-01T09:10:00"},
        {"event_type": "user_active", "timestamp": "2026-06-01T09:15:00"}
    ]
    
    stp = StudyTimeProcessor(sessions)
    assert stp.get_summary()["total_study_minutes"] == 40.0
    
    fp = FocusProcessor(sessions, events)
    assert fp.get_focus_summary()["focus_rate"] == 88.89
    
    cp = CompletionProcessor(sessions)
    assert cp.get_average_completion() == 90.0
    
    # Test segment completion merging
    segs = [(0, 10), (5, 15), (30, 45)]
    assert cp.calculate_from_segments(segs, 100) == 30.0 # unique: 0-15 (15) + 30-45 (15) = 30%
    
    pp = PerformanceProcessor([{"score": 90.0, "topic": "Math"}], [{"topic": "Math", "quiz_avg": 90.0, "completion_rate": 80.0, "review_count": 2}])
    assert pp.get_overall_accuracy() == 90.0
    assert len(pp.get_topic_mastery()) == 1


# --- 4. Visualization Tests ---

def test_visualizations():
    sessions = [
        {"start_time": "2026-06-01T09:00:00", "active_time_minutes": 45.0, "topic": "Math", "focus_rate": 80.0}
    ]
    # Test weekly activity
    target = date(2026, 6, 1)
    weekly = get_weekly_activity_data(sessions, target_date=target)
    assert weekly["data"][-1]["minutes"] == 45.0
    assert weekly["data"][-1]["day"] == "Mon"
    
    # Test subject performance
    subject_perf = get_subject_performance_data([{"score": 90.0, "topic": "Math"}])
    assert subject_perf["data"][0]["subject"] == "Math"
    
    # Test topic distribution
    topic_dist = get_topic_distribution_data(sessions)
    assert topic_dist["data"][0]["name"] == "Math"
    assert topic_dist["data"][0]["value"] == 45.0
