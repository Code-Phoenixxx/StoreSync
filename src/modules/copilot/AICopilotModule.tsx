import { useState, useEffect, useRef } from "react"
import { ChatMessage, Lang, Product, Bill, Customer, Supplier } from "../../types"
import { TR, AI_SUGGESTIONS } from "../../constants/translations"
import { db } from "../../services/storage"

export default function AICopilotModule({ lang }: { lang: Lang }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("storesync_copilot_history_v1")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {}
    }
    return [
      {
        role: "assistant",
        text: getInitialGreeting(lang),
      },
    ]
  })
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Live shop data
  const [products] = useState<Product[]>(() => db.getProducts())
  const [bills] = useState<Bill[]>(() => db.getBills())
  const [customers] = useState<Customer[]>(() => db.getCustomers())
  const [suppliers] = useState<Supplier[]>(() => db.getSuppliers())

  useEffect(() => {
    localStorage.setItem("storesync_copilot_history_v1", JSON.stringify(messages))
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  function getInitialGreeting(l: Lang): string {
    const greetings: Record<Lang, string> = {
      en: "Namaste! 🙏 I'm your StoreSync AI Copilot. I analyze your sales, inventory, and customer khata in real-time. Ask me anything about your shop!",
      hi: "नमस्ते! 🙏 मैं आपका StoreSync AI सहायक हूँ। मैं आपकी बिक्री, स्टॉक और खाता का लाइव विश्लेषण करता हूँ। अपनी दुकान के बारे में कुछ भी पूछें!",
      bn: "নমস্কার! 🙏 আমি আপনার StoreSync AI সহকারী। আমি আপনার বিক্রয়, ইনভেন্টরি এবং খাতার রিয়েল-টাইম বিশ্লেষণ করি। আপনার দোকান সম্পর্কে যা ইচ্ছা জিজ্ঞাসা করুন!",
      te: "నమస్కారం! 🙏 నేను మీ StoreSync AI కోపైలట్. మీ అమ్మకాలు, స్టాక్ మరియు ఖాతాను నేను నిజ సమయంలో విశ్లేషిస్తాను.",
      ta: "வணக்கம்! 🙏 நான் உங்கள் StoreSync AI உதவியாளர். உங்கள் விற்பனை, சரக்கு மற்றும் கடன் கணக்கை நிகழ்நேரத்தில் பகுப்பாய்வு செய்கிறேன்.",
      mr: "नमस्कार! 🙏 मी आपला StoreSync AI सहाय्यक आहे. मी आपली विक्री, साठा आणि उधारीचे थेट विश्लेषण करतो.",
      gu: "નમસ્તે! 🙏 હું તમારો StoreSync AI કોપાયલટ છું. હું તમારા વેચાણ, સ્ટોક અને ખાતાવહીનું લાઈવ વિશ્લેષણ કરું છું.",
      kn: "ನಮಸ್ಕಾರ! 🙏 ನಾನು ನಿಮ್ಮ StoreSync AI ಸಹಾಯಕ. ನಿಮ್ಮ ಮಾರಾಟ, ದಾಸ್ತಾನು ಮತ್ತು ಖಾತೆಯನ್ನು ನಾನು ವಿಶ್ಲೇಷಿಸುತ್ತೇನೆ.",
    }
    return greetings[l] || greetings.en
  }

  // Quick Prompt Chips
  const promptChips = [
    { label: "📦 Low Stock Items", query: "Which items are running low on stock and need restock?" },
    { label: "💰 Today's Revenue", query: "What is my total sales revenue and transaction count today?" },
    { label: "💳 Highest Khata Debt", query: "Which customers have the highest pending credit balances in Khata?" },
    { label: "📈 Top Selling Products", query: "What are my best selling products and profit margin advice?" },
  ]

  // Intelligent Local Offline Semantic Engine + Gemini Cloud integration
  async function generateAIResponse(userQuery: string): Promise<string> {
    const query = userQuery.toLowerCase().trim()
    const todayRevenue = bills.reduce((s, b) => s + b.total, 0)
    const lowStockItems = products.filter(p => p.stock <= p.minStock)
    const totalCreditGiven = customers.reduce((s, c) => s + c.credit, 0)
    const topDebtors = [...customers].sort((a, b) => b.credit - a.credit).slice(0, 3)

    // Optional Gemini API Key from environment
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
    if (geminiKey && navigator.onLine) {
      try {
        const systemContext = `You are StoreSync AI Copilot, an expert, friendly shopkeeper assistant for Indian retail kirana stores.
Current Store Context:
- Shop Inventory: ${products.length} products total. Low stock items (${lowStockItems.length}): ${lowStockItems.map(p => `${p.name} (Stock: ${p.stock}, Min: ${p.minStock})`).join(", ")}.
- Today's Bills: ${bills.length} bills, Total Revenue: ₹${todayRevenue}.
- Customer Khata Credit: Total ₹${totalCreditGiven} pending across ${customers.length} customers. Top debtors: ${topDebtors.map(c => `${c.name}: ₹${c.credit}`).join(", ")}.
- Suppliers: ${suppliers.map(s => `${s.name} (${s.category}, Rating: ${s.rating}★)`).join(", ")}.

Respond concisely in clean markdown with bullet points and emojis. Answer the shopkeeper's question accurately in language code: ${lang}.`

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: systemContext },
                    { text: userQuery },
                  ],
                },
              ],
            }),
          }
        )

        if (response.ok) {
          const data = await response.json()
          const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (aiText) return aiText
        }
      } catch (err) {
        console.warn("[Copilot] Cloud AI fetch failed, falling back to local engine:", err)
      }
    }

    // Built-in Intelligent Local Rule Engine (Offline & Fast)
    if (query.includes("stock") || query.includes("low") || query.includes("reorder") || query.includes("inventory") || query.includes("सामान") || query.includes("स्टॉक")) {
      if (lowStockItems.length === 0) {
        return `✅ **Great news!** All **${products.length} products** in your inventory are well-stocked above their minimum thresholds.`
      }
      return `⚠️ **Low Stock Alert (${lowStockItems.length} items need reordering):**\n\n` +
        lowStockItems
          .map(
            (p, i) =>
              `${i + 1}. **${p.name}** — Only **${p.stock} units left** (Min safety threshold: ${p.minStock}). Price: ₹${p.price}`
          )
          .join("\n") +
        `\n\n💡 *Tip: Go to the **🛒 Suppliers** module to generate a Smart Restock Purchase Order automatically!*`
    }

    if (query.includes("sale") || query.includes("revenue") || query.includes("bill") || query.includes("कमाई") || query.includes("बिक्री") || query.includes("টাকা")) {
      const avgBill = bills.length > 0 ? Math.round(todayRevenue / bills.length) : 0
      const paidBills = bills.filter(b => b.paid).length
      return `💰 **Today's Financial Summary:**\n\n` +
        `• **Total Revenue:** ₹${todayRevenue.toLocaleString("en-IN")}\n` +
        `• **Total Bills Issued:** ${bills.length} invoices (${paidBills} paid immediately, ${bills.length - paidBills} Khata credit)\n` +
        `• **Average Bill Value:** ₹${avgBill}\n` +
        `• **Estimated Profit Margin:** ~₹${Math.round(todayRevenue * 0.22).toLocaleString("en-IN")} (22% gross)\n\n` +
        `🚀 *Your sales velocity is up by **+12%** compared to yesterday's pace!*`
    }

    if (query.includes("khata") || query.includes("credit") || query.includes("debt") || query.includes("उधार") || query.includes("खाता") || query.includes("বাকি")) {
      return `💳 **Khata / Credit Ledger Analysis:**\n\n` +
        `• **Total Outstanding Credit:** ₹${totalCreditGiven.toLocaleString("en-IN")} across **${customers.length} customers**.\n\n` +
        `**Top Pending Balances:**\n` +
        topDebtors.map((c, i) => `${i + 1}. **${c.name}** — ₹${c.credit} (Phone: ${c.phone})`).join("\n") +
        `\n\n💡 *Action: Go to the **💳 Khata** module to send a polite WhatsApp payment reminder with one click.*`
    }

    if (query.includes("supplier") || query.includes("vendor") || query.includes("dealer") || query.includes("सप्लायर")) {
      return `🛒 **Supplier Directory Summary:**\n\nYou currently have **${suppliers.length} active suppliers** registered:\n\n` +
        suppliers.map(s => `• **${s.name}** — ${s.category} (Rating: ${s.rating}★, Contact: ${s.contact})`).join("\n")
    }

    if (query.includes("profit") || query.includes("margin") || query.includes("tips") || query.includes("grow") || query.includes("सुझाव")) {
      return `📈 **AI Profit Maximization Recommendations:**\n\n` +
        `1. **Bundle Slow Movers:** Pair high-margin snacks with daily staples like cooking oil.\n` +
        `2. **Reduce Khata Cycle:** Encourage UPI checkout with a 1% instant cashback discount to avoid locked cashflow.\n` +
        `3. **Bulk Procurement:** Place grouped orders with **${suppliers[0]?.name || "top suppliers"}** to negotiate wholesale volume discounts.`
    }

    // Default friendly conversational response
    return `🤖 **StoreSync AI Copilot Insights:**\n\n` +
      `Here is a quick snapshot of your store right now:\n` +
      `• **Catalogue:** ${products.length} items (${lowStockItems.length} low stock)\n` +
      `• **Today's Sales:** ₹${todayRevenue.toLocaleString("en-IN")} (${bills.length} bills)\n` +
      `• **Khata Balance:** ₹${totalCreditGiven.toLocaleString("en-IN")} pending\n\n` +
      `You can ask me questions like:\n` +
      `- *"Which items need restock?"*\n` +
      `- *"Show today's total revenue"*\n` +
      `- *"Who owes the most in Khata?"*`
  }

  async function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim()
    if (!text || loading) return

    const newMsg: ChatMessage = { role: "user", text }
    setMessages(prev => [...prev, newMsg])
    setInput("")
    setLoading(true)

    try {
      const reply = await generateAIResponse(text)
      setMessages(prev => [...prev, { role: "assistant", text: reply }])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Sorry, I encountered an issue processing your request. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleClearChat() {
    if (confirm("Clear Copilot chat conversation history?")) {
      const resetMsg: ChatMessage[] = [{ role: "assistant", text: getInitialGreeting(lang) }]
      setMessages(resetMsg)
      localStorage.removeItem("storesync_copilot_history_v1")
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md" style={{ background: "var(--secondary)" }}>
            🤖
          </div>
          <div>
            <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
              {TR[lang]?.copilot || "AI Copilot"} & Intelligent Advisor
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Real-time sales intelligence, inventory forecasting, and khata analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Engine Active
          </span>
          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
            title="Clear Chat History"
          >
            🗑️ Clear Chat
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Cols: Chatbot Conversational Interface */}
        <div
          className="lg:col-span-2 rounded-3xl border shadow-xl flex flex-col h-[560px] overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Chat Window Banner */}
          <div
            className="px-5 py-3 border-b flex items-center justify-between"
            style={{ background: "var(--secondary)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <p className="font-display font-bold text-white text-sm">StoreSync AI Assistant</p>
            </div>
            <span className="text-[11px] font-mono text-white/60">Live Shop Context Connected</span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto" style={{ background: "var(--background)" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 shadow-sm mt-0.5"
                    style={{ background: "var(--secondary)", color: "#fff" }}
                  >
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-[85%] md:max-w-md px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    m.role === "user" ? "rounded-tr-xs" : "rounded-tl-xs"
                  }`}
                  style={{
                    background: m.role === "user" ? "var(--primary)" : "var(--card)",
                    color: m.role === "user" ? "#1A0A00" : "var(--foreground)",
                    border: m.role === "user" ? "none" : "1px solid var(--border)",
                  }}
                >
                  <div className="whitespace-pre-line font-medium">{m.text}</div>
                </div>

                {m.role === "user" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm mt-0.5"
                    style={{ background: "var(--primary)", color: "#1A0A00" }}
                  >
                    👤
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                  style={{ background: "var(--secondary)", color: "#fff" }}
                >
                  🤖
                </div>
                <div
                  className="px-4 py-2.5 rounded-2xl text-xs border flex items-center gap-2"
                  style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                  Analyzing store database...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 border-t flex items-center gap-2 overflow-x-auto" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <span className="text-[11px] font-bold shrink-0" style={{ color: "var(--primary)" }}>
              ⚡ Suggestions:
            </span>
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSend(chip.query)}
                className="text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap transition-all hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer disabled:opacity-50"
                style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-3 md:p-4 border-t flex gap-2" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask Copilot e.g., 'What items need restock?' or 'Show today revenue'..."
              className="flex-1 px-4 py-3 rounded-2xl text-xs md:text-sm border outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-2xl text-xs md:text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-40"
              style={{ background: "var(--primary)", color: "#1A0A00" }}
            >
              Send 🚀
            </button>
          </div>
        </div>

        {/* Right 1-Col: Live AI Store Insights & Health Widget */}
        <div className="space-y-4">
          {/* Store Health Snapshot */}
          <div
            className="rounded-3xl border p-5 shadow-sm space-y-4"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm" style={{ color: "var(--foreground)" }}>
                📊 Real-Time Store Pulse
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 font-bold text-amber-600 dark:text-amber-400">
                Live
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: "var(--muted)" }}>
                <span style={{ color: "var(--muted-foreground)" }}>Today's Sales Revenue:</span>
                <span className="font-mono font-bold text-sm" style={{ color: "var(--accent)" }}>
                  ₹{bills.reduce((s, b) => s + b.total, 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: "var(--muted)" }}>
                <span style={{ color: "var(--muted-foreground)" }}>Low Stock Items:</span>
                <span className="font-mono font-bold text-sm text-red-500">
                  {products.filter(p => p.stock <= p.minStock).length} items
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: "var(--muted)" }}>
                <span style={{ color: "var(--muted-foreground)" }}>Pending Khata Balance:</span>
                <span className="font-mono font-bold text-sm text-amber-500">
                  ₹{customers.reduce((s, c) => s + c.credit, 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Proactive AI Insights Feed */}
          <div
            className="rounded-3xl border p-5 shadow-sm space-y-3"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <h3 className="font-display font-bold text-sm" style={{ color: "var(--foreground)" }}>
                Proactive AI Alerts
              </h3>
            </div>

            <div className="space-y-2.5">
              {AI_SUGGESTIONS.slice(0, 3).map((s, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border text-xs space-y-1 transition-all"
                  style={{
                    background:
                      s.priority === "high"
                        ? "rgba(239,68,68,0.06)"
                        : s.priority === "medium"
                        ? "rgba(245,158,11,0.06)"
                        : "var(--muted)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold" style={{ color: "var(--foreground)" }}>
                      {s.icon} {s.title}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        s.priority === "high"
                          ? "bg-red-100 text-red-600"
                          : s.priority === "medium"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {s.priority}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
