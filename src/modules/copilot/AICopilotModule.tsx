import { useState } from "react"
import { ChatMessage, Lang } from "../../types"
import { TR, AI_SUGGESTIONS } from "../../constants/translations"

/**
 * ============================================================================
 * MODULE: AI COPILOT & CHATBOT
 * OWNER: Person 3 (AI & Smart Systems Specialist)
 * ============================================================================
 * TASKS FOR PERSON 3 TO IMPLEMENT:
 * 1. [ ] Enable AI Copilot proactive insight suggestions based on inventory & sales.
 * 2. [ ] Build Chatbot interface with real LLM integration (Gemini API / Groq / OpenAI).
 * 3. [ ] Pass shop context (low stock items, khata balances) in prompt context.
 * ============================================================================
 */

export default function AICopilotModule({ lang }: { lang: Lang }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Namaste! 🙏 I'm your DukaanOS AI Copilot. Person 3 will connect my intelligent conversational engine.",
    },
  ])
  const [input, setInput] = useState("")

  function handleSend() {
    if (!input.trim()) return
    setMessages(prev => [...prev, { role: "user", text: input }])
    setInput("")
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: "TODO: Person 3 to connect Gemini API / intelligent response generator!",
        },
      ])
    }, 600)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            🤖 {TR[lang].copilot} & AI Assistant
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Assigned to: <strong>Person 3 (AI & Smart Systems Specialist)</strong>
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
          Under Construction by Person 3
        </span>
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
          <li>⏳ <strong>Task 1:</strong> Implement <strong>Chatbot conversation engine</strong> (connect Gemini API / LLM).</li>
          <li>⏳ <strong>Task 2:</strong> Provide intelligent <strong>Shopkeeper proactive advice</strong> (restock warnings, margin tips).</li>
          <li>⏳ <strong>Task 3:</strong> Enable live data querying (e.g. <em>"What is today's total sale?"</em>).</li>
        </ul>
      </div>

      {/* Chat UI Starter */}
      <div
        className="rounded-3xl border overflow-hidden shadow-lg flex flex-col h-[400px]"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
          <p className="font-display font-bold text-white text-sm">🤖 Shop Copilot (Starter Skeleton)</p>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ background: "var(--background)" }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-md px-4 py-2.5 rounded-2xl text-xs"
                style={{
                  background: m.role === "user" ? "var(--primary)" : "var(--card)",
                  color: m.role === "user" ? "#fff" : "var(--foreground)",
                  border: m.role === "user" ? "none" : "1px solid var(--border)",
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Ask Copilot a question..."
            className="flex-1 px-4 py-2 rounded-xl text-xs border outline-none"
            style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
