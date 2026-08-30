import { useState } from "react"
import Card from "../components/Card"
import { categorizeBookmarkText, type SmartBookmark } from "../services/advancedFeaturesService"

const initialBookmarks: SmartBookmark[] = [
  { id: "b1", title: "Photosynthesis Definition", url: "https://wikipedia.org/wiki/Photosynthesis", text: "Photosynthesis is defined as the process by which green plants convert light into chemical energy.", category: "Definition", aiLabel: "Core Definition", createdAt: "2 days ago", color: "#14b8a6" },
  { id: "b2", title: "Newton's Second Law Equation", url: "https://physics.info/motion", text: "Force equals mass times acceleration (F = ma).", category: "Formula", aiLabel: "Math Formula", createdAt: "3 days ago", color: "#3b82f6" },
  { id: "b3", title: "Derivatives in Machine Learning", url: "https://youtube.com/watch?v=1", text: "Why does gradient descent use the derivative of loss over weights?", category: "Question", aiLabel: "Key Inquiry", createdAt: "4 days ago", color: "#8b5cf6" },
  { id: "b4", title: "Neural Network Backpropagation", url: "https://arxiv.org/abs/1706.03762", text: "Backpropagation calculates loss gradient with respect to each weight via chain rule.", category: "Concept", aiLabel: "Important Concept", createdAt: "5 days ago", color: "#22c55e" },
  { id: "b5", title: "K-Means Clustering Example", url: "https://scikit-learn.org", text: "For example, grouping customer purchase data into 5 distinct demographic clusters.", category: "Example", aiLabel: "Practical Example", createdAt: "6 days ago", color: "#f59e0b" },
]

const categories = ["All", "Definition", "Formula", "Question", "Concept", "Example"]

export default function BookmarksPage({ theme }: any) {
  const { text, textSec, muted, accent, border, hover, inputBg } = theme
  const [filter, setFilter] = useState("All")
  const [bookmarks, setBookmarks] = useState<SmartBookmark[]>(initialBookmarks)
  const [newText, setNewText] = useState("")
  const [newTitle, setNewTitle] = useState("")

  const handleAddBookmark = () => {
    if (!newText.trim()) return
    const { category, aiLabel } = categorizeBookmarkText(newText)
    const newBm: SmartBookmark = {
      id: `b-${Date.now()}`,
      title: newTitle.trim() || `Bookmark: ${newText.slice(0, 25)}...`,
      url: "https://learnflow.ai/resource",
      text: newText,
      category,
      aiLabel,
      createdAt: "Just now",
      color: category === "Definition" ? "#14b8a6" : category === "Formula" ? "#3b82f6" : category === "Question" ? "#8b5cf6" : category === "Concept" ? "#22c55e" : "#f59e0b"
    }
    setBookmarks([newBm, ...bookmarks])
    setNewText("")
    setNewTitle("")
  }

  const handleDelete = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id))
  }

  const shown = filter === "All" ? bookmarks : bookmarks.filter(b => b.category === filter)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>
            📌 Smart Bookmarks
          </h1>
          <p style={{ fontSize: "13px", color: textSec }}>
            AI-categorized bookmarks with intelligent labels (Definitions, Formulas, Questions, Concepts)
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
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add New Smart Bookmark Box */}
      <Card theme={theme} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "14px" }}>
        <div style={{ fontSize: "13px", fontWeight: "600", color: text }}>+ Add Smart AI Bookmark</div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Title (optional)"
            style={{
              width: "200px",
              padding: "8px 10px",
              borderRadius: "6px",
              border: `1px solid ${border}`,
              background: inputBg,
              color: text,
              fontSize: "12px",
              outline: "none"
            }}
          />
          <input
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Paste text snippet (AI will automatically categorize it)..."
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: "6px",
              border: `1px solid ${border}`,
              background: inputBg,
              color: text,
              fontSize: "12px",
              outline: "none"
            }}
          />
          <button
            onClick={handleAddBookmark}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "none",
              background: accent,
              color: "#042f2e",
              fontWeight: "600",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            Save & Categorize
          </button>
        </div>
      </Card>

      {/* Bookmarks Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
        {shown.map(b => (
          <Card key={b.id} theme={theme} style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                <span style={{ color: text, fontSize: "13px", fontWeight: "600" }}>{b.title}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "10px", color: b.color, background: `${b.color}15`, padding: "2px 7px", borderRadius: "4px", fontWeight: "500" }}>
                  {b.aiLabel}
                </span>
                <span onClick={() => handleDelete(b.id)} style={{ fontSize: "11px", color: muted, cursor: "pointer", marginLeft: "4px" }}>
                  ✕
                </span>
              </div>
            </div>

            <div style={{ fontSize: "12px", color: textSec, background: hover, padding: "8px 10px", borderRadius: "6px", borderLeft: `2px solid ${b.color}` }}>
              &quot;{b.text}&quot;
            </div>

            <div style={{ fontSize: "11px", color: muted, display: "flex", justifyContent: "space-between" }}>
              <span>{b.url}</span>
              <span>{b.createdAt}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
