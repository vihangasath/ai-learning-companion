const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" },
      { label: "Analytics", icon: "M18 20V10M12 20V4M6 20v-6" },
      { label: "Performance", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
    ]
  },
  {
    label: "Learning",
    items: [
      { label: "Flashcards", icon: "M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7z M16 3v4 M8 3v4" },
      { label: "Quizzes", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
      { label: "Recommendations", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
    ]
  },
  {
    label: "AI Tools",
    items: [
      { label: "Mind Maps", icon: "M12 2v20 M17 5l-5 5-5-5 M17 19l-5-5-5 5" },
      { label: "Formulas", icon: "M4 7h16 M4 12h16 M4 17h10" },
      { label: "Research Papers", icon: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6" },
    ]
  },
  {
    label: "Discover",
    items: [
      { label: "Search", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
      { label: "Bookmarks", icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
    ]
  }
]

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {d.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  )
}

export default function Sidebar({ active, setActive, theme }: any) {
  const { dark, border, text, textSec, muted, accent, hover } = theme

  const sidebarBg = dark ? "#111113" : "#ffffff"

  return (
    <div style={{ width: "236px", background: sidebarBg, display: "flex", flexDirection: "column", height: "100vh", flexShrink: 0 }}>

      {/* Logo — same height as topbar */}
      <div style={{ height: "57px", display: "flex", alignItems: "center", padding: "0 16px", borderBottom: `1px solid ${border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#042f2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
            </svg>
          </div>
          <span style={{ fontSize: "15px", fontWeight: "600", color: text, letterSpacing: "-0.02em" }}>LearnFlow</span>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        {navGroups.map(group => (
          <div key={group.label} style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: muted, textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 8px", marginBottom: "4px" }}>
              {group.label}
            </div>
            {group.items.map(item => {
              const isActive = active === item.label
              return (
                <button key={item.label} onClick={() => setActive(item.label)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "7px 8px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "13.5px", fontWeight: isActive ? "500" : "400", color: isActive ? accent : textSec, background: isActive ? (dark ? "rgba(20,184,166,0.1)" : "rgba(13,148,136,0.08)") : "transparent", transition: "all 0.1s", textAlign: "left", marginBottom: "1px" }}>
                  <NavIcon d={item.icon} />
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ borderTop: `1px solid ${border}`, padding: "8px" }}>
        <button onClick={() => setActive("Settings")}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "7px 8px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "13.5px", fontWeight: active === "Settings" ? "500" : "400", color: active === "Settings" ? accent : textSec, background: active === "Settings" ? (dark ? "rgba(20,184,166,0.1)" : "rgba(13,148,136,0.08)") : "transparent", marginBottom: "4px", textAlign: "left" }}>
          <NavIcon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          Settings
        </button>
        <button onClick={() => setActive("Profile")}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "8px", borderRadius: "8px", border: `1px solid ${border}`, cursor: "pointer", background: hover, textAlign: "left" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `linear-gradient(135deg, ${accent}, #3b82f6)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: "600", flexShrink: 0 }}>KP</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "500", color: text }}>Kasun Perera</div>
            <div style={{ fontSize: "11px", color: muted }}>Student</div>
          </div>
        </button>
      </div>
    </div>
  )
}
