import { useState, useEffect } from "react"
import Card from "../components/Card"
import { knowledgeApi, type KnowledgeNode } from "../services/apiService"
import { generateMindMapFromText, type MindMapData } from "./_mindmap_utils"

export default function MindMapsPage({ theme }: any) {
  const { text, textSec, muted, accent, border, hover, inputBg, dark } = theme
  const [viewMode, setViewMode] = useState<"text" | "graph">("graph")
  const [inputText, setInputText] = useState("# Machine Learning Ecosystem\n- Supervised Learning\n- Unsupervised Learning\n- Neural Networks\n- Optimization & Gradient Descent\n- Model Evaluation")
  const [mindMap, setMindMap] = useState<MindMapData | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [graphNodes, setGraphNodes] = useState<{ id: string; name: string; category: string; difficulty: string; prerequisites: string[]; x: number; y: number }[]>([])
  const [graphEdges, setGraphEdges] = useState<{ from: string; to: string }[]>([])
  const [graphApiLoading, setGraphApiLoading] = useState(true)
  const [graphError, setGraphError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setGraphApiLoading(true)
      try {
        const res = await knowledgeApi.getGraph()
        if (cancelled) return
        const g = res.graph
        const names = Object.keys(g)
        const nodeMap: Record<string, { id: string; name: string; x: number; y: number; category: string; difficulty: string; prerequisites: string[] }> = {}
        const cx = 320
        const cy = 200
        const count = names.length || 1
        const categories = Array.from(new Set(names.map(n => g[n].category || "other")))
        const catIndex: Record<string, number> = {}
        categories.forEach((c, i) => catIndex[c] = i)

        names.forEach((name, i) => {
          const cat = g[name].category || "other"
          const ci = catIndex[cat] ?? 0
          const catAngle = (ci / categories.length) * Math.PI * 2 - Math.PI / 2
          const inCatIdx = names.filter((n2, j2) => (g[n2].category || "other") === cat && j2 <= i).length
          const totalInCat = names.filter(n2 => (g[n2].category || "other") === cat).length || 1
          const catR = 120 + inCatIdx * 30
          nodeMap[name] = {
            id: name,
            name,
            category: cat,
            difficulty: g[name].difficulty,
            prerequisites: g[name].prerequisites,
            x: cx + Math.cos(catAngle) * catR + (Math.random() - 0.5) * 20,
            y: cy + Math.sin(catAngle) * catR * 0.7 + (Math.random() - 0.5) * 15,
          }
        })

        const edges: { from: string; to: string }[] = []
        names.forEach(name => {
          ;(g[name].prerequisites ?? []).forEach((pre: string) => {
            if (nodeMap[pre]) edges.push({ from: pre, to: name })
          })
        })

        if (!cancelled) {
          setGraphNodes(Object.values(nodeMap))
          setGraphEdges(edges)
        }
      } catch (_) {
        if (!cancelled) setGraphError("Unable to load knowledge graph.")
      } finally {
        if (!cancelled) setGraphApiLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleGenerateText = () => {
    const data = generateMindMapFromText(inputText)
    setMindMap(data)
    setViewMode("text")
  }

  const catColor: Record<string, string> = {
    math: "#3b82f6",
    programming: "#14b8a6",
    ml: "#f59e0b",
    dl: "#8b5cf6",
    specialized: "#ec4899",
    other: "#a1a1aa",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>
            🧠 Mind Maps
          </h1>
          <p style={{ fontSize: "13px", color: textSec }}>
            Visualize your topic knowledge graph or generate mind maps from your notes
          </p>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {["graph", "text"].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: `1px solid ${viewMode === mode ? accent : border}`,
                color: viewMode === mode ? accent : muted,
                fontSize: "12px",
                cursor: "pointer",
                background: viewMode === mode ? `${accent}15` : "transparent",
                fontWeight: viewMode === mode ? "500" : "400"
              }}
            >
              {mode === "graph" ? "Knowledge Graph" : "From Notes"}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "graph" ? (
        <>
          {graphApiLoading ? (
            <Card theme={theme} style={{ padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", color: muted }}>Loading knowledge graph...</div>
            </Card>
          ) : graphError ? (
            <Card theme={theme} style={{ padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "13px", color: muted }}>{graphError}</div>
            </Card>
          ) : (
            <Card theme={theme} style={{ padding: "16px", minHeight: "420px" }}>
              <div style={{ fontSize: "13px", color: muted, marginBottom: "12px" }}>
                {graphNodes.length} topics · {graphEdges.length} prerequisite edges
              </div>
              <div
                style={{
                  position: "relative",
                  height: "360px",
                  borderRadius: "8px",
                  border: `1px solid ${border}`,
                  background: hover,
                  overflow: "hidden",
                }}
              >
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                  {graphEdges.map((e, i) => {
                    const from = graphNodes.find(n => n.id === e.from)
                    const to = graphNodes.find(n => n.id === e.to)
                    if (!from || !to) return null
                    return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={dark ? "rgba(255,255,255,0.12)" : "#d1d5db"} strokeWidth="1.5" strokeDasharray="4 2" />
                  })}
                </svg>
                {graphNodes.map(n => {
                  const isSelected = selectedNode === n.id
                  const color = catColor[n.category] ?? catColor.other
                  return (
                    <div
                      key={n.id}
                      onClick={() => setSelectedNode(isSelected ? null : n.id)}
                      title={`${n.name}\nCategory: ${n.category}\nDifficulty: ${n.difficulty}\nPrereqs: ${n.prerequisites.length ? n.prerequisites.join(", ") : "None"}`}
                      style={{
                        position: "absolute",
                        left: `${n.x}px`,
                        top: `${n.y}px`,
                        transform: "translate(-50%, -50%)",
                        padding: "6px 10px",
                        borderRadius: "14px",
                        background: isSelected ? color : `${color}20`,
                        border: `1.5px solid ${color}`,
                        color: isSelected ? "#fff" : text,
                        fontSize: "11px",
                        fontWeight: isSelected ? "600" : "500",
                        cursor: "pointer",
                        boxShadow: isSelected ? `0 0 12px ${color}60` : "none",
                        transition: "all 0.15s ease",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      {n.name}
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
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
              onClick={handleGenerateText}
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
              Generate Mind Map
            </button>
          </Card>

          <Card theme={theme} style={{ display: "flex", flexDirection: "column", gap: "12px", minHeight: "420px" }}>
            {mindMap ? (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", color: muted }}>Interactive Canvas ({mindMap.nodes.length} Nodes)</span>
                  {selectedNode && (
                    <span style={{ fontSize: "12px", color: accent, fontWeight: "500" }}>
                      Selected: {mindMap.nodes.find(n => n.id === selectedNode)?.label}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    position: "relative",
                    height: "360px",
                    borderRadius: "8px",
                    border: `1px solid ${border}`,
                    background: hover,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
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
                  {mindMap.nodes.map(n => {
                    const isSelected = selectedNode === n.id
                    return (
                      <div
                        key={n.id}
                        onClick={() => setSelectedNode(isSelected ? null : n.id)}
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
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", minHeight: "360px" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>📝</div>
                <div style={{ fontSize: "13px", color: muted, textAlign: "center", maxWidth: "260px" }}>
                  Paste your notes on the left and click "Generate Mind Map" to create a visual tree.
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}