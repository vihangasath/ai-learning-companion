export interface MindMapNode {
  id: string
  label: string
  level: number
  position: { x: number; y: number }
  color: string
}

export interface MindMapEdge {
  source: string
  target: string
}

export interface MindMapData {
  nodes: MindMapNode[]
  edges: MindMapEdge[]
  mermaid: string
}

export function generateMindMapFromText(text: string): MindMapData {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean)
  const nodes: MindMapNode[] = []
  const edges: MindMapEdge[] = []
  const colors = ["#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]

  const rootLabel = lines.length > 0
    ? lines[0].replace(/^#+\s*/, "").replace(/^-\s*/, "")
    : "Main Topic"

  nodes.push({
    id: "root",
    label: rootLabel,
    level: 0,
    position: { x: 300, y: 40 },
    color: colors[0],
  })

  const childTopics = lines.slice(1)
    .map(l => l.replace(/^#+\s*/, "").replace(/^-\s*/, "").replace(/^\*\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 8)

  const finalChildTopics = childTopics.length > 0 ? childTopics : ["Core Concepts", "Key Definitions", "Practical Applications", "Summary & Notes"]
  const radiusX = 240

  finalChildTopics.forEach((topic, idx) => {
    const childId = `node-${idx + 1}`
    const angle = (idx / finalChildTopics.length) * Math.PI * 2 - Math.PI / 2
    const x = 300 + Math.round(Math.cos(angle) * radiusX)
    const y = 200 + Math.round(Math.sin(angle) * 120)

    nodes.push({
      id: childId,
      label: topic,
      level: 1,
      position: { x, y: Math.max(120, y) },
      color: colors[(idx + 1) % colors.length],
    })
    edges.push({ source: "root", target: childId })
  })

  let mermaid = "graph TD\n"
  nodes.forEach(n => { mermaid += `    ${n.id}["${n.label}"]\n` })
  edges.forEach(e => { mermaid += `    ${e.source} --> ${e.target}\n` })

  return { nodes, edges, mermaid }
}