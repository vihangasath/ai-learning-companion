import { useState } from "react"
import Card from "../components/Card"
import { performSemanticSearch, type SemanticSearchResult } from "../services/advancedFeaturesService"

const recentQueries = ["neural networks", "gradient descent", "vector spaces", "python basics"]
const trendingTopics = ["Transformer models", "Quantum computing", "Linear regression", "Big O notation", "Thermodynamics"]

export default function SearchPage({ theme }: any) {
  const { text, textSec, muted, accent, border, hover, inputBg } = theme
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SemanticSearchResult[]>(performSemanticSearch(""))

  const handleQueryChange = (val: string) => {
    setQuery(val)
    setResults(performSemanticSearch(val))
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>
          🔎 Semantic Search
        </h1>
        <p style={{ fontSize: "13px", color: textSec }}>
          Concept-based search engine powered by vector embeddings and semantic similarity matching
        </p>
      </div>

      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: muted, fontSize: "13px" }}>
          🔍
        </span>
        <input
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder="Search by concept (e.g. 'optimization techniques', 'quantum wave', 'neural networks')..."
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
            Semantic Results {query ? `for "${query}"` : "(Recommended Concepts)"}
          </span>
          <span style={{ fontSize: "11px", color: accent, background: `${accent}15`, padding: "2px 8px", borderRadius: "4px", fontWeight: "500" }}>
            Vector Search Active
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {results.map(r => (
            <div
              key={r.id}
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
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: r.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: text, fontSize: "13px", fontWeight: "600" }}>{r.title}</div>
                <div style={{ fontSize: "12px", color: textSec, marginTop: "2px" }}>{r.text}</div>
                <div style={{ fontSize: "11px", color: muted, marginTop: "4px" }}>Subject: {r.subject}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                <span style={{ fontSize: "11px", color: r.similarityScore >= 90 ? "#10b981" : accent, fontWeight: "600" }}>
                  {r.similarityScore}% Match
                </span>
                <span style={{ fontSize: "10px", color: r.color, background: `${r.color}15`, padding: "2px 7px", borderRadius: "4px", fontWeight: "500" }}>
                  {r.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <Card theme={theme}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "12px" }}>Recent Queries</div>
          {recentQueries.map(r => (
            <div
              key={r}
              onClick={() => handleQueryChange(r)}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "6px", cursor: "pointer", marginBottom: "2px" }}
            >
              <span style={{ color: muted, fontSize: "11px" }}>↺</span>
              <span style={{ color: text, fontSize: "13px" }}>{r}</span>
            </div>
          ))}
        </Card>
        <Card theme={theme}>
          <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "12px" }}>Trending Concepts</div>
          {trendingTopics.map((t, i) => (
            <div
              key={t}
              onClick={() => handleQueryChange(t)}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "6px", cursor: "pointer", marginBottom: "2px" }}
            >
              <span style={{ color: accent, fontSize: "11px", fontWeight: "600", width: "14px" }}>#{i + 1}</span>
              <span style={{ color: text, fontSize: "13px" }}>{t}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
