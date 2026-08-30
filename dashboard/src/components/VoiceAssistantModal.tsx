import { useState } from "react"
import { parseVoiceInput, type VoiceCommandResult } from "../services/advancedFeaturesService"
import { analyticsApi } from "../services/apiService"

interface VoiceAssistantModalProps {
  theme: any
  isOpen: boolean
  onClose: () => void
}

export default function VoiceAssistantModal({ theme, isOpen, onClose }: VoiceAssistantModalProps) {
  if (!isOpen) return null

  const { text, textSec, muted, accent, border, card, hover, inputBg } = theme
  const [speechText, setSpeechText] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [lastCommand, setLastCommand] = useState<VoiceCommandResult | null>(null)
  const [isRecordingEvent, setIsRecordingEvent] = useState(false)

  const samplePrompts = [
    "Can you explain this part to me again?",
    "Let's do a quick quiz!",
    "Summarize this section.",
    "Search for gradient descent equations"
  ]

  const handleSimulateListen = async (promptText?: string) => {
    const input = promptText || speechText || samplePrompts[0]
    setSpeechText(input)
    setIsListening(true)

    setTimeout(async () => {
      setIsListening(false)
      const res = parseVoiceInput(input)
      setLastCommand(res)

      // Fire-and-forget: record the voice interaction event to the backend
      if (res.intent !== "UNKNOWN") {
        setIsRecordingEvent(true)
        try {
          await analyticsApi.recordEvent(
            "voice_command",
            "",  // no specific content_id from voice
            `voice-session-${Date.now()}`,
            {
              intent: res.intent,
              confidence: res.confidence,
              speechText: res.speechText,
            }
          )
        } catch (_) {
          // silently ignore — analytics recording is non-critical
        } finally {
          setIsRecordingEvent(false)
        }
      }
    }, 1200)
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: card,
          border: `1px solid ${border}`,
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: isListening ? "#ef4444" : accent }} />
            <span style={{ fontSize: "16px", fontWeight: "600", color: text }}>Voice Interaction Assistant</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isRecordingEvent && (
              <span style={{ fontSize: "10px", color: muted }}>📡 logging...</span>
            )}
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: muted,
                fontSize: "18px",
                cursor: "pointer"
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Listening Circle / Mic button */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
          <div
            onClick={() => handleSimulateListen()}
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: isListening ? "rgba(239, 68, 68, 0.15)" : `${accent}20`,
              border: `2px solid ${isListening ? "#ef4444" : accent}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <span style={{ fontSize: "28px" }}>{isListening ? "🎙️" : "🎤"}</span>
          </div>
          <span style={{ fontSize: "12px", color: isListening ? "#ef4444" : muted, marginTop: "8px", fontWeight: "500" }}>
            {isListening ? "Listening to voice input..." : "Click mic or select a prompt below"}
          </span>
        </div>

        {/* Text Input fallback */}
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={speechText}
            onChange={e => setSpeechText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSimulateListen()}
            placeholder="Type or speak a study command..."
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "8px",
              border: `1px solid ${border}`,
              background: inputBg,
              color: text,
              fontSize: "13px",
              outline: "none"
            }}
          />
          <button
            onClick={() => handleSimulateListen()}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              background: accent,
              color: "#042f2e",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer"
            }}
          >
            Parse
          </button>
        </div>

        {/* Sample Prompts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: muted, fontWeight: "600" }}>TRY SAYING:</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSimulateListen(p)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "14px",
                  border: `1px solid ${border}`,
                  background: hover,
                  color: textSec,
                  fontSize: "12px",
                  cursor: "pointer"
                }}
              >
                &quot;{p}&quot;
              </button>
            ))}
          </div>
        </div>

        {/* Parsed Command Output */}
        {lastCommand && (
          <div
            style={{
              padding: "12px",
              borderRadius: "8px",
              background: hover,
              border: `1px solid ${border}`,
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: accent }}>INTENT: {lastCommand.intent}</span>
              <span style={{ fontSize: "11px", color: muted }}>Confidence: {(lastCommand.confidence * 100).toFixed(0)}%</span>
            </div>
            <div style={{ fontSize: "13px", color: text, fontWeight: "500" }}>{lastCommand.actionResponse}</div>
            {lastCommand.intent !== "UNKNOWN" && (
              <div style={{ fontSize: "11px", color: muted }}>✓ Event logged to analytics</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
