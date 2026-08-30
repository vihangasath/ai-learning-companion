import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts"
import Card from "../components/Card"
import { analyticsApi, type StudyTimeData, type FocusData, type StreakData, type PerformanceData, type RecentActivityItem } from "../services/apiService"

const MOCK_MONTHLY = [
  { month: "Jan", hours: 28, quizzes: 8, videos: 12 }, { month: "Feb", hours: 35, quizzes: 11, videos: 15 },
  { month: "Mar", hours: 31, quizzes: 9, videos: 13 }, { month: "Apr", hours: 42, quizzes: 14, videos: 18 },
  { month: "May", hours: 38, quizzes: 12, videos: 16 }, { month: "Jun", hours: 52, quizzes: 18, videos: 22 },
  { month: "Jul", hours: 45, quizzes: 15, videos: 19 },
]
const MOCK_FOCUS = [
  { day: "Mon", focus: 82 }, { day: "Tue", focus: 78 }, { day: "Wed", focus: 91 },
  { day: "Thu", focus: 87 }, { day: "Fri", focus: 84 }, { day: "Sat", focus: 72 }, { day: "Sun", focus: 79 },
]
const MOCK_SESSIONS = [
  { date: "Jul 16", day: "Wed", subject: "CS", content: "Gradient Descent explained", duration: "32 min", focus: "91%", type: "Video" },
  { date: "Jul 16", day: "Wed", subject: "Math", content: "Calculus Basics Quiz", duration: "18 min", focus: "88%", type: "Quiz" },
  { date: "Jul 15", day: "Tue", subject: "Math", content: "Linear Algebra Flashcards", duration: "25 min", focus: "85%", type: "Flashcard" },
  { date: "Jul 15", day: "Tue", subject: "CS", content: "Python for Data Science", duration: "48 min", focus: "79%", type: "Video" },
  { date: "Jul 14", day: "Mon", subject: "Physics", content: "Quantum Mechanics Intro", duration: "41 min", focus: "82%", type: "Video" },
]
const typeColor: Record<string, string> = { Video: "#14b8a6", Quiz: "#22c55e", Flashcard: "#3b82f6" }
const subjectColor: Record<string, string> = { CS: "#14b8a6", Math: "#3b82f6", Physics: "#8b5cf6", History: "#f59e0b" }

