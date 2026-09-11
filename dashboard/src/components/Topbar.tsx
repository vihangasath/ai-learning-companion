import { useCurrentUser, initialsFor } from "../hooks/useCurrentUser"

export default function Topbar({ page, theme, onOpenAuth }: any) {
  const { dark, border, text, textSec, accent, setDark, inputBg } = theme
  const { user } = useCurrentUser()
  return <header style={{ height: "57px", background: dark ? "#111113" : "#ffffff", borderBottom: `1px solid ${border}`, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
    <div><div style={{ fontSize: "11px", color: textSec, marginBottom: "1px" }}>LEARNFLOW</div><div style={{ fontSize: "14px", color: text, fontWeight: "650" }}>{page}</div></div>
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <button onClick={onOpenAuth} title="Account" style={{ background: "transparent", border: `1px solid ${border}`, borderRadius: "7px", padding: "6px 9px", color: textSec, cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "18px", height: "18px", borderRadius: "50%", background: accent, color: "#042f2e", fontSize: "10px", fontWeight: "700", display: "grid", placeItems: "center" }}>{initialsFor(user?.name)}</span>{user ? user.name.split(" ")[0] : "Account"}</button>
      <button onClick={() => setDark(!dark)} aria-label="Toggle color theme" style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "7px", padding: "6px 9px", cursor: "pointer", fontSize: "12px", color: textSec }}>{dark ? "Light" : "Dark"}</button>
    </div>
  </header>
}
