import { useState } from "react"
import { ChatMessage, Lang } from "../../types"
import { TR, AI_SUGGESTIONS } from "../../constants/translations"
import { db } from "../../services/storage"

export default function AICopilotModule({ lang }: { lang: Lang }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text:
        "Namaste! 🙏 I'm your DukaanOS AI Copilot. I analyze your sales, inventory stock, customer khata ledger, and supplier prices in real time. Ask me anything about your shop!",
      timestamp: "Just now",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const products = db.getProducts()
  const lowStock = products.filter(p => p.stock <= p.minStock)
  const customers = db.getCustomers()
  const topDebtor = [...customers].sort((a, b) => b.credit - a.credit)[0]

  function generateAIResponse(query: string): string {
    const q = query.toLowerCase()
    if (q.includes("stock") || q.includes("inventory") || q.includes("reorder")) {
      if (lowStock.length === 0) return "Great news! All products currently have healthy stock levels above minimum thresholds."
      return `⚠️ You currently have ${lowStock.length} items with low stock: ${lowStock.map(p => `${p.name} (${p.stock} left)`).join(", ")}. I recommend placing an order with your supplier today!`
    }
    if (q.includes("khata") || q.includes("credit") || q.includes("udhaar") || q.includes("money")) {
      return `💳 Total Khata outstanding is ₹${customers.reduce((s, c) => s + c.credit, 0).toLocaleString("en-IN")}. Your largest balance due is from ${topDebtor.name} (₹${topDebtor.credit}). Would you like me to send a WhatsApp reminder?`
    }
    if (q.includes("profit") || q.includes("sales") || q.includes("revenue")) {
      return "📊 Based on today's transactions, your estimated gross margin is ~22%. Your most profitable category is Snacks & Confectionery (28% margin). Focus on bundling snacks with daily groceries during 6-8 PM evening rush!"
    }
    if (q.includes("discount") || q.includes("offer") || q.includes("deal")) {
      return "💡 Recommendation: Offer a 5% discount on products expiring within 30 days (such as Atta and Dairy packs) to recover cash flow without writing off expired inventory."
    }
    return `Based on your live store data for ${products.length} products and recent customer visits: Everything is running smoothly! Keep your inventory stocked before peak evening hours (6 PM - 8 PM). What specific query can I analyze next?`
  }

  function sendMessage(customText?: string) {
    const textToSend = customText || input
    if (!textToSend.trim()) return

    const userMsg: ChatMessage = {
      role: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const reply = generateAIResponse(textToSend)
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
      setIsTyping(false)
    }, 900)
  }

  const quickPrompts = [
    "Which items are low in stock?",
    "How much Khata credit is outstanding?",
    "How to increase shop profit today?",
    "Generate restock list for suppliers",
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
          🤖 {TR[lang].copilot} & AI Assistant
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Your 24/7 intelligent retail advisor for stock forecasting, margin optimization & automated customer credit tracking
        </p>
      </div>

      {/* AI Proactive Suggestions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {AI_SUGGESTIONS.map((s, i) => (
          <div
            key={i}
            className="card-hover rounded-2xl border p-4 space-y-2 shadow-sm flex flex-col justify-between"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-2xl">{s.icon}</span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    s.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : s.priority === "medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {s.priority} Priority
                </span>
              </div>
              <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
                {s.title}
              </p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {s.desc}
              </p>
            </div>
            <button
              onClick={() => sendMessage(`Tell me more about: ${s.title}`)}
              className="text-xs font-bold pt-2 text-left transition-all hover:opacity-80 cursor-pointer"
              style={{ color: "var(--primary)" }}
            >
              Ask Copilot to Act →
            </button>
          </div>
        ))}
      </div>

      {/* Chatbot Interface */}
      <div
        className="rounded-3xl border overflow-hidden shadow-xl flex flex-col h-[480px]"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Chat Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)", background: "var(--secondary)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">DukaanOS Copilot Chat</p>
              <p className="text-[11px] opacity-80 text-amber-300">Live Context: Inventory · Bills · Khata</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs text-white/80 font-semibold">Online & Learning</span>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 p-5 space-y-4 overflow-y-auto" style={{ background: "var(--background)" }}>
          {messages.map((m, i) => {
            const isUser = m.role === "user"
            return (
              <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm space-y-1"
                  style={{
                    background: isUser ? "var(--primary)" : "var(--card)",
                    color: isUser ? "#fff" : "var(--foreground)",
                    border: isUser ? "none" : "1px solid var(--border)",
                    borderRadius: isUser ? "1.5rem 1.5rem 0.25rem 1.5rem" : "1.5rem 1.5rem 1.5rem 0.25rem",
                  }}
                >
                  <p>{m.text}</p>
                  {m.timestamp && (
                    <p
                      className="text-[10px] text-right"
                      style={{ color: isUser ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)" }}
                    >
                      {m.timestamp}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--primary)" }}>
              <span className="animate-spin">⚙️</span> Copilot is analyzing store data...
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-5 py-2 border-t flex gap-2 overflow-x-auto no-scrollbar" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          {quickPrompts.map(qp => (
            <button
              key={qp}
              onClick={() => sendMessage(qp)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all hover:opacity-80 cursor-pointer shrink-0"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              💬 {qp}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t flex gap-3" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Type your question (e.g. 'What is Ramesh's pending khata?')..."
            className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none border shadow-inner"
            style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <button
            onClick={() => sendMessage()}
            className="px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
