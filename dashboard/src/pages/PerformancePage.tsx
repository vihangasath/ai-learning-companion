import { useEffect, useState } from "react"
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from "recharts"
import Card from "../components/Card"
import { analyticsApi, type PerformanceData } from "../services/apiService"

const BAR_COLORS = ["#14b8a6", "#3b82f6", "#8b5cf6", "#f59e0b", "#22c55e", "#ec4899"]

export default function PerformancePage({ theme }: any) {
  const { text, textSec, muted, accent, border, card, dark } = theme
  const tip = { background: card, border: `1px solid ${border}`, borderRadius: "8px", color: text, fontSize: "12px" }

  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [subjects, setSubjects] = useState<{ name: string; sessions: number }[] | null>(null)
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setApiLoading(true)
      try {
        const [perf, subs] = await Promise.allSettled([
          analyticsApi.getPerformance(),
          analyticsApi.getSubjects(),
        ])
        if (cancelled) return
        if (perf.status === "fulfilled") setPerformance(perf.value)
        if (subs.status === "fulfilled") setSubjects(subs.value.subjects ?? [])
      } catch (_) {
        // backend unavailable — leave state empty
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Real data only
  const radar = (subjects ?? []).map(s => ({ subject: s.name, sessions: s.sessions }))
  const quizTrend = (performance?.subject_breakdown ?? []).map((qb, i) => ({
    week: qb.completed_at ? new Date(qb.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : `Q${i + 1}`,
    score: qb.score,
  }))
  const subjectBars = (subjects ?? []).map((s, i) => ({ name: s.name, sessions: s.sessions, color: BAR_COLORS[i % BAR_COLORS.length] }))

  const overallAccuracy = performance?.overall_accuracy ?? 0
  const totalQuizzes = performance?.total_quizzes ?? 0
  const totalSubjects = (subjects ?? []).length

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>Performance</h1>
        <p style={{ fontSize: "13px", color: textSec }}>Track your quiz scores and subject mastery levels</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
        {[
          { label: "Overall Accuracy", value: `${overallAccuracy}%`, color: "#14b8a6" },
          { label: "Quizzes Taken", value: String(totalQuizzes), color: "#3b82f6" },
          { label: "Subjects Studied", value: String(totalSubjects), color: "#8b5cf6" },
          { label: "Quiz Results", value: String(quizTrend.length), color: "#f59e0b" },
        ].map(s => (
          <Card key={s.label} theme={theme} style={{ padding: "16px" }}>
            <div style={{ fontSize: "11px", color: muted, fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{s.label}</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: s.color, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Card theme={theme}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Subject Activity</div>
          <div style={{ fontSize: "12px", color: muted, marginBottom: "12px" }}>Sessions per subject studied</div>
          {radar.length ? (
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={radar}>
                <PolarGrid stroke={dark ? "rgba(255,255,255,0.06)" : "#e4e4e7"} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: muted }} />
                <Radar dataKey="sessions" stroke={accent} fill={accent} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 210, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: muted }}>
              No subject activity recorded yet. Study sessions will appear here.
            </div>
          )}
        </Card>
        <Card theme={theme}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Quiz Score Trend</div>
          <div style={{ fontSize: "12px", color: muted, marginBottom: "16px" }}>Your latest quiz results</div>
          {quizTrend.length ? (
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={quizTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? "rgba(255,255,255,0.04)" : "#f4f4f5"} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: muted }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={tip} formatter={(v: any) => [v + "%", "Score"]} />
                <Line type="monotone" dataKey="score" stroke={accent} strokeWidth={2} dot={{ fill: accent, r: 4, stroke: card, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 210, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: muted }}>
              No quiz results yet. Take a quiz to see your score trend.
            </div>
          )}
        </Card>
      </div>

      <Card theme={theme}>
        <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "16px" }}>Subject Breakdown</div>
        {subjectBars.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {subjectBars.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "136px", fontSize: "13px", color: text, flexShrink: 0 }}>{s.name}</div>
                <div style={{ flex: 1, height: "6px", background: dark ? "rgba(255,255,255,0.06)" : "#f4f4f5", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "6px", width: `${Math.min(100, s.sessions * 10)}%`, background: s.color, borderRadius: "3px", transition: "width 0.5s" }} />
                </div>
                <div style={{ width: "32px", fontSize: "13px", fontWeight: "500", color: text, textAlign: "right", flexShrink: 0 }}>{s.sessions}</div>
                <div style={{ width: "48px", fontSize: "12px", color: muted, flexShrink: 0 }}>sessions</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "28px 0", textAlign: "center", fontSize: "12px", color: muted }}>
            No subject data yet. Once you study topics, your activity will show here.
          </div>
        )}
      </Card>
    </div>
  )
}