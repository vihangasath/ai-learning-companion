import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Card from "../components/Card"
import { analyticsApi, recommendationsApi, type StudyTimeData, type StreakData, type FocusData, type RecentActivityItem } from "../services/apiService"

// --- Fallback mock data (used when backend is unavailable) ---
const MOCK_WEEK_DATA = [
  { day: "Mon", hours: 1.8 }, { day: "Tue", hours: 2.5 }, { day: "Wed", hours: 1.2 },
  { day: "Thu", hours: 3.1 }, { day: "Fri", hours: 2.8 }, { day: "Sat", hours: 1.5 }, { day: "Sun", hours: 1.6 },
]
const MOCK_COURSES = [
  { rank: 1, name: "Neural Networks & Deep Learning", subject: "CS", progress: 78, score: 92, status: "Active", color: "#14b8a6" },
  { rank: 2, name: "Linear Algebra for ML", subject: "Math", progress: 100, score: 88, status: "Done", color: "#3b82f6" },
  { rank: 3, name: "Quantum Mechanics", subject: "Physics", progress: 45, score: 74, status: "Active", color: "#8b5cf6" },
  { rank: 4, name: "Advanced Python", subject: "CS", progress: 100, score: 84, status: "Done", color: "#22c55e" },
]
const MOCK_ACTIVITY = [
  { color: "#14b8a6", title: "Gradient Descent explained", meta: "CS · 32 min", tag: "Video", time: "9:14 AM" },
  { color: "#22c55e", title: "Calculus basics quiz", meta: "Math · 88%", tag: "Quiz", time: "8:30 AM" },
  { color: "#3b82f6", title: "Linear Algebra flashcards", meta: "Math · 20 cards", tag: "Flashcard", time: "Yesterday" },
  { color: "#f59e0b", title: "Python for Data Science", meta: "CS · 48 min", tag: "Video", time: "Yesterday" },
]
const MOCK_RECOMMENDATIONS = [
  { title: "Neural Networks", sub: "CS · 45 min · Beginner", match: 98, color: "#14b8a6" },
  { title: "Linear Algebra ML", sub: "Math · 30 min · Intermediate", match: 94, color: "#3b82f6" },
  { title: "Quantum Mechanics", sub: "Physics · 60 min · Advanced", match: 87, color: "#8b5cf6" },
]

const EVENT_TAG_MAP: Record<string, { tag: string; color: string }> = {
  video_play: { tag: "Video", color: "#14b8a6" },
  video_complete: { tag: "Video", color: "#14b8a6" },
  summary_generated: { tag: "Notes", color: "#22c55e" },
  quiz_generated: { tag: "Quiz", color: "#22c55e" },
  flashcard_opened: { tag: "Flashcard", color: "#3b82f6" },
  note_viewed: { tag: "Notes", color: "#8b5cf6" },
  session_start: { tag: "Session", color: "#f59e0b" },
}

