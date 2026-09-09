import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Card from "../components/Card"
import { analyticsApi, recommendationsApi, notesApi, type StudyTimeData, type StreakData, type FocusData, type RecentActivityItem, type Note, type Recommendation } from "../services/apiService"
import { useCurrentUser } from "../hooks/useCurrentUser"

const EVENT_TAG_MAP: Record<string, { tag: string; color: string }> = {
  video_play: { tag: "Video", color: "#14b8a6" },
  video_complete: { tag: "Video", color: "#14b8a6" },
  summary_generated: { tag: "Notes", color: "#22c55e" },
  quiz_generated: { tag: "Quiz", color: "#22c55e" },
  quiz_submitted: { tag: "Quiz", color: "#22c55e" },
  flashcard_opened: { tag: "Flashcard", color: "#3b82f6" },
  note_viewed: { tag: "Notes", color: "#8b5cf6" },
  session_start: { tag: "Session", color: "#f59e0b" },
}

export default function DashboardPage({ theme }: any) {
  const { dark, text, textSec, muted, accent, border, card, hover } = theme
  const { user } = useCurrentUser()

  // --- API state ---
  const [studyTime, setStudyTime] = useState<StudyTimeData | null>(null)
  const [streaks, setStreaks] = useState<StreakData | null>(null)
  const [focus, setFocus] = useState<FocusData | null>(null)
  const [recent, setRecent] = useState<RecentActivityItem[] | null>(null)
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number; level: number }[] | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const loadAll = async () => {
      setApiLoading(true)
      try {
        const [st, sk, fc, rc, hm, nt, rq] = await Promise.allSettled([
          analyticsApi.getStudyTime(7),
          analyticsApi.getStreaks(),
          analyticsApi.getFocus(7),
          analyticsApi.getRecent(10),
          analyticsApi.getHeatmap(),
          notesApi.getAll(0, 20),
          recommendationsApi.getAll(),
        ])
        if (cancelled) return
        if (st.status === "fulfilled") setStudyTime(st.value)
        if (sk.status === "fulfilled") setStreaks(sk.value)
        if (fc.status === "fulfilled") setFocus(fc.value)
        if (rc.status === "fulfilled") setRecent(rc.value)
        if (hm.status === "fulfilled") setHeatmapData(hm.value.data)
        if (nt.status === "fulfilled") setNotes(nt.value.notes ?? [])
        if (rq.status === "fulfilled") setRecommendations(rq.value.recommendations ?? [])
      } catch (_) {
        // backend unavailable — leave state empty
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [])

  // --- Derived display values (real data only) ---
  const totalHours = studyTime ? studyTime.total_hours : 0
  const currentStreak = streaks ? streaks.current_streak : 0
  const focusRate = focus ? focus.focus_rate : 0
  const weekData = (studyTime?.daily_breakdown ?? []).map(d => ({ day: d.day, hours: d.hours }))

  const activityItems = (recent ?? []).slice(0, 4).map((item) => {
    const mapped = EVENT_TAG_MAP[item.event_type] ?? { tag: item.event_type, color: "#a1a1aa" }
    const ts = item.timestamp ? new Date(item.timestamp) : null
    const timeStr = ts ? ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""
    return { color: mapped.color, title: item.content_id || item.event_type, meta: item.event_type, tag: mapped.tag, time: timeStr }
  })

  // Heatmap cells from real data; all-zero when no activity
  const heatCells: number[] = (() => {
    const map: Record<string, number> = {}
    ;(heatmapData ?? []).forEach(d => { map[d.date] = d.level })
    return Array.from({ length: 70 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (69 - i))
      return map[d.toISOString().slice(0, 10)] ?? 0
    })
  })()

  const heatC = dark
    ? ["rgba(255,255,255,0.04)", "rgba(20,184,166,0.2)", "rgba(20,184,166,0.4)", "rgba(20,184,166,0.65)", "#14b8a6"]
    : ["#f4f4f5", "#ccfbf1", "#99f6e4", "#2dd4bf", "#0d9488"]

  const h = new Date().getHours()
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there"
  const tip = { background: dark ? "#1a1a1f" : "#fff", border: `1px solid ${border}`, borderRadius: "8px", color: text, fontSize: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }

  const consistencyActive = heatCells.filter(c => c > 0).length

  // Courses derived from real saved study notes
  const courses = notes.slice(0, 8).map((n, i) => ({
    rank: i + 1,
    name: n.title || `Content ${n.content_id.slice(0, 8)}`,
    subject: n.content_type,
    color: ["#14b8a6", "#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7"][i % 8],
  }))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "16px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "2px" }}>{greeting}, {firstName} 👋</h1>
          <p style={{ fontSize: "13px", color: textSec }}>Here is an overview of your learning progress today.</p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {apiLoading && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: accent, opacity: 0.6, animation: "pulse 1.5s infinite" }} />}
          <div style={{ padding: "6px 12px", borderRadius: "6px", border: `1px solid ${border}`, fontSize: "12px", color: muted, cursor: "pointer" }}>This week ▾</div>
        </div>
      </div>

      {/* Stat cards — real values only */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
        {[
          { label: "Study Hours", value: `${totalHours}h`, delta: "this week", up: true, color: "#14b8a6", bar: Math.min(100, (totalHours / 20) * 100) },
          { label: "Day Streak", value: `${currentStreak} days`, delta: "current streak", up: currentStreak > 0, color: "#f59e0b", bar: Math.min(100, (currentStreak / 30) * 100) },
          { label: "Notes Saved", value: `${notes.length}`, delta: "from analyzed content", up: true, color: "#22c55e", bar: Math.min(100, (notes.length / 20) * 100) },
          { label: "Focus Score", value: `${focusRate}%`, delta: "recent sessions", up: focusRate >= 80, color: "#8b5cf6", bar: focusRate },
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
          {weekData.length ? (
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
          ) : (
            <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: muted }}>
              No study sessions recorded yet. Analyze some content to get started.
            </div>
          )}
        </Card>

        <Card theme={theme}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Recent Activity</div>
          <div style={{ fontSize: "12px", color: muted, marginBottom: "14px" }}>Today and yesterday</div>
          {activityItems.length ? activityItems.map((item, i) => (
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
          )) : (
            <div style={{ padding: "24px 0", textAlign: "center", fontSize: "12px", color: muted }}>
              No activity recorded yet.
            </div>
          )}
        </Card>
      </div>

      {/* Courses table — real notes */}
      <Card theme={theme}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>My Learning Content</div>
            <div style={{ fontSize: "12px", color: muted }}>Content you have analyzed and saved</div>
          </div>
          <span style={{ fontSize: "12px", color: accent, cursor: "pointer" }}>View all →</span>
        </div>
        {courses.length ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "32px 2fr 90px 1fr", borderBottom: `1px solid ${border}`, paddingBottom: "8px", marginBottom: "2px" }}>
              {["#", "Content", "Type", "Summary"].map(h2 => (
                <div key={h2} style={{ fontSize: "11px", color: muted, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 8px" }}>{h2}</div>
              ))}
            </div>
            {courses.map((c, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "32px 2fr 90px 1fr", padding: "10px 0", borderBottom: i < courses.length - 1 ? `1px solid ${border}` : "none", alignItems: "center" }}>
                <div style={{ fontSize: "12px", color: muted, padding: "0 8px", fontWeight: "600" }}>#{c.rank}</div>
                <div style={{ fontSize: "13px", color: text, fontWeight: "500", padding: "0 8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                <div style={{ padding: "0 8px" }}><span style={{ fontSize: "11px", color: c.color, background: `${c.color}15`, padding: "2px 7px", borderRadius: "4px", fontWeight: "500" }}>{c.subject}</span></div>
                <div style={{ fontSize: "12px", color: muted, padding: "0 8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{notes[i]?.summary || "Saved note"}</div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ padding: "28px 0", textAlign: "center", fontSize: "12px", color: muted }}>
            No saved content yet. Paste a URL or text in the Analyze page to create study notes, flashcards, and quizzes.
          </div>
        )}
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
          {recommendations.length ? recommendations.slice(0, 3).map((r, i) => (
            <div key={r.id ?? i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 10px", borderRadius: "8px", background: hover, marginBottom: "6px", cursor: "pointer" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: ["#14b8a6", "#3b82f6", "#8b5cf6"][i % 3], flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", color: text, fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                <div style={{ fontSize: "11px", color: muted }}>{r.subject} · {r.difficulty || "Mixed"}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: ["#14b8a6", "#3b82f6", "#8b5cf6"][i % 3] }}>{r.match_score ?? 80}%</div>
                <div style={{ fontSize: "10px", color: muted }}>match</div>
              </div>
            </div>
          )) : (
            <div style={{ padding: "24px 0", textAlign: "center", fontSize: "12px", color: muted }}>
              No recommendations yet.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}