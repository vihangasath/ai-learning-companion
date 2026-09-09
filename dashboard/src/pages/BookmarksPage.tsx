import { useState, useEffect } from "react"
import Card from "../components/Card"
import { notesApi, type Note } from "../services/apiService"

const CATEGORY_COLORS: Record<string, string> = {
  article: "#14b8a6",
  youtube: "#22c55e",
  pdf: "#8b5cf6",
}

const typeLabel = (type: string) => {
  const map: Record<string, string> = { article: "Article", youtube: "YouTube", pdf: "PDF" }
  return map[type] ?? type
}

export default function BookmarksPage({ theme }: any) {
  const { text, textSec, muted, accent, border, hover, inputBg } = theme
  const [filter, setFilter] = useState("All")
  const [bookmarks, setBookmarks] = useState<Note[]>([])
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setApiLoading(true)
      try {
        const result = await notesApi.getAll(0, 100)
        if (!cancelled) setBookmarks(result.notes ?? [])
      } catch (_) {
        // backend unavailable — leave list empty
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const categories = ["All", ...Array.from(new Set(bookmarks.map(b => b.content_type)))]
  const shown = filter === "All" ? bookmarks : bookmarks.filter(b => b.content_type === filter)

  const handleDelete = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id))
  }

  const formatTime = (d: string) => {
    try {
      const dt = new Date(d)
      const now = new Date()
      const diffMs = now.getTime() - dt.getTime()
      const mins = Math.round(diffMs / 60000)
      if (mins < 60) return `${mins}m ago`
      const hours = Math.round(mins / 60)
      if (hours < 24) return `${hours}h ago`
      const days = Math.round(hours / 24)
      return `${days}d ago`
    } catch {
      return ""
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>
            📌 Saved Notes
          </h1>
          <p style={{ fontSize: "13px", color: textSec }}>
            Your analyzed study content — notes, summaries, and references
          </p>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: `1px solid ${filter === cat ? accent : border}`,
                color: filter === cat ? accent : muted,
                fontSize: "12px",
                cursor: "pointer",
                background: filter === cat ? `${accent}10` : "transparent",
                fontWeight: filter === cat ? "500" : "400"
              }}
            >
              {cat === "All" ? "All" : typeLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {!bookmarks.length ? (
        <Card theme={theme} style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>📌</div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: text, marginBottom: "4px" }}>No saved notes yet</div>
          <div style={{ fontSize: "12px", color: muted }}>
            Analyze a YouTube video, article, or PDF in the Content page to generate study notes.
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
          {shown.map(b => {
            const color = CATEGORY_COLORS[b.content_type] ?? "#a1a1aa"
            return (
              <Card key={b.id} theme={theme} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ color: text, fontSize: "13px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.title || "Untitled Note"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <span style={{ fontSize: "10px", color: color, background: `${color}15`, padding: "2px 7px", borderRadius: "4px", fontWeight: "500" }}>
                      {typeLabel(b.content_type)}
                    </span>
                    <span onClick={() => handleDelete(b.id)} style={{ fontSize: "11px", color: muted, cursor: "pointer", marginLeft: "4px" }}>
                      ✕
                    </span>
                  </div>
                </div>

                {b.summary && (
                  <div style={{ fontSize: "12px", color: textSec, background: hover, padding: "8px 10px", borderRadius: "6px", borderLeft: `2px solid ${color}` }}>
                    {b.summary.slice(0, 200)}
                  </div>
                )}

                {b.topics && (
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {(Array.isArray(b.topics) ? b.topics : (b.topics as string).split(/[\s,]+/)).filter(Boolean).slice(0, 3).map((t, i) => (
                      <span key={i} style={{ fontSize: "10px", color: accent, background: `${accent}10`, padding: "2px 6px", borderRadius: "4px" }}>{t}</span>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: "11px", color: muted, display: "flex", justifyContent: "space-between" }}>
                  <span>{b.content_url ? `URL: ${b.content_url.slice(0, 40)}...` : "Saved note"}</span>
                  <span>{formatTime(b.created_at)}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}