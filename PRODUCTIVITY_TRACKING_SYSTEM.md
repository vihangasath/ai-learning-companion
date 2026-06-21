# Productivity Tracking System

---

# Purpose

This system tracks and analyzes user learning behavior to generate productivity insights and study analytics.

---

# Metrics to Track

## 1. Study Time

Track:
- Daily study duration
- Weekly study duration
- Monthly study duration

### Example
```json
{
  "user_id": 1,
  "date": "2026-05-24",
  "study_time_minutes": 142
}
```

---

## 2. Learning Consistency

Track:
- Consecutive learning days
- Average study sessions
- Missed days

### Formula
```text
Consistency Score =
(Active Days / Total Days) * 100
```

---

## 3. Focus Rate

Measure:
- Active interaction time
- Idle time
- Tab switching frequency

### Formula
```text
Focus Rate =
(Active Study Time / Total Session Time) * 100
```

---

## 4. Video Completion Rate

Track:
- Watched percentage
- Rewatched sections
- Skipped sections

### Formula
```text
Completion Rate =
(Watched Duration / Total Video Duration) * 100
```

---

# Tracking Events

## Events to Capture

### Video Events
- play
- pause
- seek
- complete

### User Activity
- mouse movement
- keyboard interaction
- tab visibility

### AI Interactions
- summary generated
- quiz generated
- flashcard opened

---

# Backend Data Structure

## Study Session Schema

```json
{
  "session_id": "uuid",
  "user_id": "uuid",
  "content_id": "youtube_video_id",
  "start_time": "timestamp",
  "end_time": "timestamp",
  "focus_rate": 87,
  "completion_rate": 92,
  "active_time_minutes": 45
}
```

---

# Suggested Dashboard Widgets

- Daily study hours chart
- Weekly consistency graph
- Focus score meter
- Learning streak counter
- Most studied topics

---

# Recommended Charts

## Use:
- Line charts for study trends
- Pie charts for topic distribution
- Bar charts for weekly comparison

---

# Important Notes

Avoid excessive tracking that impacts browser performance.

Store summarized analytics instead of raw activity logs whenever possible.