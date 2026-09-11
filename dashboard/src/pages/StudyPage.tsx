import { useState } from "react"
import Card from "../components/Card"
import { contentApi, type ContentAnalysisResult } from "../services/apiService"

export default function StudyPage({ theme, onComplete }: any) {
  const { text, textSec, muted, accent, border, hover, inputBg } = theme
  const [source, setSource] = useState("")
  const [studyText, setStudyText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<ContentAnalysisResult | null>(null)

  const analyze = async () => {
    if (!studyText.trim()) { setError("Paste some study material first."); return }
    setLoading(true); setError("")
    try {
      const url = source.trim() || "https://learnflow.local/pasted-notes"
      const type = source.includes("youtube.com") || source.includes("youtu.be") ? "youtube" : "article"
      setResult(await contentApi.analyze(url, type, studyText))
    } catch (_) { setError("We could not analyze that yet. Check that the backend is running and try again.") }
    finally { setLoading(false) }
  }

  return <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "18px", padding: "16px 0 32px" }}>
    <div>
      <div style={{ fontSize: "12px", fontWeight: "700", color: accent, letterSpacing: "0.08em" }}>STEP 1 OF 3</div>
      <h1 style={{ fontSize: "26px", letterSpacing: "-0.04em", color: text, margin: "5px 0" }}>Add something you want to learn</h1>
      <p style={{ margin: 0, color: textSec, fontSize: "14px" }}>Paste notes, an article, or a lecture transcript. LearnFlow will make the study materials for you.</p>
    </div>
    <Card theme={theme} style={{ padding: "20px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: text, marginBottom: "7px" }}>Where is this from? <span style={{ color: muted, fontWeight: "400" }}>(optional)</span></label>
      <input value={source} onChange={e => setSource(e.target.value)} placeholder="Paste a YouTube or article link" style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: text, fontSize: "13px", marginBottom: "16px" }} />
      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: text, marginBottom: "7px" }}>Study material</label>
      <textarea value={studyText} onChange={e => setStudyText(e.target.value)} rows={9} placeholder="Paste the text you want to study here…" style={{ width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: "8px", border: `1px solid ${border}`, background: inputBg, color: text, fontSize: "13px", lineHeight: 1.5, resize: "vertical" }} />
      {error && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "10px" }}>{error}</div>}
      <button onClick={analyze} disabled={loading} style={{ marginTop: "14px", padding: "10px 16px", borderRadius: "8px", border: "none", background: accent, color: "#042f2e", cursor: loading ? "wait" : "pointer", fontSize: "13px", fontWeight: "700" }}>{loading ? "Creating your study kit…" : "Create my study kit →"}</button>
    </Card>
    {result && <Card theme={theme} style={{ padding: "20px", background: hover }}>
      <div style={{ fontSize: "13px", fontWeight: "700", color: accent }}>YOUR STUDY KIT IS READY</div><h2 style={{ fontSize: "18px", color: text, margin: "6px 0" }}>{result.title}</h2><p style={{ fontSize: "13px", color: textSec, lineHeight: 1.5 }}>{result.summary}</p>
      <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}><button onClick={() => onComplete("Flashcards")} style={{ padding: "8px 12px", borderRadius: "7px", border: `1px solid ${accent}`, background: "transparent", color: accent, fontWeight: "600", cursor: "pointer" }}>Review flashcards</button><button onClick={() => onComplete("Quizzes")} style={{ padding: "8px 12px", borderRadius: "7px", border: `1px solid ${border}`, background: "transparent", color: text, fontWeight: "600", cursor: "pointer" }}>Take a quiz</button></div>
    </Card>}
  </div>
}