export default function AnalyticsPage({ theme }: any) {
  const { dark, text, textSec, muted, accent, border, card, hover } = theme
  const tip = { background: dark ? "#1a1a1f" : "#fff", border: `1px solid ${border}`, borderRadius: "8px", color: text, fontSize: "12px" }

  const [studyTime, setStudyTime] = useState<StudyTimeData | null>(null)
  const [focus, setFocus] = useState<FocusData | null>(null)
  const [streaks, setStreaks] = useState<StreakData | null>(null)
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [recent, setRecent] = useState<RecentActivityItem[] | null>(null)
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const loadAll = async () => {
      setApiLoading(true)
      try {
        const [st, fc, sk, perf, rc] = await Promise.allSettled([
          analyticsApi.getStudyTime(30),
          analyticsApi.getFocus(7),
          analyticsApi.getStreaks(),
          analyticsApi.getPerformance(),
          analyticsApi.getRecent(20),
        ])
        if (cancelled) return
        if (st.status === "fulfilled") setStudyTime(st.value)
        if (fc.status === "fulfilled") setFocus(fc.value)
        if (sk.status === "fulfilled") setStreaks(sk.value)
        if (perf.status === "fulfilled") setPerformance(perf.value)
        if (rc.status === "fulfilled") setRecent(rc.value)
      } catch (_) {
        // fall back to mock
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [])

  const totalHours = studyTime ? studyTime.total_hours : 271
  const sessionCount = recent ? recent.length : 142
  const focusRate = focus ? focus.focus_rate : 81.9
  const currentStreak = streaks ? streaks.current_streak : 0

  const focusChartData = focus?.daily_breakdown?.length ? focus.daily_breakdown : MOCK_FOCUS

  const sessionRows = recent?.length
    ? recent.slice(0, 8).map(item => ({
        date: item.timestamp ? new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-",
        day: item.timestamp ? new Date(item.timestamp).toLocaleDateString("en-US", { weekday: "short" }) : "-",
        subject: "General",
        content: item.content_id || item.event_type,
        duration: "-",
        focus: "-",
        type: item.event_type?.includes("quiz") ? "Quiz" : item.event_type?.includes("flash") ? "Flashcard" : "Video",
      }))
    : MOCK_SESSIONS

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "2px" }}>Analytics</h1>
          <p style={{ fontSize: "13px", color: textSec }}>Detailed insights into your study patterns and progress</p>
        </div>
        {apiLoading && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accent, opacity: 0.7 }} />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
        {[
          { label: "Total Hours", value: `${totalHours}h`, delta: "+18% this month", color: "#14b8a6" },
          { label: "Avg Daily", value: `${studyTime ? (studyTime.total_hours / 30).toFixed(1) : 1.8}h`, delta: "+0.3h vs last", color: "#3b82f6" },
          { label: "Sessions", value: String(sessionCount), delta: "+23 this month", color: "#22c55e" },
          { label: "Focus Rate", value: `${focusRate}%`, delta: "+4.2% this month", color: "#f59e0b" },
        ].map(s => (
          <Card key={s.label} theme={theme} style={{ padding: "20px" }}>
            <div style={{ fontSize: "11px", color: muted, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>{s.label}</div>
            <div style={{ fontSize: "30px", fontWeight: "700", color: s.color, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "6px" }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#22c55e", fontWeight: "500" }}>↑ {s.delta}</div>
          </Card>
        ))}
      </div>

      <Card theme={theme}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Monthly Study Hours</div>
            <div style={{ fontSize: "12px", color: muted }}>Total hours studied per month this year</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={MOCK_MONTHLY}>
            <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={accent} stopOpacity={0.2} /><stop offset="95%" stopColor={accent} stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "#f4f4f5"} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tip} />
            <Area type="monotone" dataKey="hours" stroke={accent} strokeWidth={2} fill="url(#mg)" dot={{ fill: accent, r: 3, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Card theme={theme}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Daily Focus Rate</div>
          <div style={{ fontSize: "12px", color: muted, marginBottom: "14px" }}>This week average</div>
          <ResponsiveContainer width="100%" height={155}>
            <BarChart data={focusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "#f4f4f5"} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={tip} formatter={(v: any) => [v + "%", "Focus"]} />
              <Bar dataKey="focus" fill={accent} radius={[4, 4, 0, 0]} barSize={22} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card theme={theme}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Content Breakdown</div>
          <div style={{ fontSize: "12px", color: muted, marginBottom: "14px" }}>Videos vs quizzes per month</div>
          <ResponsiveContainer width="100%" height={155}>
            <LineChart data={MOCK_MONTHLY}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "#f4f4f5"} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tip} />
              <Line type="monotone" dataKey="videos" stroke="#14b8a6" strokeWidth={2} dot={{ fill: "#14b8a6", r: 3, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="quizzes" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: "14px", marginTop: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: "12px", height: "2px", background: "#14b8a6", borderRadius: "1px" }} /><span style={{ fontSize: "11px", color: muted }}>Videos</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}><div style={{ width: "12px", height: "2px", background: "#3b82f6", borderRadius: "1px" }} /><span style={{ fontSize: "11px", color: muted }}>Quizzes</span></div>
          </div>
        </Card>
      </div>

      <Card theme={theme}>
        <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "16px" }}>Session History</div>
        <div style={{ display: "grid", gridTemplateColumns: "80px 60px 70px 1fr 80px 60px 80px", borderBottom: `1px solid ${border}`, paddingBottom: "8px", marginBottom: "2px" }}>
          {["Date", "Day", "Subject", "Content", "Duration", "Focus", "Type"].map(h => (
            <div key={h} style={{ fontSize: "11px", color: muted, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 8px" }}>{h}</div>
          ))}
        </div>
        {sessionRows.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 60px 70px 1fr 80px 60px 80px", padding: "10px 0", borderBottom: i < sessionRows.length - 1 ? `1px solid ${border}` : "none", alignItems: "center" }}>
            <div style={{ fontSize: "12px", color: text, padding: "0 8px" }}>{s.date}</div>
            <div style={{ fontSize: "12px", color: muted, padding: "0 8px" }}>{s.day}</div>
            <div style={{ padding: "0 8px" }}><span style={{ fontSize: "11px", color: subjectColor[s.subject] || accent, background: `${subjectColor[s.subject] || accent}15`, padding: "2px 6px", borderRadius: "4px", fontWeight: "500" }}>{s.subject}</span></div>
            <div style={{ fontSize: "12px", color: text, fontWeight: "400", padding: "0 8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.content}</div>
            <div style={{ fontSize: "12px", color: muted, padding: "0 8px" }}>{s.duration}</div>
            <div style={{ fontSize: "12px", color: "#22c55e", fontWeight: "500", padding: "0 8px" }}>{s.focus}</div>
            <div style={{ padding: "0 8px" }}><span style={{ fontSize: "11px", color: typeColor[s.type] || accent, background: `${typeColor[s.type] || accent}15`, padding: "2px 6px", borderRadius: "4px", fontWeight: "500" }}>{s.type}</span></div>
          </div>
        ))}
      </Card>
    </div>
  )
}
