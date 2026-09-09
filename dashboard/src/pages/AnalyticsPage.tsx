import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import Card from "../components/Card"
import { analyticsApi, type StudyTimeData, type FocusData, type StreakData, type PerformanceData, type RecentActivityItem } from "../services/apiService"

const typeColor: Record<string, string> = { Video: "#14b8a6", Quiz: "#22c55e", Flashcard: "#3b82f6", Notes: "#8b5cf6", Session: "#f59e0b" }

function tagForEvent(eventType: string): keyof typeof typeColor {
  if (eventType.includes("quiz")) return "Quiz"
  if (eventType.includes("flash")) return "Flashcard"
  if (eventType.includes("note") || eventType.includes("summary")) return "Notes"
  if (eventType.includes("session")) return "Session"
  return "Video"
}

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
          analyticsApi.getStudyTime(90),
          analyticsApi.getFocus(7),
          analyticsApi.getStreaks(),
          analyticsApi.getPerformance(),
          analyticsApi.getRecent(50),
        ])
        if (cancelled) return
        if (st.status === "fulfilled") setStudyTime(st.value)
        if (fc.status === "fulfilled") setFocus(fc.value)
        if (sk.status === "fulfilled") setStreaks(sk.value)
        if (perf.status === "fulfilled") setPerformance(perf.value)
        if (rc.status === "fulfilled") setRecent(rc.value)
      } catch (_) {
        // backend unavailable — leave state empty
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [])

  // Real values only — no mock fallbacks
  const totalHours = studyTime ? studyTime.total_hours : 0
  const sessionCount = (recent ?? []).length
  const focusRate = focus ? focus.focus_rate : 0
  const currentStreak = streaks ? streaks.current_streak : 0

  // Monthly hours from real daily breakdown (group by YYYY-MM)
  const monthlyData = (() => {
    const groups: Record<string, number> = {}
    ;(studyTime?.daily_breakdown ?? []).forEach(d => {
      const m = (d.date || "").slice(0, 7)
      if (!m) return
      groups[m] = (groups[m] ?? 0) + d.hours
    })
    return Object.entries(groups).sort().slice(-6).map(([m, hours]) => {
      const [y, mo] = m.split("-")
      const label = new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-US", { month: "short" })
      return { month: label, hours: Math.round(hours * 10) / 10 }
    })
  })()

  const focusChartData = (focus?.daily_breakdown ?? []).map(d => ({ day: d.day, focus: d.focus }))

  // Activity breakdown by type from real recent events
  const typeCounts = (recent ?? []).reduce<Record<string, number>>((acc, item) => {
    const tag = tagForEvent(item.event_type)
    acc[tag] = (acc[tag] ?? 0) + 1
    return acc
  }, {})
  const activityChartData = Object.entries(typeCounts).map(([name, count]) => ({ name, count }))

  const sessionRows = (recent ?? []).slice(0, 8).map(item => ({
    date: item.timestamp ? new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-",
    day: item.timestamp ? new Date(item.timestamp).toLocaleDateString("en-US", { weekday: "short" }) : "-",
    subject: "General",
    content: item.content_id || item.event_type,
    duration: "-",
    focus: "-",
    type: tagForEvent(item.event_type),
  }))

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
          { label: "Total Hours", value: `${totalHours}h`, delta: `${(studyTime?.daily_breakdown?.length ?? 0)} days tracked`, color: "#14b8a6" },
          { label: "Avg Weekly", value: `${(totalHours / 13).toFixed(1)}h`, delta: "over 90 days", color: "#3b82f6" },
          { label: "Sessions", value: String(sessionCount), delta: `${currentStreak} day streak`, color: "#22c55e" },
          { label: "Focus Rate", value: `${focusRate}%`, delta: "recent sessions", color: "#f59e0b" },
        ].map(s => (
          <Card key={s.label} theme={theme} style={{ padding: "20px" }}>
            <div style={{ fontSize: "11px", color: muted, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>{s.label}</div>
            <div style={{ fontSize: "30px", fontWeight: "700", color: s.color, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "6px" }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: muted, fontWeight: "500" }}>{s.delta}</div>
          </Card>
        ))}
      </div>

      <Card theme={theme}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Monthly Study Hours</div>
            <div style={{ fontSize: "12px", color: muted }}>Recorded study time per month (last 90 days)</div>
          </div>
        </div>
        {monthlyData.length ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyData}>
              <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={accent} stopOpacity={0.2} /><stop offset="95%" stopColor={accent} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "#f4f4f5"} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tip} />
              <Area type="monotone" dataKey="hours" stroke={accent} strokeWidth={2} fill="url(#mg)" dot={{ fill: accent, r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: muted }}>
            No study time recorded yet. Study sessions will appear here once you record activity.
          </div>
        )}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Card theme={theme}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Daily Focus Rate</div>
          <div style={{ fontSize: "12px", color: muted, marginBottom: "14px" }}>This week average</div>
          {focusChartData.length ? (
            <ResponsiveContainer width="100%" height={155}>
              <BarChart data={focusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "#f4f4f5"} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={tip} formatter={(v: any) => [v + "%", "Focus"]} />
                <Bar dataKey="focus" fill={accent} radius={[4, 4, 0, 0]} barSize={22} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 155, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: muted }}>No focus data recorded yet.</div>
          )}
        </Card>
        <Card theme={theme}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Activity by Type</div>
          <div style={{ fontSize: "12px", color: muted, marginBottom: "14px" }}>Recent events logged</div>
          {activityChartData.length ? (
            <ResponsiveContainer width="100%" height={155}>
              <BarChart data={activityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "#f4f4f5"} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tip} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={22} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 155, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: muted }}>No activity recorded yet.</div>
          )}
        </Card>
      </div>

      <Card theme={theme}>
        <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "16px" }}>Session History</div>
        <div style={{ display: "grid", gridTemplateColumns: "80px 60px 70px 1fr 80px 60px 80px", borderBottom: `1px solid ${border}`, paddingBottom: "8px", marginBottom: "2px" }}>
          {["Date", "Day", "Subject", "Content", "Duration", "Focus", "Type"].map(h => (
            <div key={h} style={{ fontSize: "11px", color: muted, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 8px" }}>{h}</div>
          ))}
        </div>
        {sessionRows.length ? sessionRows.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 60px 70px 1fr 80px 60px 80px", padding: "10px 0", borderBottom: i < sessionRows.length - 1 ? `1px solid ${border}` : "none", alignItems: "center" }}>
            <div style={{ fontSize: "12px", color: text, padding: "0 8px" }}>{s.date}</div>
            <div style={{ fontSize: "12px", color: muted, padding: "0 8px" }}>{s.day}</div>
            <div style={{ padding: "0 8px" }}><span style={{ fontSize: "11px", color: accent, background: `${accent}15`, padding: "2px 6px", borderRadius: "4px", fontWeight: "500" }}>{s.subject}</span></div>
            <div style={{ fontSize: "12px", color: text, fontWeight: "400", padding: "0 8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.content}</div>
            <div style={{ fontSize: "12px", color: muted, padding: "0 8px" }}>{s.duration}</div>
            <div style={{ fontSize: "12px", color: "#22c55e", fontWeight: "500", padding: "0 8px" }}>{s.focus}</div>
            <div style={{ padding: "0 8px" }}><span style={{ fontSize: "11px", color: typeColor[s.type] || accent, background: `${typeColor[s.type] || accent}15`, padding: "2px 6px", borderRadius: "4px", fontWeight: "500" }}>{s.type}</span></div>
          </div>
        )) : (
          <div style={{ padding: "28px 0", textAlign: "center", fontSize: "12px", color: muted }}>
            No sessions recorded yet.
          </div>
        )}
      </Card>
    </div>
  )
}