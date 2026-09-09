import { useState } from "react"
import { authApi, clearToken, getToken } from "../services/apiService"
import { useCurrentUser } from "../hooks/useCurrentUser"

export default function AuthModal({ theme, isOpen, onClose }: any) {
  const { dark, bg, card, border, text, textSec, muted, accent, accentFg, inputBg } = theme
  const { user } = useCurrentUser()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loggedIn = !!getToken()

  if (!isOpen) return null

  const close = () => {
    setError(null)
    onClose()
  }

  const logout = () => {
    clearToken()
    window.location.reload()
  }

  const submit = async () => {
    setError(null)
    setLoading(true)
    try {
      if (mode === "register") {
        await authApi.register(email, password, name)
      }
      await authApi.login(email, password)
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={close}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{
          width: 380, maxWidth: "92vw", background: card, border: `1px solid ${border}`,
          borderRadius: "16px", padding: "26px", boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div>
            <div style={{ color: text, fontWeight: 700, fontSize: "18px" }}>LearnFlow AI</div>
            <div style={{ color: muted, fontSize: "12px" }}>
              {loggedIn ? "Account" : mode === "login" ? "Log in to sync your learning data" : "Create your free account"}
            </div>
          </div>
          <button onClick={close} style={{ background: "transparent", border: "none", color: muted, fontSize: "18px", cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        {loggedIn ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ background: inputBg, border: `1px solid ${border}`, borderRadius: "8px", padding: "12px 14px", color: text, fontSize: "13px" }}>
              Signed in as <span style={{ fontWeight: 600, margin: "0 4px" }}>{user?.name || user?.email || "you"}</span>
            </div>
            <button onClick={logout} style={{ background: `${accent}18`, border: `1px solid ${accent}40`, color: accent, borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              Log out
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: "4px", background: inputBg, borderRadius: "8px", padding: "4px", marginBottom: "16px" }}>
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null) }}
                  style={{
                    flex: 1, padding: "7px", borderRadius: "6px", border: "none",
                    background: mode === m ? accent : "transparent",
                    color: mode === m ? accentFg : textSec, fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {m === "login" ? "Log in" : "Register"}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {mode === "register" && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  style={inputStyle(bg, border, text)}
                />
              )}
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                style={inputStyle(bg, border, text)}
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "Password (min 8 characters)" : "Password"}
                type="password"
                style={inputStyle(bg, border, text)}
              />
            </div>

            {error && (
              <div style={{ marginTop: "10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", borderRadius: "8px", padding: "8px 10px", fontSize: "12px" }}>
                {error}
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading || !email || (mode === "register" && password.length < 8)}
              style={{
                marginTop: "14px", background: accent, color: accentFg, border: "none",
                borderRadius: "8px", padding: "11px", fontSize: "14px", fontWeight: 700,
                cursor: loading || !email || (mode === "register" && password.length < 8) ? "not-allowed" : "pointer",
                opacity: loading || !email || (mode === "register" && password.length < 8) ? 0.6 : 1,
              }}
            >
              {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function inputStyle(bg: string, border: string, text: string): React.CSSProperties {
  return {
    background: bg, border: `1px solid ${border}`, borderRadius: "8px",
    padding: "10px 12px", fontSize: "13px", color: text, outline: "none", width: "100%",
    boxSizing: "border-box",
  }
}