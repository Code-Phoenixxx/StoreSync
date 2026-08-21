import { useState } from "react"
import { Lang } from "../../types"
import { TR } from "../../constants/translations"

/**
 * ============================================================================
 * MODULE: VOICE ASSISTANT
 * OWNER: Person 3 (AI & Smart Systems Specialist)
 * ============================================================================
 * TASKS FOR PERSON 3 TO IMPLEMENT:
 * 1. [ ] Web Speech API / SpeechRecognition integration.
 * 2. [ ] Voice command parsing for English, Hindi, and Bengali.
 * 3. [ ] Text-to-Speech (TTS) voice answer playback via window.speechSynthesis.
 * ============================================================================
 */

export default function VoiceModule({ lang }: { lang: Lang }) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")

  function handleVoiceClick() {
    setListening(true)
    setTimeout(() => {
      setListening(false)
      setTranscript("TODO: Person 3 to capture microphone speech & execute voice commands!")
    }, 1500)
  }

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1 border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-display font-black text-3xl" style={{ color: "var(--foreground)" }}>
          🎙️ {TR[lang].voice} Assistant
        </h2>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Assigned to: <strong>Person 3 (AI & Smart Systems Specialist)</strong>
        </p>
      </div>

      {/* Developer Tasks Checklist Card */}
      <div
        className="rounded-2xl border p-5 space-y-3"
        style={{ background: "rgba(245,158,11,0.06)", borderColor: "var(--border)" }}
      >
        <h3 className="font-display font-bold text-sm" style={{ color: "var(--primary)" }}>
          🛠️ Person 3 Implementation Checklist:
        </h3>
        <ul className="text-xs space-y-2 font-medium" style={{ color: "var(--foreground)" }}>
          <li>⏳ <strong>Task 1:</strong> Hook up <code>window.SpeechRecognition</code> or <code>webkitSpeechRecognition</code>.</li>
          <li>⏳ <strong>Task 2:</strong> Parse spoken queries (e.g. <em>"Kitna stock bacha hai?"</em>, <em>"Add 2kg salt"</em>).</li>
          <li>⏳ <strong>Task 3:</strong> Play audio answer with <code>window.speechSynthesis.speak(...)</code>.</li>
        </ul>
      </div>

      {/* Mic Starter Box */}
      <div
        className="rounded-3xl border text-center p-8 flex flex-col items-center gap-6 shadow-sm"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <button
          onClick={handleVoiceClick}
          className="w-24 h-24 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
          style={{ background: listening ? "var(--destructive)" : "var(--primary)", color: "#fff" }}
        >
          🎙️
        </button>

        <p className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>
          {listening ? "Listening to microphone..." : "Tap mic to test Voice Assistant"}
        </p>

        {transcript && (
          <div className="w-full p-4 rounded-xl border text-xs text-left" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
            <p className="font-semibold text-amber-500 mb-1">Captured Output:</p>
            <p style={{ color: "var(--foreground)" }}>{transcript}</p>
          </div>
        )}
      </div>
    </div>
  )
}
