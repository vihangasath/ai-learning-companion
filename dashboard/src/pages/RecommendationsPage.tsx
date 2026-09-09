import { useState, useEffect } from "react"
import Card from "../components/Card"
import { recommendationsApi } from "../services/apiService"

const DECK_COLORS = ["#14b8a6", "#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ec4899"]
const diffColor: Record<string, string> = { Beginner: "#22c55e", Intermediate: "#f59e0b", Advanced: "#ef4444" }

interface DisplayItem {
  title: string
  sub: string
  time: string
  level: string
  match: number
  color: string
  id?: string
}

export default function RecommendationsPage({ theme }: any) {
  const { text, textSec, muted, accent, border, hover } = theme
  const [tab, setTab] = useState("All")
  const [items, setItems] = useState<DisplayItem[]>([])
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setApiLoading(true)
      try {
        const result = await recommendationsApi.getAll()
        if (!cancelled && result.recommendations?.length) {
          setItems(
            result.recommendations.map((r, i) => ({
              id: r.id,
              title: r.title,
              sub: r.subject || "General",
              time: r.duration || "–",
              level: r.difficulty || "Mixed",
              match: r.match_score ?? 80,
              color: DECK_COLORS[i % DECK_COLORS.length],
            }))
          )
        }
      } catch (_) {
        // backend unavailable — leave list empty
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const subjectLabel = (s: string) => {
    const map: Record<string, string> = {
      math: "Mathematics",
      programming: "Computer Science",
      ml: "Machine Learning",
      dl: "Deep Learning",
      specialized: "Specialized",
    }
    return map[s] ?? s
  }

  const tabs = Array.from(new Set(items.map(i => subjectLabel(i.sub))))

  const shown = tab === "All" ? items : items.filter(i => subjectLabel(i.sub) === tab)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>Recommendations</h1>
          <p style={{ fontSize: "13px", color: textSec }}>Topics recommended based on the learning graph</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {apiLoading && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accent, opacity: 0.6 }} />}
          {tabs.length > 1 && (
            <div style={{ display: "flex", gap: "4px" }}>
              {["All", ...tabs].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 12px", borderRadius: "6px", border: `1px solid ${tab === t ? accent : border}`, color: tab === t ? accent : muted, fontSize: "12px", cursor: "pointer", background: tab === t ? `${accent}10` : "transparent", fontWeight: tab === t ? "500" : "400" }}>{t}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {shown.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
          {shown.map(item => (
            <Card key={item.id ?? item.title} theme={theme} style={{ cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color, flexShrink: 0, marginTop: "5px" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: text, fontWeight: "500", fontSize: "13px", lineHeight: 1.4, marginBottom: "3px" }}>{item.title}</div>
                  <div style={{ fontSize: "11px", color: muted }}>{subjectLabel(item.sub)}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", color: muted }}>{item.time}</span>
                <span style={{ fontSize: "10px", color: muted }}>·</span>
                <span style={{ fontSize: "11px", color: diffColor[item.level] ?? muted, fontWeight: "500" }}>{item.level}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "6px", background: hover, border: `1px solid ${border}` }}>
                <span style={{ fontSize: "12px", color: item.color, fontWeight: "600" }}>{item.match}% match</span>
                <span style={{ fontSize: "11px", color: accent, fontWeight: "500" }}>View →</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card theme={theme} style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>✨</div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: text, marginBottom: "4px" }}>No recommendations yet</div>
          <div style={{ fontSize: "12px", color: muted }}>
            Recommendations are generated from the learning knowledge graph. Check back once you start studying topics.
          </div>
        </Card>
      )}
    </div>
  )
}