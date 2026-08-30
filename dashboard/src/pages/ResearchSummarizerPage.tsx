import { useState } from "react"
import Card from "../components/Card"
import { parseAndSummarizeResearchPaper, type ResearchSummaryResult } from "../services/advancedFeaturesService"

const samplePaper = `Abstract
We present an empirical study on AI-assisted learning systems and their impact on student engagement.

Introduction
Deep neural networks and natural language models have revolutionized active learning.

Methodology
We evaluated student focus metrics across 500 study sessions over 12 weeks.

Results
Our proposed model achieved an 88% focus rate improvement and 35% reduction in review duration.

References
1. Vaswani et al., Attention Is All You Need, 2017.`

export default function ResearchSummarizerPage({ theme }: any) {
  const { text, textSec, muted, accent, border, hover, inputBg } = theme
  const [inputText, setInputText] = useState(samplePaper)
  const [summaryData, setSummaryData] = useState<ResearchSummaryResult>(parseAndSummarizeResearchPaper(samplePaper))
  const [activeTab, setActiveTab] = useState<"sections" | "findings">("sections")

  const handleSummarize = () => {
    setSummaryData(parseAndSummarizeResearchPaper(inputText))
  }

  const sections = Object.values(summaryData.parsedSections)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>
            📄 Research Paper Summarizer
          </h1>
          <p style={{ fontSize: "13px", color: textSec }}>
            Automated section parsing, section-by-section summaries, and key findings extraction for academic papers
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setActiveTab("sections")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: `1px solid ${activeTab === "sections" ? accent : border}`,
              color: activeTab === "sections" ? accent : muted,
              fontSize: "12px",
              cursor: "pointer",
              background: activeTab === "sections" ? `${accent}15` : "transparent",
              fontWeight: activeTab === "sections" ? "500" : "400"
            }}
          >
            Sections ({sections.length})
          </button>
          <button
            onClick={() => setActiveTab("findings")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: `1px solid ${activeTab === "findings" ? accent : border}`,
              color: activeTab === "findings" ? accent : muted,
              fontSize: "12px",
              cursor: "pointer",
              background: activeTab === "findings" ? `${accent}15` : "transparent",
              fontWeight: activeTab === "findings" ? "500" : "400"
            }}
          >
            Key Findings
          </button>
        </div>
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
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleSummarize}
            style={{
              padding: "8px 18px",
              borderRadius: "8px",
              border: "none",
              background: accent,
              color: "#042f2e",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            🚀 Analyze & Summarize Paper
          </button>
        </div>
      </Card>

      {/* Header Info */}
      <Card theme={theme} style={{ padding: "16px" }}>
        <div style={{ fontSize: "16px", fontWeight: "600", color: text, marginBottom: "4px" }}>
          {summaryData.title}
        </div>
        <div style={{ fontSize: "12px", color: muted }}>
          Authors: {summaryData.authors}
        </div>
      </Card>

      {activeTab === "sections" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sections.map((sec, idx) => (
            <Card key={idx} theme={theme} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "10px", background: `${accent}20`, color: accent, padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                  SECTION {idx + 1}
                </span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: text }}>{sec.title}</span>
              </div>
              <div style={{ fontSize: "13px", color: textSec, background: hover, padding: "10px 12px", borderRadius: "6px", borderLeft: `3px solid ${accent}` }}>
                {sec.summary}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <Card theme={theme} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: text }}>💡 Key Empirical Findings</div>
            {summaryData.keyFindings.map((finding, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: textSec }}>
                <span style={{ color: accent, fontWeight: "bold" }}>•</span>
                <span>{finding}</span>
              </div>
            ))}
          </Card>

          <Card theme={theme} style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: text }}>🏆 Core Contributions</div>
            {summaryData.contributions.map((contrib, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: textSec }}>
                <span style={{ color: "#3b82f6", fontWeight: "bold" }}>✓</span>
                <span>{contrib}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}
