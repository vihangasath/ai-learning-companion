import { useState } from "react"
import Sidebar from "./components/Sidebar"
import Topbar from "./components/Topbar"
import DashboardPage from "./pages/DashboardPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import PerformancePage from "./pages/PerformancePage"
import FlashcardsPage from "./pages/FlashcardsPage"
import QuizzesPage from "./pages/QuizzesPage"
import RecommendationsPage from "./pages/RecommendationsPage"
import SearchPage from "./pages/SearchPage"
import BookmarksPage from "./pages/BookmarksPage"
import SettingsPage from "./pages/SettingsPage"
import ProfilePage from "./pages/ProfilePage"

export type Theme = {
  dark: boolean
  bg: string
  card: string
  border: string
  text: string
  textSec: string
  muted: string
  accent: string
  accentFg: string
  hover: string
  inputBg: string
  setDark: (v: boolean) => void
}

export default function App() {
  const [active, setActive] = useState("Dashboard")
  const [dark, setDark] = useState(true)

  const theme: Theme = dark ? {
    dark: true,
    bg: "#09090b",
    card: "#111113",
    border: "rgba(255,255,255,0.08)",
    text: "#fafafa",
    textSec: "#a1a1aa",
    muted: "#52525b",
    accent: "#14b8a6",
    accentFg: "#042f2e",
    hover: "rgba(255,255,255,0.05)",
    inputBg: "#18181b",
    setDark,
  } : {
    dark: false,
    bg: "#fafafa",
    card: "#ffffff",
    border: "#e4e4e7",
    text: "#09090b",
    textSec: "#71717a",
    muted: "#a1a1aa",
    accent: "#0d9488",
    accentFg: "#f0fdfa",
    hover: "#f4f4f5",
    inputBg: "#f4f4f5",
    setDark,
  }

  const pages: Record<string, React.ReactNode> = {
    Dashboard: <DashboardPage theme={theme} />,
    Analytics: <AnalyticsPage theme={theme} />,
    Performance: <PerformancePage theme={theme} />,
    Flashcards: <FlashcardsPage theme={theme} />,
    Quizzes: <QuizzesPage theme={theme} />,
    Recommendations: <RecommendationsPage theme={theme} />,
    Search: <SearchPage theme={theme} />,
    Bookmarks: <BookmarksPage theme={theme} />,
    Settings: <SettingsPage theme={theme} />,
    Profile: <ProfilePage theme={theme} />,
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: theme.bg, transition: "background 0.2s", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar active={active} setActive={setActive} theme={theme} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderLeft: `1px solid ${theme.border}` }}>
        <Topbar page={active} theme={theme} />
        <main style={{ flex: 1, overflowY: "auto", background: theme.bg }}>
          <div style={{ padding: "24px 28px", minHeight: "100%" }}>
            {pages[active] ?? pages["Dashboard"]}
          </div>
        </main>
      </div>
    </div>
  )
}
