import { useState, useRef } from "react"
import Card from "../components/Card"
import { searchApi, type SearchResult } from "../services/apiService"

const KNOWN_SEARCH_TERMS = ["neural networks", "gradient descent", "vector spaces", "python basics", "photosynthesis", "calculus"]

export default function SearchPage({ theme }: any) {
  const { text, textSec, muted, accent, border, hover, inputBg } = theme
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [apiLoading, setApiLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = (q: string) => {
    setQuery(q)
    setHasSearched(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!q.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }
    timerRef.current = setTimeout(async () => {
      setApiLoading(true)
      try {
        const res = await searchApi.search(q)
        setResults(res.results)
      } catch (_) {
        setResults([])
      } finally {
        setApiLoading(false)
      }
    }, 300)
  }

  const handleClickSearch = async (q: string) => {
    setQuery(q)
    setHasSearched(true)
    setApiLoading(true)
    try {
      const res = await searchApi.search(q)
      setResults(res.results)
    } catch (_) {
      setResults([])
    } finally {
      setApiLoading(false)
    }
  }

  const kindLabel: Record<string, { label: string; color: string }> = {
    note: { label: "Notes", color: "#22c55e" },
    flashcard: { label: "Flashcard", color: "#3b82f6" },
    topic: { label: "Topic", color: "#8b5cf6" },
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>
          🔎 Search
        </h1>
        <p style={{ fontSize: "13px", color: textSec }}>
          Search across your saved notes, flashcards, and learning topics
        </p>
      </div>

      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: muted, fontSize: "13px" }}>
          🔍
        </span>
        <input
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleClickSearch(query)}
          placeholder="Search your study content..."
          style={{
            width: "100%",
            padding: "10px 12px 10px 38px",
            borderRadius: "8px",
            border: `1px solid ${border}`,
            background: inputBg,
            color: text,
            fontSize: "13px",
            outline: "none"
          }}
        />
      </div>

      <Card theme={theme} style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <span style={{ fontSize: "13px", fontWeight: "600", color: text }}>
            {hasSearched ? (query ? `Results for "${query}"` : "Type a query") : "Start typing to search"}
          </span>
          {apiLoading && <span style={{ fontSize: "11px", color: accent }}>Searching...</span>}
        </div>

        {results.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {results.map(r => (
              <div
                key={`${r.kind}-${r.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  borderRadius: "8px",
                  background: hover,
                  border: `1px solid ${border}`,
                  cursor: "pointer"
                }}
              >
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: kindLabel[r.kind]?.color ?? accent, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: text, fontSize: "13px", fontWeight: "600" }}>{r.title}</div>
                  <div style={{ fontSize: "12px", color: textSec, marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.text}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                  <span style={{ fontSize: "11px", color: r.score >= 90 ? "#10b981" : accent, fontWeight: "600" }}>{r.score}% Match</span>
                  <span style={{ fontSize: "10px", color: kindLabel[r.kind]?.color ?? accent, background: `${kindLabel[r.kind]?.color ?? accent}15`, padding: "2px 7px", borderRadius: "4px", fontWeight: "500" }}>
                    {kindLabel[r.kind]?.label ?? r.kind}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          <div style={{ padding: "24px 0", textAlign: "center", fontSize: "13px", color: muted }}>
            {apiLoading ? "Searching..." : `No results found for "${query}". Try a different term.`}
          </div>
        ) : (
          <div style={{ padding: "24px 0", textAlign: "center", fontSize: "13px", color: muted }}>
            Type a query above to search your notes, flashcards, and topics.
          </div>
        )}
      </Card>

      {!hasSearched && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <Card theme={theme}>
            <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "12px" }}>Suggested Searches</div>
            {KNOWN_SEARCH_TERMS.map(r => (
              <div
                key={r}
                onClick={() => handleClickSearch(r)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "6px", cursor: "pointer", marginBottom: "2px" }}
              >
                <span style={{ color: accent, fontSize: "11px", fontWeight: "600", width: "14px" }}>↻</span>
                <span style={{ color: text, fontSize: "13px" }}>{r}</span>
              </div>
            ))}
          </Card>
          <Card theme={theme}>
            <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "12px" }}>Popular Topics</div>
            {["neural networks", "photosynthesis", "python basics", "transformers", "calculus"].map((t, i) => (
              <div
                key={t}
                onClick={() => handleClickSearch(t)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "6px", cursor: "pointer", marginBottom: "2px" }}
              >
                <span style={{ color: accent, fontSize: "11px", fontWeight: "600", width: "14px" }}>#{i + 1}</span>
                <span style={{ color: text, fontSize: "13px" }}>{t}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}