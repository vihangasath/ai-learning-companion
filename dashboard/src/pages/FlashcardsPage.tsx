import { useState, useEffect } from "react"
import Card from "../components/Card"
import { flashcardsApi, type Flashcard } from "../services/apiService"

const MOCK_DECKS = [
  { name: "Machine Learning", cards: 45, done: 32, color: "#14b8a6" },
  { name: "Calculus", cards: 38, done: 38, color: "#3b82f6" },
  { name: "Quantum Physics", cards: 29, done: 14, color: "#8b5cf6" },
  { name: "Data Structures", cards: 52, done: 41, color: "#22c55e" },
  { name: "World History", cards: 33, done: 20, color: "#f59e0b" },
  { name: "Python", cards: 28, done: 28, color: "#ec4899" },
]
const MOCK_CARDS = [
  { q: "What is gradient descent?", a: "An optimization algorithm that minimizes a loss function by iteratively moving in the direction of steepest descent." },
  { q: "What is a neural network?", a: "A computational model inspired by the brain, consisting of interconnected nodes organized in layers that process information." },
  { q: "What is backpropagation?", a: "An algorithm for training neural networks by computing gradients of the loss with respect to weights, using the chain rule." },
]

const DECK_COLORS = ["#14b8a6", "#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ec4899"]

export default function FlashcardsPage({ theme }: any) {
  const { text, textSec, muted, accent, border, dark, hover, card: cardBg } = theme
  const [flipped, setFlipped] = useState(false)
  const [idx, setIdx] = useState(0)
  const [apiFlashcards, setApiFlashcards] = useState<Flashcard[] | null>(null)
  const [apiLoading, setApiLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setApiLoading(true)
      try {
        const result = await flashcardsApi.getAll()
        if (!cancelled) setApiFlashcards(result.flashcards)
      } catch (_) {
        // fall back to mock
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Build decks from API flashcards if available
  const decks = apiFlashcards?.length
    ? (() => {
        const grouped: Record<string, Flashcard[]> = {}
        apiFlashcards.forEach(fc => {
          if (!grouped[fc.content_id]) grouped[fc.content_id] = []
          grouped[fc.content_id].push(fc)
        })
        return Object.entries(grouped).map(([cid, fcs], i) => ({
          name: `Content ${cid.slice(0, 8)}...`,
          cards: fcs.length,
          done: fcs.filter(f => f.is_learned).length,
          color: DECK_COLORS[i % DECK_COLORS.length],
        }))
      })()
    : MOCK_DECKS

  const practiceCards = apiFlashcards?.length
    ? apiFlashcards.slice(0, 10).map(fc => ({ q: fc.question, a: fc.answer }))
    : MOCK_CARDS

  const safeIdx = Math.min(idx, practiceCards.length - 1)

  const handleMarkLearned = async () => {
    if (!apiFlashcards) return
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
        {decks.map(d => (
          <Card key={d.name} theme={theme} style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ fontSize: "13px", fontWeight: "500", color: text }}>{d.name}</div>
              {d.done === d.cards && <span style={{ fontSize: "10px", color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "2px 6px", borderRadius: "4px", fontWeight: "500" }}>Complete</span>}
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
        <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>Practice — {apiFlashcards?.length ? "Your Flashcards" : "Machine Learning"}</div>
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
    </div>
  )
}
