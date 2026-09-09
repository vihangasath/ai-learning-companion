import { useState, useEffect } from "react"
import Card from "../components/Card"
import { quizApi, type Quiz, type QuizQuestion } from "../services/apiService"

const DECK_COLORS = ["#14b8a6", "#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ec4899"]
const diffColor: Record<string, string> = { Beginner: "#22c55e", Intermediate: "#f59e0b", Advanced: "#ef4444" }

export default function QuizzesPage({ theme }: any) {
  const { text, textSec, muted, accent, border, dark, hover, card: cardBg } = theme
  const [sel, setSel] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [apiQuizzes, setApiQuizzes] = useState<Quiz[] | null>(null)
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [activeQIdx, setActiveQIdx] = useState(0)
  const [apiLoading, setApiLoading] = useState(true)
  const [submitResult, setSubmitResult] = useState<{ score: number; total: number } | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setApiLoading(true)
      try {
        const result = await quizApi.getAll()
        if (!cancelled) setApiQuizzes(result.quizzes)
      } catch (_) {
        // backend unavailable — leave state empty
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const quizzes = apiQuizzes ?? []

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz)
    setActiveQIdx(0)
    setSel(null)
    setAnswered(false)
    setSubmitResult(null)
    setUserAnswers([])
  }

  const handleSubmitFull = async () => {
    if (!activeQuiz) return
    try {
      const result = await quizApi.submit(activeQuiz.id, userAnswers)
      setSubmitResult({ score: result.score, total: result.total_questions })
    } catch (_) {
      // fallback local scoring
      const qs = activeQuiz.questions
      const correct = userAnswers.filter((a, i) => a.selected === qs[i]?.correct_answer).length
      setSubmitResult({ score: Math.round((qs.length ? correct / qs.length : 0) * 100), total: qs.length })
    }
  }

  const quizDisplayList = quizzes
    .filter(q => Array.isArray(q.questions) && q.questions.length > 0)
    .map((q, i) => ({
      id: q.id,
      name: `Quiz from ${q.content_id.slice(0, 10)}...`,
      questions: q.questions.length,
      time: `${Math.ceil(q.questions.length * 1.5)} min`,
      difficulty: "Mixed" as string,
      score: null as number | null,
      done: false,
      color: DECK_COLORS[i % DECK_COLORS.length],
      quizObj: q,
    }))

  const activeQuestion: QuizQuestion | null = activeQuiz ? (activeQuiz.questions[activeQIdx] ?? null) : null
  const practiceQuestion: QuizQuestion | null = activeQuiz ? activeQuestion : null

  const hasRealQuiz = quizDisplayList.length > 0
  const allQuestionsAnswered = activeQuiz && activeQIdx === activeQuiz.questions.length - 1 && answered

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "600", color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>Quizzes</h1>
          <p style={{ fontSize: "13px", color: textSec }}>Test your knowledge and track your scores</p>
        </div>
        {apiLoading && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accent, opacity: 0.6 }} />}
      </div>

      {!hasRealQuiz ? (
        <Card theme={theme} style={{ padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>📝</div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: text, marginBottom: "4px" }}>No quizzes yet</div>
          <div style={{ fontSize: "12px", color: muted }}>
            Analyze a YouTube video, article, or PDF in the Content page to automatically generate quizzes.
          </div>
        </Card>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px" }}>
            {quizDisplayList.map((q: any) => (
              <Card key={q.name} theme={theme} style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: text, flex: 1, marginRight: "8px", lineHeight: 1.4 }}>{q.name}</div>
                  <span style={{ fontSize: "10px", color: diffColor[q.difficulty] ?? "#a1a1aa", background: `${diffColor[q.difficulty] ?? "#a1a1aa"}15`, padding: "2px 6px", borderRadius: "4px", fontWeight: "500", flexShrink: 0 }}>{q.difficulty}</span>
                </div>
                <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", color: muted }}>{q.questions} questions</span>
                  <span style={{ fontSize: "11px", color: muted }}>{q.time}</span>
                </div>
                <div
                  onClick={() => q.quizObj ? handleStartQuiz(q.quizObj) : null}
                  style={{ padding: "8px", borderRadius: "6px", background: `${q.color}15`, color: q.color, fontSize: "12px", fontWeight: "500", textAlign: "center" }}
                >
                  Start quiz →
                </div>
              </Card>
            ))}
          </div>

          {submitResult ? (
            <Card theme={theme}>
              <div style={{ textAlign: "center", padding: "24px" }}>
                <div style={{ fontSize: "48px", fontWeight: "700", color: submitResult.score >= 70 ? "#22c55e" : "#ef4444", letterSpacing: "-0.04em", marginBottom: "8px" }}>{submitResult.score}%</div>
                <div style={{ fontSize: "14px", color: text, marginBottom: "4px" }}>Quiz Complete!</div>
                <div style={{ fontSize: "12px", color: muted, marginBottom: "16px" }}>You answered {Math.round(submitResult.score * submitResult.total / 100)} of {submitResult.total} correctly</div>
                <button onClick={() => { setActiveQuiz(null); setSubmitResult(null) }} style={{ padding: "8px 20px", borderRadius: "6px", border: `1px solid ${accent}`, background: "transparent", color: accent, cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>Back to Quizzes</button>
              </div>
            </Card>
          ) : activeQuiz && activeQuestion ? (
            <Card theme={theme}>
              <div style={{ fontSize: "14px", fontWeight: "500", color: text, marginBottom: "2px" }}>
                Quiz · Question {activeQIdx + 1} of {activeQuiz.questions.length}
              </div>
              <div style={{ fontSize: "12px", color: muted, marginBottom: "16px" }}>{activeQuiz.quiz_type}</div>
              <div style={{ color: text, fontSize: "14px", fontWeight: "500", marginBottom: "16px", lineHeight: 1.5 }}>{practiceQuestion?.question}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                {practiceQuestion?.options.map((opt, i) => {
                  const isSelected = sel === i
                  const isCorrect = answered && opt === practiceQuestion.correct_answer
                  const isWrong = answered && isSelected && opt !== practiceQuestion.correct_answer
                  return (
                    <div
                      key={i}
                      onClick={() => { if (!answered) setSel(i) }}
                      style={{ padding: "10px 14px", borderRadius: "8px", border: `1px solid ${isCorrect ? "#22c55e" : isWrong ? "#ef4444" : isSelected ? accent : border}`, background: isCorrect ? "rgba(34,197,94,0.08)" : isWrong ? "rgba(239,68,68,0.08)" : isSelected ? `${accent}0d` : "transparent", cursor: "pointer", color: text, fontSize: "13px", transition: "all 0.1s" }}
                    >
                      <span style={{ color: muted, marginRight: "10px" }}>{String.fromCharCode(65 + i)}.</span>{opt}
                    </div>
                  )
                })}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {!answered && sel !== null && (
                  <button
                    onClick={() => {
                      setAnswered(true)
                      if (activeQuiz) {
                        const ans: Record<string, string> = { selected: practiceQuestion?.options[sel!] ?? "" }
                        setUserAnswers(prev => [...prev, ans])
                      }
                    }}
                    style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: accent, color: "#042f2e", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                  >Submit</button>
                )}
                {answered && activeQIdx < activeQuiz.questions.length - 1 && (
                  <button onClick={() => { setAnswered(false); setSel(null); setActiveQIdx(i => i + 1) }} style={{ padding: "8px 16px", borderRadius: "6px", border: `1px solid ${accent}`, background: "transparent", color: accent, cursor: "pointer", fontSize: "12px", fontWeight: "500" }}>Next →</button>
                )}
                {allQuestionsAnswered && (
                  <button onClick={handleSubmitFull} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: accent, color: "#042f2e", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Finish Quiz</button>
                )}
              </div>
            </Card>
          ) : null}
        </>
      )}
    </div>
  )
}