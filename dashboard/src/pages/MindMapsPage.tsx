import { useState } from "react"
import Card from "../components/Card"
import { generateMindMapFromText, type MindMapData } from "../services/advancedFeaturesService"

const sampleNotes = `# Machine Learning Ecosystem
- Supervised Learning
- Unsupervised Learning
- Neural Networks
- Optimization & Gradient Descent
- Model Evaluation`

export default function MindMapsPage({ theme }: any) {
  const { text, textSec, muted, accent, border, hover, inputBg } = theme
  const [inputText, setInputText] = useState(sampleNotes)
  const [mindMap, setMindMap] = useState<MindMapData>(generateMindMapFromText(sampleNotes))
  const [selectedNode, setSelectedNode] = useState<string | null>("root")
  const [viewMode, setViewMode] = useState<"visual" | "mermaid">("visual")

  const handleGenerate = () => {
    const data = generateMindMapFromText(inputText)
    setMindMap(data)
  }

  const activeNodeObj = mindMap.nodes.find(n => n.id === selectedNode)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>
            🧠 Mind Map Generator
          </h1>
          <p style={{ fontSize: "13px", color: textSec }}>
            Automatically transform educational text & notes into visual concept trees
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={() => setViewMode("visual")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: `1px solid ${viewMode === "visual" ? accent : border}`,
              color: viewMode === "visual" ? accent : muted,
              fontSize: "12px",
              cursor: "pointer",
              background: viewMode === "visual" ? `${accent}15` : "transparent",
              fontWeight: viewMode === "visual" ? "500" : "400"
            }}
          >
            Tree View
          </button>
          <button
            onClick={() => setViewMode("mermaid")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: `1px solid ${viewMode === "mermaid" ? accent : border}`,
              color: viewMode === "mermaid" ? accent : muted,
              fontSize: "12px",
              cursor: "pointer",
              background: viewMode === "mermaid" ? `${accent}15` : "transparent",
              fontWeight: viewMode === "mermaid" ? "500" : "400"
            }}
          >
            Mermaid Code
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
        {/* Left Panel: Text Input */}
        <Card theme={theme} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: text }}>Source Notes / Outline</div>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={10}
            placeholder="Paste your study notes or outline..."
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: `1px solid ${border}`,
              background: inputBg,
              color: text,
              fontSize: "13px",
              fontFamily: "monospace",
              outline: "none",
              resize: "vertical"
            }}
          />
          <button
            onClick={handleGenerate}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: accent,
              color: "#042f2e",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              transition: "opacity 0.15s"
            }}
          >
            ⚡ Generate Mind Map
          </button>
        </Card>

        {/* Right Panel: Visualization */}
        <Card theme={theme} style={{ display: "flex", flexDirection: "column", gap: "12px", minHeight: "420px" }}>
          {viewMode === "visual" ? (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", color: muted }}>Interactive Topic Canvas ({mindMap.nodes.length} Nodes)</span>
                {activeNodeObj && (
                  <span style={{ fontSize: "12px", color: activeNodeObj.color, fontWeight: "500" }}>
                    Selected: {activeNodeObj.label}
                  </span>
                )}
              </div>

              {/* Canvas Visualization */}
              <div
                style={{
                  position: "relative",
                  height: "360px",
                  borderRadius: "8px",
                  border: `1px solid ${border}`,
                  background: `${hover}`,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {/* SVG Connections */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                  {mindMap.edges.map((e, idx) => {
                    const sourceNode = mindMap.nodes.find(n => n.id === e.source)
                    const targetNode = mindMap.nodes.find(n => n.id === e.target)
                    if (!sourceNode || !targetNode) return null
                    return (
                      <line
                        key={idx}
                        x1={sourceNode.position.x * 0.9}
                        y1={sourceNode.position.y * 0.9}
                        x2={targetNode.position.x * 0.9}
                        y2={targetNode.position.y * 0.9}
                        stroke={border}
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    )
                  })}
                </svg>

                {/* Nodes */}
                {mindMap.nodes.map(n => {
                  const isSelected = selectedNode === n.id
                  return (
                    <div
                      key={n.id}
                      onClick={() => setSelectedNode(n.id)}
                      style={{
                        position: "absolute",
                        left: `${n.position.x * 0.85}px`,
                        top: `${n.position.y * 0.85}px`,
                        padding: n.level === 0 ? "10px 16px" : "8px 12px",
                        borderRadius: "20px",
                        background: isSelected ? n.color : `${n.color}20`,
                        border: `1.5px solid ${n.color}`,
                        color: isSelected ? "#ffffff" : text,
                        fontSize: n.level === 0 ? "13px" : "12px",
                        fontWeight: n.level === 0 ? "600" : "500",
                        cursor: "pointer",
                        boxShadow: isSelected ? `0 0 12px ${n.color}60` : "none",
                        transition: "all 0.15s ease",
                        transform: "translate(-50%, -50%)"
                      }}
                    >
                      {n.label}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "13px", color: muted }}>Mermaid.js Diagram Syntax</div>
              <pre
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  background: inputBg,
                  color: accent,
                  fontSize: "12px",
                  fontFamily: "monospace",
                  border: `1px solid ${border}`,
                  overflowX: "auto"
                }}
              >
                {mindMap.mermaid}
              </pre>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
