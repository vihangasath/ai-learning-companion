import { useState } from "react"
import Card from "../components/Card"
import { extractFormulasFromText, type ExtractedFormula } from "../services/advancedFeaturesService"

const samplePhysicsText = `Einstein stated that energy equals mass times speed of light squared (E = mc^2), while Newton defined force equals mass times acceleration (F = ma). Furthermore, the area of a circle is given by A = pi * r^2 and the Pythagorean theorem states a^2 + b^2 = c^2.`

export default function FormulaExtractorPage({ theme }: any) {
  const { text, textSec, muted, accent, border, hover, inputBg } = theme
  const [input, setInput] = useState(samplePhysicsText)
  const [formulas, setFormulas] = useState<ExtractedFormula[]>(extractFormulasFromText(samplePhysicsText))
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleExtract = () => {
    const res = extractFormulasFromText(input)
    setFormulas(res)
  }

  const handleCopy = (f: ExtractedFormula) => {
    navigator.clipboard.writeText(f.latex)
    setCopiedId(f.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>
          📐 Formula Extractor
        </h1>
        <p style={{ fontSize: "13px", color: textSec }}>
          Detect mathematical, physical, and scientific equations from educational text and convert them to LaTeX
        </p>
      </div>

      <Card theme={theme} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ fontSize: "14px", fontWeight: "600", color: text }}>Educational Text Input</div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={5}
          placeholder="Paste lecture transcript, textbook section, or notes..."
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
            onClick={handleExtract}
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
            🔍 Extract Formulas
          </button>
        </div>
      </Card>

      <div style={{ fontSize: "14px", fontWeight: "600", color: text, marginTop: "8px" }}>
        Extracted Equations ({formulas.length})
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
        {formulas.map(f => (
          <Card key={f.id} theme={theme} style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: text }}>{f.name}</span>
              <span style={{ fontSize: "10px", color: accent, background: `${accent}15`, padding: "2px 6px", borderRadius: "4px", fontWeight: "500" }}>
                LaTeX
              </span>
            </div>

            <div
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: hover,
                border: `1px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "54px"
              }}
            >
              <code style={{ fontSize: "16px", color: text, fontFamily: "serif", letterSpacing: "0.05em" }}>
                {f.latex}
              </code>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: muted }}>
              <span>Match: &quot;{f.rawText}&quot;</span>
              <button
                onClick={() => handleCopy(f)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: `1px solid ${border}`,
                  background: "transparent",
                  color: copiedId === f.id ? accent : textSec,
                  fontSize: "11px",
                  cursor: "pointer"
                }}
              >
                {copiedId === f.id ? "✓ Copied" : "Copy LaTeX"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
