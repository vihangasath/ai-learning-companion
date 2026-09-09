// Central API service layer — connects dashboard frontend to FastAPI backend
// All endpoints point to http://localhost:8000 by default.
// Pages should import from this file and call these functions.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000"

// ---------- Auth token handling ----------

const TOKEN_KEY = "learnflow_token"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ---------- Generic HTTP helpers ----------

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  })
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  const json = await res.json()
  return json.data as T
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
  const json = await res.json()
  return json.data as T
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`)
  const json = await res.json()
  return json.data as T
}

// ---------- Type definitions ----------

export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar_url?: string
  created_at: string
}

export interface Flashcard {
  id: string
  content_id: string
  question: string
  answer: string
  difficulty: string
  is_learned: boolean
  last_reviewed_at?: string
  review_count: number
  created_at: string
}

export interface FlashcardList {
  flashcards: Flashcard[]
  total: number
}

export interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: string
  type: string
  explanation?: string
}

export interface Quiz {
  id: string
  content_id: string
  questions: QuizQuestion[]
  quiz_type: string
  created_at: string
}

export interface QuizList {
  quizzes: Quiz[]
  total: number
}

export interface QuizSubmitResult {
  quiz_id: string
  score: number
  total_questions: number
  correct_answers: number
  answers: Record<string, string>[]
  completed_at: string
}

export interface Note {
  id: string
  content_id: string
  content_url: string
  content_type: string
  title?: string
  summary?: string
  detailed_notes?: string
  topics: string[]
  created_at: string
}

export interface NoteList {
  notes: Note[]
  total: number
}

export interface ContentAnalysisResult {
  content_id: string
  content_url: string
  content_type: string
  title: string
  summary: string
  detailed_notes: string
  flashcards: Flashcard[]
  quiz: QuizQuestion[]
  topics: { topic: string; keywords: string[]; confidence: number }[]
  formulas: { name: string; raw_text: string; latex: string; display_math: string; source: string }[]
  created_at: string
}

export interface StudyTimeData {
  total_minutes: number
  total_hours: number
  daily_breakdown: { date: string; day: string; minutes: number; hours: number }[]
}

export interface FocusData {
  focus_rate: number
  total_distractions: number
  idle_time_minutes: number
  daily_breakdown: { date: string; day: string; focus: number }[]
}

export interface StreakData {
  current_streak: number
  longest_streak: number
  consistency_score: number
}

export interface PerformanceData {
  overall_accuracy: number
  total_quizzes: number
  subject_breakdown: {
    quiz_id: string
    score: number
    total_questions: number
    correct_answers: number
    completed_at: string
  }[]
}

export interface RecentActivityItem {
  event_type: string
  content_id: string
  timestamp: string
  metadata: Record<string, unknown>
}

export interface HeatmapData {
  data: { date: string; count: number; level: number }[]
  year: number
}

export interface Recommendation {
  id?: string
  title: string
  subject: string
  duration?: string
  difficulty?: string
  match_score?: number
}

export interface SearchResult {
  id: string
  kind: "note" | "flashcard" | "topic"
  title: string
  text: string
  content_id?: string | null
  score: number
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
  total: number
}

// ---------- Auth API ----------

export const authApi = {
  register: (email: string, password: string, name: string) =>
    post<User>("/api/auth/register", { email, password, name }),

  login: async (email: string, password: string) => {
    const result = await post<{ access_token: string; token_type: string }>("/api/auth/login", {
      email,
      password,
    })
    setToken(result.access_token)
    return result
  },

  getMe: () => get<User>("/api/auth/me"),
}

// ---------- Content API ----------

export const contentApi = {
  analyze: (
    url: string,
    content_type: "youtube" | "article" | "pdf",
    raw_text?: string,
    transcript?: string,
  ) =>
    post<ContentAnalysisResult>("/api/content/analyze", {
      url,
      content_type,
      raw_text,
      transcript,
    }),
}

// ---------- Notes API ----------

export const notesApi = {
  getByContentId: (contentId: string) => get<Note>(`/api/notes/${contentId}`),
  getAll: (skip = 0, limit = 50) => get<NoteList>(`/api/notes/user/all?skip=${skip}&limit=${limit}`),
}

// ---------- Flashcards API ----------

export const flashcardsApi = {
  getByContentId: (contentId: string) => get<FlashcardList>(`/api/flashcards/${contentId}`),
  getAll: (skip = 0, limit = 100) =>
    get<FlashcardList>(`/api/flashcards/user/all?skip=${skip}&limit=${limit}`),
  markLearned: (flashcardId: string, is_learned: boolean) =>
    put<Flashcard>(`/api/flashcards/${flashcardId}/learned`, { is_learned }),
}

// ---------- Quiz API ----------

export const quizApi = {
  getByContentId: (contentId: string) => get<Quiz>(`/api/quiz/${contentId}`),
  getAll: (skip = 0, limit = 50) =>
    get<QuizList>(`/api/quiz/user/all?skip=${skip}&limit=${limit}`),
  submit: (quizId: string, answers: Record<string, string>[]) =>
    post<QuizSubmitResult>("/api/quiz/submit", { quiz_id: quizId, answers }),
}

// ---------- Recommendations API ----------

export const recommendationsApi = {
  getAll: () =>
    get<{ recommendations: Recommendation[] }>("/api/recommendations"),
}

// ---------- Analytics API ----------

export const analyticsApi = {
  recordEvent: (
    event_type: string,
    content_id: string,
    session_id: string,
    metadata: Record<string, unknown> = {},
  ) =>
    post<{ id: string; event_type: string; created_at: string }>("/api/analytics/event", {
      event_type,
      content_id,
      session_id,
      metadata,
    }),

  getStudyTime: (days = 7) => get<StudyTimeData>(`/api/analytics/study-time?days=${days}`),
  getFocus: (days = 7) => get<FocusData>(`/api/analytics/focus?days=${days}`),
  getStreaks: () => get<StreakData>("/api/analytics/streaks"),
  getPerformance: () => get<PerformanceData>("/api/analytics/performance"),
  getSubjects: () => get<{ subjects: { name: string; sessions: number }[] }>("/api/analytics/subjects"),
  getRecent: (limit = 20) => get<RecentActivityItem[]>(`/api/analytics/recent?limit=${limit}`),
  getHeatmap: (year?: number) =>
    get<HeatmapData>(`/api/analytics/heatmap${year ? `?year=${year}` : ""}`),
}

// ---------- Search API ----------

export const searchApi = {
  search: (q: string) => get<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}`),
}

// ---------- Knowledge Graph API ----------

export const knowledgeApi = {
  getGraph: () =>
    get<{ nodes: number; edges: number; graph: Record<string, KnowledgeNode> }>("/api/knowledge/graph"),
}

export interface KnowledgeNode {
  id: string | number
  slug: string
  category: string
  difficulty: string
  prerequisites: string[]
  next_topics: string[]
  estimated_time: string
}
