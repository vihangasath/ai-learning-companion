import { useState } from "react"
import { useCurrentUser, initialsFor } from "../hooks/useCurrentUser"

const mainItems = [
  { label: "Dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" },
  { label: "Study", icon: "M12 2v20 M5 7h14 M5 17h14" },
  { label: "Flashcards", icon: "M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7z M16 3v4 M8 3v4" },
  { label: "Quizzes", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { label: "Progress", icon: "M18 20V10M12 20V4M6 20v-6" },
]

const moreItems = [
  { label: "Recommendations", icon: "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" },
  { label: "Mind Maps", icon: "M12 2v20 M17 5l-5 5-5-5 M17 19l-5-5-5 5" },
  { label: "Formulas", icon: "M4 7h16 M4 12h16 M4 17h10" },
  { label: "Research Papers", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" },
  { label: "Search", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { label: "Bookmarks", icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
]

function NavIcon({ d }: { d: string }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">{d.split(" M").map((seg, i) => <path key={i} d={i === 0 ? seg : "M" + seg} />)}</svg>
}

export default function Sidebar({ active, setActive, theme }: any) {
  const { dark, border, text, textSec, muted, accent, hover } = theme
  const { user } = useCurrentUser()
  const [showMore, setShowMore] = useState(false)
  const displayName = user?.name?.trim() || "Learner"
  const sidebarBg = dark ? "#111113" : "#ffffff"
  const itemStyle = (isActive: boolean) => ({ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "8px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "13.5px", fontWeight: isActive ? "600" : "400", color: isActive ? accent : textSec, background: isActive ? (dark ? "rgba(20,184,166,0.1)" : "rgba(13,148,136,0.08)") : "transparent", textAlign: "left" as const, marginBottom: "2px" })

  return <aside style={{ width: "220px", background: sidebarBg, display: "flex", flexDirection: "column", height: "100vh", flexShrink: 0 }}>
    <div style={{ height: "57px", display: "flex", alignItems: "center", padding: "0 16px", borderBottom: `1px solid ${border}` }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: accent, display: "grid", placeItems: "center", color: "#042f2e", fontWeight: "800", marginRight: "8px" }}>L</div><span style={{ fontSize: "15px", fontWeight: "650", color: text }}>LearnFlow</span>
    </div>
    <nav style={{ flex: 1, overflowY: "auto", padding: "14px 8px" }} aria-label="Main navigation">
      <div style={{ fontSize: "11px", fontWeight: "600", color: muted, letterSpacing: "0.06em", padding: "0 8px", marginBottom: "5px" }}>YOUR LEARNING</div>
      {mainItems.map(item => <button key={item.label} onClick={() => setActive(item.label === "Progress" ? "Analytics" : item.label)} style={itemStyle(active === item.label || (item.label === "Progress" && ["Analytics", "Performance"].includes(active)))}><NavIcon d={item.icon} />{item.label}</button>)}
      <div style={{ height: "1px", background: border, margin: "14px 8px" }} />
      <button onClick={() => setShowMore(value => !value)} style={{ ...itemStyle(showMore), color: textSec }}><span style={{ width: "16px", textAlign: "center", fontSize: "16px" }}>{showMore ? "−" : "+"}</span>{showMore ? "Fewer tools" : "More tools"}</button>
      {showMore && <div style={{ marginTop: "4px" }}>{moreItems.map(item => <button key={item.label} onClick={() => setActive(item.label)} style={itemStyle(active === item.label)}><NavIcon d={item.icon} />{item.label}</button>)}</div>}
    </nav>
    <div style={{ borderTop: `1px solid ${border}`, padding: "8px" }}>
      <button onClick={() => setActive("Settings")} style={itemStyle(active === "Settings")}><span style={{ width: "16px", textAlign: "center" }}>⚙</span>Settings</button>
      <button onClick={() => setActive("Profile")} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "8px", border: `1px solid ${border}`, cursor: "pointer", background: hover, textAlign: "left" }}><div style={{ width: "28px", height: "28px", borderRadius: "50%", background: accent, display: "grid", placeItems: "center", color: "#042f2e", fontSize: "11px", fontWeight: "700" }}>{initialsFor(user?.name)}</div><span style={{ fontSize: "12px", color: text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</span></button>
    </div>
  </aside>
}
