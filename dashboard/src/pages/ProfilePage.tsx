import { useEffect, useState } from "react"
import Card from "../components/Card"
import { useCurrentUser, initialsFor } from "../hooks/useCurrentUser"
import { analyticsApi, flashcardsApi, quizApi, notesApi, type RecentActivityItem } from "../services/apiService"

const BAR_COLORS = ["#14b8a6", "#3b82f6", "#8b5cf6", "#f59e0b", "#22c55e", "#ec4899"]

const EVENT_TAG_MAP: Record<string, { label: string; color: string }> = {
  video_play: { label: "Video", color: "#14b8a6" },
  video_complete: { label: "Video", color: "#14b8a6" },
  summary_generated: { label: "Notes", color: "#22c55e" },
  quiz_generated: { label: "Quiz", color: "#22c55e" },
  quiz_submitted: { label: "Quiz", color: "#22c55e" },
  flashcard_opened: { label: "Flashcard", color: "#3b82f6" },
  note_viewed: { label: "Notes", color: "#8b5cf6" },
  session_start: { label: "Session", color: "#f59e0b" },
}

export default function ProfilePage({ theme }: any) {
  const { text, textSec, muted, accent, border, dark, hover } = theme
  const { user } = useCurrentUser()

  const [totalHours, setTotalHours] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [overallAccuracy, setOverallAccuracy] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [recent, setRecent] = useState<RecentActivityItem[]>([])
  const [flashcardCount, setFlashcardCount] = useState(0)
  const [noteCount, setNoteCount] = useState(0)
  const [subjects, setSubjects] = useState<{ name: string; sessions: number }[]>([])
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setApiLoading(true)
      try {
        const [st, sk, perf, rc, fc, qz, nt, sb] = await Promise.allSettled([
          analyticsApi.getStudyTime(365),
          analyticsApi.getStreaks(),
          analyticsApi.getPerformance(),
          analyticsApi.getRecent(50),
          flashcardsApi.getAll(0, 200),
          quizApi.getAll(0, 50),
          notesApi.getAll(0, 50),
          analyticsApi.getSubjects(),
        ])
        if (cancelled) return
        if (st.status === "fulfilled") setTotalHours(st.value.total_hours)
        if (sk.status === "fulfilled") setCurrentStreak(sk.value.current_streak)
        if (perf.status === "fulfilled") setOverallAccuracy(perf.value.overall_accuracy)
        if (perf.status === "fulfilled") setQuizCount(perf.value.total_quizzes)
        if (rc.status === "fulfilled") setRecent(rc.value ?? [])
        if (fc.status === "fulfilled") setFlashcardCount(fc.value.total)
        if (qz.status === "fulfilled") setQuizCount(prev => prev || quizApiAllTotal(qz.value))
        if (nt.status === "fulfilled") setNoteCount(nt.value.total ?? nt.value.notes?.length ?? 0)
        if (sb.status === "fulfilled") setSubjects(sb.value.subjects ?? [])
      } catch (_) {
        // backend unavailable — leave state empty
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const memberSince = user?.created_at ? new Date(user.created_at).getFullYear() : null
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""
  const identityLine = user
    ? `${roleLabel} · ${user.email}${memberSince ? ` · Member since ${memberSince}` : ""}`
    : "Your learning identity"

  // Achievements derived from real stats
  const achievements = [
    currentStreak >= 1 && { name: `${currentStreak}-Day Streak`, desc: `Studied ${currentStreak} days in a row`, color: "#f59e0b" },
    noteCount >= 1 && { name: "Content Curator", desc: `Saved ${noteCount} study ${noteCount === 1 ? "note" : "notes"}`, color: "#14b8a6" },
    flashcardCount >= 1 && { name: "Flashcard Learner", desc: `${flashcardCount} flashcards generated`, color: "#3b82f6" },
    quizCount >= 1 && { name: "Quiz Taker", desc: `Completed ${quizCount} ${quizCount === 1 ? "quiz" : "quizzes"}`, color: "#8b5cf6" },
  ].filter(Boolean) as { name: string; desc: string; color: string }[]

  const availableAchievements = 4 - achievements.length

  const subjectBars = subjects.map((s, i) => ({
    name: s.name,
    sessions: s.sessions,
    color: BAR_COLORS[i % BAR_COLORS.length],
  }))

  // Group recent events by date
  const recentGroups = (() => {
    const groups: Record<string, { label: string; items: { title: string; tag: string; color: string }[] }> = {}
    ;[...recent].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).forEach(item => {
      const dateStr = item.timestamp ? new Date(item.timestamp).toISOString().slice(0, 10) : "unknown"
      if (!groups[dateStr]) {
        const d = item.timestamp ? new Date(item.timestamp) : null
        const label = d
          ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "Unknown date"
        groups[dateStr] = { label, items: [] }
      }
      const mapped = EVENT_TAG_MAP[item.event_type] ?? { label: "Activity", color: "#a1a1aa" }
      groups[dateStr].items.push({
        title: item.content_id || item.event_type,
        tag: mapped.label,
        color: mapped.color,
      })
    })
    return Object.values(groups).slice(0, 5)
  })()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>Profile</h1>
        <p style={{ fontSize: "13px", color: textSec }}>Your learning identity and progress</p>
      </div>

      <Card theme={theme}>
        <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "20px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: `linear-gradient(135deg,${accent},#3b82f6)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "20px", fontWeight: "700", flexShrink: 0 }}>{initialsFor(user?.name)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "18px", fontWeight: "600", color: text, letterSpacing: "-0.02em" }}>{user?.name ?? "Learner"}</div>
            <div style={{ fontSize: "13px", color: muted, marginTop: "3px" }}>{identityLine}</div>
            <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
              {achievements.slice(0, 3).map(a => (
                <span key={a.name} style={{ fontSize: "11px", color: a.color, background: `${a.color}12`, padding: "3px 8px", borderRadius: "4px", fontWeight: "500" }}>{a.name}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", borderTop: `1px solid ${border}`, paddingTop: "16px" }}>
          {[
            [`${totalHours.toFixed(1)}h`, "Study hours", "#14b8a6"],
            [String(noteCount), "Notes saved", "#3b82f6"],
            [String(quizCount), "Quizzes", "#8b5cf6"],
            [`${overallAccuracy}%`, "Avg score", "#22c55e"],
            [String(currentStreak), "Day streak", "#f59e0b"],
          ].map(([v, l, c]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: "600", color: c as string, letterSpacing: "-0.03em" }}>{v}</div>
              <div style={{ fontSize: "11px", color: muted, marginTop: "3px" }}>{l}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Card theme={theme}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "14px" }}>Subject Activity</div>
          {subjectBars.length ? subjectBars.slice(0, 6).map(s => (
            <div key={s.name} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "12px", color: text }}>{s.name}</span>
                <span style={{ fontSize: "12px", color: muted }}>{s.sessions} sessions</span>
              </div>
              <div style={{ height: "5px", background: dark ? "rgba(255,255,255,0.06)" : "#f4f4f5", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "5px", width: `${Math.min(100, s.sessions * 10)}%`, background: s.color, borderRadius: "3px" }} />
              </div>
            </div>
          )) : (
            <div style={{ padding: "24px 0", textAlign: "center", fontSize: "12px", color: muted }}>
              No subject activity yet. Study topics to see your breakdown here.
            </div>
          )}
        </Card>
        <Card theme={theme}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "14px" }}>Achievements</div>
          {achievements.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {achievements.map(a => (
                <div key={a.name} style={{ padding: "10px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: hover }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: `${a.color}18`, marginBottom: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: a.color }} />
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: "500", color: text, marginBottom: "2px" }}>{a.name}</div>
                  <div style={{ fontSize: "11px", color: muted, lineHeight: 1.4 }}>{a.desc}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "24px 0", textAlign: "center", fontSize: "12px", color: muted }}>
              No achievements yet. Start studying to unlock badges.
            </div>
          )}
          {availableAchievements > 0 && (
            <div style={{ fontSize: "11px", color: muted, marginTop: "10px" }}>
              + {availableAchievements} locked badge{availableAchievements > 1 ? "s" : ""}
            </div>
          )}
        </Card>
      </div>

      <Card theme={theme}>
        <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "14px" }}>Recent Activity</div>
        {recentGroups.length ? recentGroups.map(day => (
          <div key={day.label} style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "11px", color: accent, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>{day.label}</div>
            {day.items.map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "6px", marginBottom: "4px", background: hover }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: text, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.title}</span>
                <span style={{ fontSize: "10px", color: e.color, background: `${e.color}14`, padding: "1px 6px", borderRadius: "4px", fontWeight: "500", flexShrink: 0 }}>{e.tag}</span>
              </div>
            ))}
          </div>
        )) : (
          <div style={{ padding: "24px 0", textAlign: "center", fontSize: "12px", color: muted }}>
            No recent activity yet.
          </div>
        )}
      </Card>
    </div>
  )
}

function quizApiAllTotal(v: { total?: number; quizzes?: unknown[] }): number {
  if (typeof v.total === "number") return v.total
  return v.quizzes?.length ?? 0
}