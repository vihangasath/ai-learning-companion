import { useState } from "react"
import Card from "../components/Card"
import { contentApi, type ContentAnalysisResult } from "../services/apiService"

export default function ResearchSummarizerPage({ theme }: any) {
  const { text, textSec, muted, accent, border, hover, inputBg } = theme
  const [inputText, setInputText] = useState("")
  const [summaryData, setSummaryData] = useState<ContentAnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState<"sections" | "findings">("sections")
  const [apiLoading, setApiLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSummarize = async () => {
    if (!inputText.trim()) return
    setApiLoading(true)
    setError(null)
    setSummaryData(null)
    try {
      const result = await contentApi.analyze(
        "",
        "article",
        inputText,
      )
      setSummaryData(result)
    } catch (e: any) {
      setError(e?.message || "Failed to analyze paper.")
    } finally {
      setApiLoading(false)
    }
  }

  const keyFindings = summaryData
    ? (summaryData.formulas ?? []).slice(0, 5).map(f => `${f.name}: ${f.raw_text}`)
    : []

  const sectionFromNotes = summaryData
    ? [
        { title: "Summary", text: summaryData.summary ?? "No summary generated." },
        { title: "Detailed Notes", text: summaryData.detailed_notes ?? "No detailed notes." },
        ...(summaryData.topics ?? []).map(t => ({ title: `Topic: ${t.topic}`, text: `Keywords: ${t.keywords?.join(", ") ?? "N/A"}` })),
      ]
    : []

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>
            📄 Research Paper Summarizer
          </h1>
          <p style={{ fontSize: "13px", color: textSec }}>
            Paste a research paper or academic text and let Gemini AI generate a structured summary
          </p>
        </div>
        {summaryData && (
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setActiveTab("sections")}
              style={{ padding: "6px 12px", borderRadius: "6px", border: `1px solid ${activeTab === "sections" ? accent : border}`, color: activeTab === "sections" ? accent : muted, fontSize: "12px", cursor: "pointer", background: activeTab === "sections" ? `${accent}15` : "transparent", fontWeight: activeTab === "sections" ? "500" : "400" }}
            >
              Sections ({sectionFromNotes.length})
            </button>
            <button
              onClick={() => setActiveTab("findings")}
              style={{ padding: "6px 12px", borderRadius: "6px", border: `1px solid ${activeTab === "findings" ? accent : border}`, color: activeTab === "findings" ? accent : muted, fontSize: "12px", cursor: "pointer", background: activeTab === "findings" ? `${accent}15` : "transparent", fontWeight: activeTab === "findings" ? "500" : "400" }}
            >
              Extracted Data
            </button>
          </div>
        )}
      </div>

      <Card theme={theme} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ fontSize: "14px", fontWeight: "600", color: text }}>Research Paper Text</div>
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          rows={5}
          placeholder="Paste research paper abstract, full text, or sections..."
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: `1px solid ${border}`,
            background: inputBg,
            color: text,
            fontSize: "13px",
            outline: "none",
            resize: "vertical"
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
          {apiLoading && <span style={{ fontSize: "12px", color: muted }}>Analyzing with Gemini...</span>}
          <button
            onClick={handleSummarize}
            disabled={apiLoading || !inputText.trim()}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              background: apiLoading ? muted : accent,
              color: "#042f2e",
              fontWeight: "600",
              fontSize: "13px",
              cursor: apiLoading ? "wait" : "pointer",
              opacity: apiLoading || !inputText.trim() ? 0.6 : 1,
            }}
          >
            Analyze & Summarize
          </button>
        </div>
      </Card>

      {error && (
        <Card theme={theme} style={{ padding: "16px", borderLeft: "3px solid #ef4444" }}>
          <div style={{ fontSize: "13px", color: "#ef4444" }}>{error}</div>
        </Card>
      )}

      {!summaryData && !error && (
        <Card theme={theme} style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>📄</div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: text, marginBottom: "4px" }}>Paste a paper to summarize</div>
          <div style={{ fontSize: "12px", color: muted }}>
            Enter a research paper abstract or full text, then click "Analyze & Summarize" for an AI-generated breakdown.
          </div>
        </Card>
      )}

      {summaryData && (
        <>
          <Card theme={theme} style={{ padding: "16px" }}>
            <div style={{ fontSize: "16px", fontWeight: "600", color: text, marginBottom: "4px" }}>
              {summaryData.title || "Untitled"}
            </div>
            {summaryData.summary && (
              <div style={{ fontSize: "12px", color: muted, marginTop: "6px" }}>
                {summaryData.summary.slice(0, 200)}
              </div>
            )}
          </Card>

          {activeTab === "sections" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sectionFromNotes.map((sec, idx) => (
                <Card key={idx} theme={theme} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "10px", background: `${accent}20`, color: accent, padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                      SECTION {idx + 1}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: text }}>{sec.title}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: textSec, background: hover, padding: "10px 12px", borderRadius: "6px", borderLeft: `3px solid ${accent}`, whiteSpace: "pre-wrap" }}>
                    {sec.text}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Card theme={theme} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: text }}>Key Topics</div>
                {(summaryData.topics ?? []).length > 0 ? (summaryData.topics ?? []).map((t, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: textSec }}>
                    <span style={{ color: accent, fontWeight: "bold" }}>•</span>
                    <span>{t.topic} — <span style={{ fontSize: "11px", color: muted }}>{Math.round(t.confidence * 100)}% confidence</span></span>
                  </div>
                )) : (
                  <div style={{ fontSize: "12px", color: muted }}>No topics extracted.</div>
                )}
              </Card>

              <Card theme={theme} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: text }}>Extracted Formulas</div>
                {(summaryData.formulas ?? []).length > 0 ? (summaryData.formulas ?? []).map((f, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: textSec }}>
                    <span style={{ color: "#3b82f6", fontWeight: "bold" }}>✓</span>
                    <span style={{ fontFamily: "serif" }}>{f.name}: <code style={{ fontSize: "12px" }}>{f.latex}</code></span>
                  </div>
                )) : (
                  <div style={{ fontSize: "12px", color: muted }}>No formulas extracted.</div>
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}