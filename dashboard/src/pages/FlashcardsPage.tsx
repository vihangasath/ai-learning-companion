import { useState, useEffect } from "react"
import Card from "../components/Card"
import { flashcardsApi, notesApi, type Flashcard } from "../services/apiService"

const DECK_COLORS = ["#14b8a6", "#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ec4899"]

export default function FlashcardsPage({ theme }: any) {
  const { text, textSec, muted, accent, border, dark, hover, card: cardBg } = theme
  const [flipped, setFlipped] = useState(false)
  const [idx, setIdx] = useState(0)
  const [apiFlashcards, setApiFlashcards] = useState<Flashcard[] | null>(null)
  const [contentTitles, setContentTitles] = useState<Record<string, string>>({})
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setApiLoading(true)
      try {
        const [fc, nt] = await Promise.allSettled([
          flashcardsApi.getAll(0, 200),
          notesApi.getAll(0, 100),
        ])
        if (cancelled) return
        if (fc.status === "fulfilled") setApiFlashcards(fc.value.flashcards)
        if (nt.status === "fulfilled") {
          const map: Record<string, string> = {}
          nt.value.notes.forEach(n => { if (n.title) map[n.content_id] = n.title })
          setContentTitles(map)
        }
      } catch (_) {
        // backend unavailable — leave state empty
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const flashcards = apiFlashcards ?? []

  // Build decks from real flashcards
  const decks = (() => {
    const grouped: Record<string, Flashcard[]> = {}
    flashcards.forEach(fc => {
      if (!grouped[fc.content_id]) grouped[fc.content_id] = []
      grouped[fc.content_id].push(fc)
    })
    return Object.entries(grouped).map(([cid, fcs], i) => ({
      name: contentTitles[cid] || `Content ${cid.slice(0, 8)}`,
      cards: fcs.length,
      done: fcs.filter(f => f.is_learned).length,
      color: DECK_COLORS[i % DECK_COLORS.length],
    }))
  })()

  const practiceCards = flashcards.slice(0, 10).map(fc => ({ q: fc.question, a: fc.answer }))
  const safeIdx = practiceCards.length ? Math.min(idx, practiceCards.length - 1) : 0

  const handleMarkLearned = async () => {
    if (!apiFlashcards || !practiceCards.length) return
    const fc = apiFlashcards[safeIdx]
    if (!fc) return
    try {
      await flashcardsApi.markLearned(fc.id, true)
      setApiFlashcards(prev => prev ? prev.map(f => f.id === fc.id ? { ...f, is_learned: true } : f) : prev)
    } catch (_) {
      // silently fail
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>Flashcards</h1>
          <p style={{ fontSize: "13px", color: textSec }}>Review and memorize key concepts</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {apiLoading && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accent, opacity: 0.6 }} />}
          <button style={{ padding: "7px 14px", borderRadius: "6px", border: `1px solid ${border}`, background: "transparent", color: accent, fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>+ New deck</button>
        </div>
      </div>

      {!flashcards.length ? (
        <Card theme={theme} style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🃏</div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: text, marginBottom: "4px" }}>No flashcards yet</div>
          <div style={{ fontSize: "12px", color: muted }}>
            Analyze a YouTube video, article, or PDF in the Content page to automatically generate flashcards.
          </div>
        </Card>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
            {decks.map(d => (
              <Card key={d.name} theme={theme} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                  {d.done === d.cards && d.cards > 0 && <span style={{ fontSize: "10px", color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "2px 6px", borderRadius: "4px", fontWeight: "500" }}>Complete</span>}
                </div>
                <div style={{ height: "4px", background: dark ? "rgba(255,255,255,0.06)" : "#f4f4f5", borderRadius: "2px", marginBottom: "8px", overflow: "hidden" }}>
                  <div style={{ height: "4px", width: `${(d.done / d.cards) * 100}%`, background: d.color, borderRadius: "2px" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: muted }}>{d.done}/{d.cards} cards</span>
                  <span style={{ fontSize: "11px", color: d.color, fontWeight: "500" }}>{Math.round((d.done / d.cards) * 100)}%</span>
                </div>
              </Card>
            ))}
          </div>

          <Card theme={theme}>
            <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Practice — Your Flashcards</div>
            <div style={{ fontSize: "12px", color: muted, marginBottom: "16px" }}>Card {safeIdx + 1} of {practiceCards.length} · Click to flip</div>
            <div onClick={() => setFlipped(!flipped)} style={{ height: "150px", background: hover, border: `1px solid ${border}`, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: "24px", textAlign: "center" }}>
              <div>
                <div style={{ fontSize: "10px", color: accent, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>{flipped ? "Answer" : "Question"}</div>
                <div style={{ color: text, fontSize: "14px", lineHeight: 1.6 }}>{flipped ? practiceCards[safeIdx]?.a : practiceCards[safeIdx]?.q}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", justifyContent: "center" }}>
              <button onClick={() => { setFlipped(false); setIdx(Math.max(0, safeIdx - 1)) }} style={{ padding: "7px 16px", borderRadius: "6px", border: `1px solid ${border}`, background: "transparent", color: text, cursor: "pointer", fontSize: "12px" }}>← Prev</button>
              <button onClick={() => setFlipped(!flipped)} style={{ padding: "7px 16px", borderRadius: "6px", border: `1px solid ${accent}`, background: "transparent", color: accent, cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>Flip</button>
              {apiFlashcards && <button onClick={handleMarkLearned} style={{ padding: "7px 16px", borderRadius: "6px", border: `1px solid #22c55e`, background: "transparent", color: "#22c55e", cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>✓ Got it</button>}
              <button onClick={() => { setFlipped(false); setIdx(Math.min(practiceCards.length - 1, safeIdx + 1)) }} style={{ padding: "7px 16px", borderRadius: "6px", border: `1px solid ${border}`, background: "transparent", color: text, cursor: "pointer", fontSize: "12px" }}>Next →</button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}