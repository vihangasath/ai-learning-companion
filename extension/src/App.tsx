import { useState } from 'react'

const API_BASE = 'http://localhost:8000'

interface PageData {
  url: string
  title: string
  text: string
}

interface AnalysisResult {
  content_id: string
  title: string
  summary: string
  detailed_notes: string
  flashcards: { question: string; answer: string; difficulty: string }[]
  quiz: { question: string; options: string[]; correct_answer: string; explanation?: string }[]
  topics: { topic: string; confidence: number }[]
}

async function getActivePage(): Promise<PageData> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) throw new Error('No active tab found')
  const res = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_TEXT' })
  if (!res?.text) throw new Error('Could not read page content. Try a normal (non-Chrome) page.')
  return res as PageData
}

function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<PageData | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [showCards, setShowCards] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})

  const analyze = async () => {
    setError(null)
    setLoading(true)
    try {
      const p = await getActivePage()
      setPage(p)
      const res = await fetch(`${API_BASE}/api/content/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: p.url, content_type: 'article', raw_text: p.text }),
      })
      if (!res.ok) throw new Error(`Backend error: ${res.status}`)
      const json = await res.json()
      setResult(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const quizScore = () => {
    if (!result) return null
    const qs = result.quiz
    const correct = qs.filter((q) => quizAnswers[q.question] === q.correct_answer).length
    return `${correct}/${qs.length}`
  }

  return (
    <div className="panel">
      <header className="panel-header">
        <div className="logo-mark">LF</div>
        <div>
          <div className="panel-title">LearnFlow AI</div>
          <div className="panel-sub">Learning companion</div>
        </div>
      </header>

      <button className="btn-primary" onClick={analyze} disabled={loading}>
        {loading ? 'Analyzing…' : 'Analyze this page'}
      </button>

      {error && <div className="error">{error}</div>}

      {page && !result && !loading && (
        <div className="muted-text" style={{ wordBreak: 'break-all' }}>
          {page.title}
        </div>
      )}

      {result && (
        <div className="results">
          <div className="card">
            <div className="section-title">{result.title}</div>
            <div className="summary">{result.summary}</div>
          </div>

          <div className="card">
            <div className="section-title">
              Flashcards <span className="badge">{result.flashcards.length}</span>
            </div>
            <button className="btn-ghost" onClick={() => setShowCards(!showCards)}>
              {showCards ? 'Hide' : 'Show'} cards
            </button>
            {showCards &&
              result.flashcards.map((c, i) => (
                <details key={i} className="flashcard">
                  <summary>{c.question}</summary>
                  <div className="answer">{c.answer}</div>
                </details>
              ))}
          </div>

          <div className="card">
            <div className="section-title">
              Quiz <span className="badge">{result.quiz.length}</span>
              {quizScore() != null && <span className="score">{quizScore()} correct</span>}
            </div>
            {result.quiz.map((q, i) => (
              <div key={i} className="quiz-item">
                <div className="quiz-q">{q.question}</div>
                <div className="quiz-options">
                  {q.options.map((opt) => (
                    <label key={opt} className="quiz-opt">
                      <input
                        type="radio"
                        name={`q-${i}`}
                        checked={quizAnswers[q.question] === opt}
                        onChange={() => setQuizAnswers({ ...quizAnswers, [q.question]: opt })}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App