export default function DashboardPage({ theme }: any) {
  const { dark, text, textSec, muted, accent, border, card, hover } = theme

  // --- API state ---
  const [studyTime, setStudyTime] = useState<StudyTimeData | null>(null)
  const [streaks, setStreaks] = useState<StreakData | null>(null)
  const [focus, setFocus] = useState<FocusData | null>(null)
  const [recent, setRecent] = useState<RecentActivityItem[] | null>(null)
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number; level: number }[] | null>(null)
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const loadAll = async () => {
      setApiLoading(true)
      try {
        const [st, sk, fc, rc, hm] = await Promise.allSettled([
          analyticsApi.getStudyTime(7),
          analyticsApi.getStreaks(),
          analyticsApi.getFocus(7),
          analyticsApi.getRecent(10),
          analyticsApi.getHeatmap(),
        ])
        if (cancelled) return
        if (st.status === "fulfilled") setStudyTime(st.value)
        if (sk.status === "fulfilled") setStreaks(sk.value)
        if (fc.status === "fulfilled") setFocus(fc.value)
        if (rc.status === "fulfilled") setRecent(rc.value)
        if (hm.status === "fulfilled") setHeatmapData(hm.value.data)
      } catch (_) {
        // silently fall back to mock
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [])

  // --- Derived display values ---
  const totalHours = studyTime ? studyTime.total_hours : 14.5
  const currentStreak = streaks ? streaks.current_streak : 12
  const focusRate = focus ? focus.focus_rate : 87
  const weekData = studyTime?.daily_breakdown?.length
    ? studyTime.daily_breakdown.map(d => ({ day: d.day, hours: d.hours }))
    : MOCK_WEEK_DATA

  const activityItems = recent?.length
    ? recent.slice(0, 4).map((item) => {
        const mapped = EVENT_TAG_MAP[item.event_type] ?? { tag: item.event_type, color: "#a1a1aa" }
        const ts = item.timestamp ? new Date(item.timestamp) : null
        const timeStr = ts ? ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""
        return { color: mapped.color, title: item.content_id || item.event_type, meta: item.event_type, tag: mapped.tag, time: timeStr }
      })
    : MOCK_ACTIVITY

  // Heatmap cells: use real data if available, else random mock
  const heatCells: number[] = heatmapData?.length
    ? (() => {
        const map: Record<string, number> = {}
        heatmapData.forEach(d => { map[d.date] = d.level })
        return Array.from({ length: 70 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (69 - i))
          return map[d.toISOString().slice(0, 10)] ?? 0
        })
      })()
    : Array.from({ length: 70 }, () => { const r = Math.random(); return r < 0.3 ? 0 : r < 0.55 ? 1 : r < 0.75 ? 2 : r < 0.9 ? 3 : 4 })

  const heatC = dark
    ? ["rgba(255,255,255,0.04)", "rgba(20,184,166,0.2)", "rgba(20,184,166,0.4)", "rgba(20,184,166,0.65)", "#14b8a6"]
    : ["#f4f4f5", "#ccfbf1", "#99f6e4", "#2dd4bf", "#0d9488"]

  const h = new Date().getHours()
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
  const tip = { background: dark ? "#1a1a1f" : "#fff", border: `1px solid ${border}`, borderRadius: "8px", color: text, fontSize: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }

  const consistencyPct = heatCells.filter(c => c > 0).length
  const consistencyActive = heatCells.filter(c => c > 0).length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "16px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "2px" }}>{greeting}, Kasun 👋</h1>
          <p style={{ fontSize: "13px", color: textSec }}>Here is an overview of your learning progress today.</p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {apiLoading && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: accent, opacity: 0.6, animation: "pulse 1.5s infinite" }} />}
          <div style={{ padding: "6px 12px", borderRadius: "6px", border: `1px solid ${border}`, fontSize: "12px", color: muted, cursor: "pointer" }}>This week ▾</div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
        {[
          { label: "Study Hours", value: `${totalHours}h`, delta: "+2.3h this week", up: true, color: "#14b8a6", bar: Math.min(100, (totalHours / 20) * 100) },
          { label: "Day Streak", value: `${currentStreak} days`, delta: "Personal best", up: true, color: "#f59e0b", bar: Math.min(100, (currentStreak / 30) * 100) },
          { label: "Videos Done", value: "23", delta: "+5 from last week", up: true, color: "#22c55e", bar: 58 },
          { label: "Focus Score", value: `${focusRate}%`, delta: "-3% from average", up: focusRate >= 80, color: "#8b5cf6", bar: focusRate },
        ].map(c => (
          <Card key={c.label} theme={theme} style={{ padding: "16px" }}>
            <div style={{ fontSize: "11px", color: muted, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{c.label}</div>
            <div style={{ fontSize: "24px", fontWeight: "600", color: text, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "8px" }}>{c.value}</div>
            <div style={{ height: "3px", background: dark ? "rgba(255,255,255,0.06)" : "#f4f4f5", borderRadius: "2px", marginBottom: "6px", overflow: "hidden" }}>
              <div style={{ height: "3px", width: `${c.bar}%`, background: c.color, borderRadius: "2px" }} />
            </div>
            <div style={{ fontSize: "12px", color: c.up ? "#22c55e" : "#ef4444" }}>{c.up ? "↑" : "↓"} {c.delta}</div>
          </Card>
        ))}
      </div>

      {/* Chart + Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "12px" }}>
        <Card theme={theme}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Study Activity</div>
              <div style={{ fontSize: "12px", color: muted }}>Hours per day this week</div>
            </div>
            <div style={{ fontSize: "20px", fontWeight: "600", color: accent, letterSpacing: "-0.03em" }}>{totalHours}h <span style={{ fontSize: "11px", color: muted, fontWeight: "400" }}>total</span></div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weekData}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accent} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "#f4f4f5"} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tip} />
              <Area type="monotone" dataKey="hours" stroke={accent} strokeWidth={2} fill="url(#ag)" dot={{ fill: accent, r: 3, stroke: dark ? "#111113" : "#fff", strokeWidth: 2 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card theme={theme}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Recent Activity</div>
          <div style={{ fontSize: "12px", color: muted, marginBottom: "14px" }}>Today and yesterday</div>
          {activityItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "8px", background: hover, marginBottom: "4px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "12px", color: text, fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
                <div style={{ fontSize: "11px", color: muted }}>{item.meta}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "10px", fontWeight: "500", color: item.color, background: `${item.color}15`, padding: "2px 6px", borderRadius: "4px", marginBottom: "2px" }}>{item.tag}</div>
                <div style={{ fontSize: "10px", color: muted }}>{item.time}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Courses table */}
      <Card theme={theme}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>My Courses</div>
            <div style={{ fontSize: "12px", color: muted }}>Active and completed enrollments</div>
          </div>
          <span style={{ fontSize: "12px", color: accent, cursor: "pointer" }}>View all →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "32px 2fr 80px 110px 70px 80px", borderBottom: `1px solid ${border}`, paddingBottom: "8px", marginBottom: "2px" }}>
          {["#", "Course", "Subject", "Progress", "Score", "Status"].map(h => (
            <div key={h} style={{ fontSize: "11px", color: muted, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 8px" }}>{h}</div>
          ))}
        </div>
        {MOCK_COURSES.map((c, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "32px 2fr 80px 110px 70px 80px", padding: "10px 0", borderBottom: i < MOCK_COURSES.length - 1 ? `1px solid ${border}` : "none", alignItems: "center" }}>
            <div style={{ fontSize: "12px", color: muted, padding: "0 8px", fontWeight: "600" }}>#{c.rank}</div>
            <div style={{ fontSize: "13px", color: text, fontWeight: "500", padding: "0 8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
            <div style={{ padding: "0 8px" }}><span style={{ fontSize: "11px", color: c.color, background: `${c.color}15`, padding: "2px 7px", borderRadius: "4px", fontWeight: "500" }}>{c.subject}</span></div>
            <div style={{ padding: "0 8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ flex: 1, height: "4px", background: dark ? "rgba(255,255,255,0.06)" : "#f4f4f5", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "4px", width: `${c.progress}%`, background: c.color, borderRadius: "2px" }} />
              </div>
              <span style={{ fontSize: "10px", color: muted, flexShrink: 0 }}>{c.progress}%</span>
            </div>
            <div style={{ padding: "0 8px", fontSize: "13px", color: text, fontWeight: "500" }}>{c.score}%</div>
            <div style={{ padding: "0 8px" }}>
              <span style={{ fontSize: "11px", fontWeight: "500", color: c.status === "Done" ? "#22c55e" : "#f59e0b", background: c.status === "Done" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", padding: "2px 8px", borderRadius: "4px" }}>{c.status}</span>
            </div>
          </div>
        ))}
      </Card>

      {/* Bottom */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Card theme={theme}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Study Consistency</div>
              <div style={{ fontSize: "12px", color: muted }}>Last 70 days</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "16px", fontWeight: "600", color: accent, letterSpacing: "-0.03em" }}>{Math.round((consistencyActive / 70) * 100)}%</div>
              <div style={{ fontSize: "11px", color: muted }}>{consistencyActive} active</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: "4px", marginBottom: "8px" }}>
            {heatCells.map((l, i) => <div key={i} style={{ height: "14px", borderRadius: "3px", background: heatC[l] }} />)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "10px", color: muted }}>Less</span>
            {heatC.map((c, i) => <div key={i} style={{ width: "10px", height: "10px", borderRadius: "2px", background: c, border: `1px solid ${border}` }} />)}
            <span style={{ fontSize: "10px", color: muted }}>More</span>
          </div>
        </Card>

        <Card theme={theme}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ fontSize: "14px", fontWeight: "500", color: text }}>Recommended Next</div>
            <span style={{ fontSize: "12px", color: accent, cursor: "pointer" }}>See all</span>
          </div>
          {MOCK_RECOMMENDATIONS.map(r => (
            <div key={r.title} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "8px", background: hover, marginBottom: "6px", cursor: "pointer" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: r.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", color: text, fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                <div style={{ fontSize: "11px", color: muted }}>{r.sub}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: r.color }}>{r.match}%</div>
                <div style={{ fontSize: "10px", color: muted }}>match</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
