import { useEffect, useState } from "react"

const API_BASE = "http://localhost:8000"
interface StudyContent { url: string; title: string; text: string; transcript: string; contentType: "youtube" | "article"; isVideo: boolean }
interface AnalysisResult { title: string; summary: string; flashcards: { question: string; answer: string }[]; quiz: { question: string; options: string[]; correct_answer: string; explanation?: string }[] }

async function getActiveContent(): Promise<StudyContent> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) throw new Error("No active tab found")
  const result = await chrome.tabs.sendMessage(tab.id, { type: "GET_STUDY_CONTENT" })
  if (!result?.url) throw new Error("Open a YouTube video or an article, then try again.")
  return result as StudyContent
}

export default function App() {
  const [content, setContent] = useState<StudyContent | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCards, setShowCards] = useState(false)
  const refreshContent = async () => {
    setLoading(true); setError(null); setResult(null)
    try { setContent(await getActiveContent()) } catch (err) { setContent(null); setError(err instanceof Error ? err.message : "Could not read this page.") } finally { setLoading(false) }
  }
  useEffect(() => { void refreshContent() }, [])
  const analyze = async () => {
    if (!content) return
    setAnalyzing(true); setError(null)
    try {
      const response = await fetch(`${API_BASE}/api/content/analyze`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: content.url, content_type: content.contentType, raw_text: content.isVideo && !content.transcript ? undefined : content.text, transcript: content.transcript || undefined }) })
      if (!response.ok) throw new Error(`The learning service returned ${response.status}.`)
      const json = await response.json(); setResult(json.data as AnalysisResult)
    } catch (err) { setError(err instanceof Error ? err.message : "Could not create a study kit.") } finally { setAnalyzing(false) }
  }
  return <main className="panel">
    <header className="panel-header"><div className="logo-mark">LF</div><div><div className="panel-title">LearnFlow AI</div><div className="panel-sub">Your study companion</div></div></header>
    {loading ? <div className="status">Checking the current page…</div> : content ? <><section className="source-card"><div className="source-label">{content.isVideo ? "VIDEO READY" : "PAGE READY"}</div><div className="source-title">{content.title}</div><div className="source-url">{content.isVideo ? "YouTube video detected" : "Article detected"}</div></section><button className="btn-primary" onClick={analyze} disabled={analyzing}>{analyzing ? "Creating your study kit…" : content.isVideo ? "Create study kit for this video" : "Create study kit for this page"}</button><button className="btn-link" onClick={() => void refreshContent()}>Use the current page instead</button></> : <section className="empty-state"><div className="empty-icon">▶</div><div className="section-title">Open a video or article to begin</div><p>LearnFlow will automatically detect it when you open this panel.</p><button className="btn-ghost" onClick={() => void refreshContent()}>Try again</button></section>}
    {error && <div className="error">{error}</div>}
    {result && <section className="results"><div className="success">STUDY KIT READY</div><div className="card"><div className="section-title">{result.title}</div><div className="summary">{result.summary}</div></div><div className="card"><div className="section-title">Flashcards <span className="badge">{result.flashcards.length}</span></div><button className="btn-ghost" onClick={() => setShowCards(value => !value)}>{showCards ? "Hide flashcards" : "Review flashcards"}</button>{showCards && result.flashcards.map((card, index) => <details key={index} className="flashcard"><summary>{card.question}</summary><div className="answer">{card.answer}</div></details>)}</div><div className="card"><div className="section-title">Quick quiz <span className="badge">{result.quiz.length} questions</span></div>{result.quiz.map((question, index) => <details key={index} className="flashcard"><summary>{index + 1}. {question.question}</summary><div className="answer">Answer: {question.correct_answer}{question.explanation ? ` — ${question.explanation}` : ""}</div></details>)}</div></section>}
  </main>
}
