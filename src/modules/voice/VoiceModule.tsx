import React, { useState, useEffect, useRef } from "react"
import { Lang, Product, Customer, Bill, Supplier } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

// Web Audio API Sound Chimes (Zero external dependencies)
function playChime(type: "start" | "success" | "action") {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    if (type === "start") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } else if (type === "success" || type === "action") {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "triangle"
      osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1) // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2) // G5
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    }
  } catch {}
}

// Polyfill types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string
      }
    }
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: Event) => void
  onend: () => void
}

interface VoiceHistoryItem {
  id: string
  timestamp: string
  userText: string
  aiText: string
  actionDone?: string
  actionType?: "KHATA" | "STOCK" | "INFO"
}

export default function VoiceModule({ lang }: { lang: Lang }) {
  const [isListening, setIsListening] = useState(false)
  const [continuousMode, setContinuousMode] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAiResponse] = useState<string>("")
  const [speechSupported, setSpeechSupported] = useState(true)
  const [voiceLang, setVoiceLang] = useState<"en-IN" | "hi-IN" | "bn-IN">("en-IN")
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [speechRate, setSpeechRate] = useState(1.0)
  const [speechPitch, setSpeechPitch] = useState(1.0)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("")

  const [history, setHistory] = useState<VoiceHistoryItem[]>([
    {
      id: "init-1",
      timestamp: "Just now",
      userText: "Namaste StoreSync Voice Assistant",
      aiText: "Namaste! I am your AI Voice Assistant. I can answer sales queries, check stock, update Khata credit, or adjust product inventory hands-free!",
      actionType: "INFO",
    },
  ])
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null)
  const [activeTabCategory, setActiveTabCategory] = useState<"ALL" | "SALES" | "STOCK" | "KHATA">("ALL")

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const continuousModeRef = useRef(continuousMode)
  continuousModeRef.current = continuousMode

  // Live store data from storage
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  function reloadStoreData() {
    setProducts(db.getProducts())
    setCustomers(db.getCustomers())
    setBills(db.getBills())
    setSuppliers(db.getSuppliers())
  }

  useEffect(() => {
    reloadStoreData()

    function loadVoices() {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const voices = window.speechSynthesis.getVoices()
        setAvailableVoices(voices)
        const matchingVoice = voices.find(v => v.lang.startsWith(voiceLang.slice(0, 2))) || voices[0]
        if (matchingVoice) {
          setSelectedVoiceName(matchingVoice.name)
        }
      }
    }

    loadVoices()
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setSpeechSupported(false)
      return
    }

    try {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = voiceLang

      rec.onresult = (e: SpeechRecognitionEvent) => {
        const spokenText = e.results[0][0].transcript
        setTranscript(spokenText)
        setIsListening(false)
        playChime("success")
        handleProcessVoiceCommand(spokenText)
      }

      rec.onerror = () => {
        setIsListening(false)
      }

      rec.onend = () => {
        setIsListening(false)
        if (continuousModeRef.current) {
          setTimeout(() => {
            if (continuousModeRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start()
                setIsListening(true)
              } catch {}
            }
          }, 1200)
        }
      }

      recognitionRef.current = rec
    } catch (err) {
      console.warn("Speech recognition error:", err)
      setSpeechSupported(false)
    }
  }, [voiceLang])

  function speakText(text: string) {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = voiceLang
    utterance.pitch = speechPitch
    utterance.rate = speechRate

    if (selectedVoiceName && availableVoices.length > 0) {
      const chosen = availableVoices.find(v => v.name === selectedVoiceName)
      if (chosen) utterance.voice = chosen
    }

    window.speechSynthesis.speak(utterance)
  }

  // ── Universal NLP & Action Dispatcher ─────────────────────────────────────
  function handleProcessVoiceCommand(spoken: string) {
    const q = spoken.toLowerCase().trim()
    let answer = ""
    let actionDone: string | undefined = undefined
    let actionType: "KHATA" | "STOCK" | "INFO" = "INFO"

    // 1. ACTION: Record Customer Khata Credit
    if (
      (q.includes("add") || q.includes("write") || q.includes("likho") || q.includes("daalo") || q.includes("record")) &&
      (q.includes("khata") || q.includes("credit") || q.includes("udhaar"))
    ) {
      const numMatch = q.match(/\d+/)
      const amount = numMatch ? parseInt(numMatch[0]) : 150
      let customerName = "Ramesh Kumar"
      const foundCustomer = customers.find(c => q.includes(c.name.toLowerCase().split(" ")[0]))
      if (foundCustomer) customerName = foundCustomer.name

      db.addCustomerCredit(customerName, "9876543210", amount)
      reloadStoreData()
      playChime("action")
      answer = `Done! Added ₹${amount} credit into ${customerName}'s Khata ledger. Total balance updated.`
      actionDone = `Added ₹${amount} credit to ${customerName}`
      actionType = "KHATA"
      setLastActionMessage(actionDone)
    }
    // 2. ACTION: Settle Khata Payment
    else if (
      (q.includes("paid") || q.includes("settle") || q.includes("jama") || q.includes("received")) &&
      (q.includes("khata") || q.includes("payment") || q.includes("rupaye") || q.includes("rs"))
    ) {
      const numMatch = q.match(/\d+/)
      const amount = numMatch ? parseInt(numMatch[0]) : 100
      const found = customers.find(c => q.includes(c.name.toLowerCase().split(" ")[0])) || customers[0]
      if (found) {
        db.recordPayment(found.id, amount)
        reloadStoreData()
        playChime("action")
        answer = `Recorded ₹${amount} repayment for ${found.name}. Remaining Khata balance is ₹${Math.max(0, found.credit - amount)}.`
        actionDone = `Recorded ₹${amount} repayment from ${found.name}`
        actionType = "KHATA"
        setLastActionMessage(actionDone)
      }
    }
    // 3. ACTION: Restock Inventory
    else if (
      (q.includes("add") || q.includes("restock") || q.includes("badhao") || q.includes("lao")) &&
      (q.includes("stock") || q.includes("units") || q.includes("packet") || q.includes("boxes"))
    ) {
      const numMatch = q.match(/\d+/)
      const qtyToAdd = numMatch ? parseInt(numMatch[0]) : 10
      const matchedProd = products.find(p => q.includes(p.name.toLowerCase().split(" ")[0])) || products[0]
      if (matchedProd) {
        db.updateProduct(matchedProd.id, { stock: matchedProd.stock + qtyToAdd })
        reloadStoreData()
        playChime("action")
        answer = `Successfully added ${qtyToAdd} units to ${matchedProd.name}. New available stock is ${matchedProd.stock + qtyToAdd} units.`
        actionDone = `Restocked +${qtyToAdd} units for ${matchedProd.name}`
        actionType = "STOCK"
        setLastActionMessage(actionDone)
      }
    }
    // 4. QUERY: Sales & Total Revenue
    else if (q.includes("sale") || q.includes("revenue") || q.includes("kamai") || q.includes("dhandha") || q.includes("biki") || q.includes("today")) {
      const totalRev = bills.reduce((s, b) => s + b.total, 0)
      const cashRev = bills.filter(b => b.paymentType === "CASH").reduce((s, b) => s + b.total, 0)
      const upiRev = bills.filter(b => b.paymentType === "UPI").reduce((s, b) => s + b.total, 0)
      const khataRev = bills.filter(b => b.paymentType === "KHATA").reduce((s, b) => s + b.total, 0)
      answer = `Total revenue today is ₹${totalRev.toLocaleString("en-IN")} from ${bills.length} bills (Cash: ₹${cashRev}, UPI: ₹${upiRev}, Khata: ₹${khataRev}).`
      actionType = "INFO"
    }
    // 5. QUERY: Low Stock Alert
    else if (q.includes("stock") || q.includes("inventory") || q.includes("khatam") || q.includes("restock") || q.includes("maal")) {
      const low = products.filter(p => p.stock <= p.minStock)
      if (low.length === 0) {
        answer = `Inventory is in great shape! All ${products.length} products have stock well above safety threshold.`
      } else {
        const itemNames = low.slice(0, 3).map(p => `${p.name} (${p.stock} units)`).join(", ")
        answer = `Attention: ${low.length} products have low stock, including ${itemNames}. Consider placing a supplier purchase order.`
      }
      actionType = "STOCK"
    }
    // 6. QUERY: Khata Debtor Balances
    else if (q.includes("khata") || q.includes("credit") || q.includes("udhaar") || q.includes("due") || q.includes("debt")) {
      const totalCredit = customers.reduce((s, c) => s + c.credit, 0)
      const debtors = customers.filter(c => c.credit > 0).sort((a, b) => b.credit - a.credit)
      answer = `Total outstanding Khata credit is ₹${totalCredit.toLocaleString("en-IN")} across ${debtors.length} customers. Highest pending balance is ${
        debtors[0]?.name || "None"
      } with ₹${debtors[0]?.credit || 0}.`
      actionType = "KHATA"
    }
    // 7. QUERY: Specific Product Price and Stock Lookup
    else if (
      q.includes("oil") ||
      q.includes("atta") ||
      q.includes("salt") ||
      q.includes("biscuit") ||
      q.includes("butter") ||
      q.includes("tea") ||
      q.includes("maggi") ||
      q.includes("parle") ||
      q.includes("surf")
    ) {
      const word = q.split(" ").filter(w => w.length > 2).slice(-1)[0]
      const matched = products.find(p => p.name.toLowerCase().includes(word)) || products[0]
      if (matched) {
        answer = `${matched.name} is selling at ₹${matched.price} with ${matched.stock} units in inventory.`
      } else {
        answer = `Product details retrieved from catalogue.`
      }
      actionType = "STOCK"
    }
    // 8. QUERY: Supplier Directory & Dues
    else if (q.includes("supplier") || q.includes("vendor") || q.includes("distributor")) {
      const totalDue = suppliers.reduce((s, x) => s + (x.balanceDue || 0), 0)
      answer = `You have ${suppliers.length} active suppliers with ₹${totalDue.toLocaleString("en-IN")} total balance payable.`
      actionType = "INFO"
    }
    // 9. QUERY: Growth & Margin Tips
    else if (q.includes("margin") || q.includes("profit") || q.includes("tips") || q.includes("advice")) {
      answer = `Boost sales by bundling staples like Atta with high-margin snacks at the counter, and encourage instant UPI scan payments.`
      actionType = "INFO"
    }
    // 10. Fallback
    else {
      answer = `Voice command processed: "${spoken}". Total store revenue is ₹${bills.reduce((s, b) => s + b.total, 0)} with ${products.length} products active.`
      actionType = "INFO"
    }

    setAiResponse(answer)
    speakText(answer)

    const newHistoryItem: VoiceHistoryItem = {
      id: `vh-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      userText: spoken,
      aiText: answer,
      actionDone,
      actionType,
    }
    setHistory(prev => [newHistoryItem, ...prev])
  }

  function toggleListening() {
    if (!speechSupported || !recognitionRef.current) {
      const sampleQueries = [
        "What is today's total sales and revenue?",
        "Which products have low stock and need restock?",
        "Add 150 to Ramesh Kumar khata credit",
        "Add 20 units to Fortune Sunlite Oil stock",
        "Check stock of Fortune Sunlite Oil",
      ]
      const chosen = sampleQueries[Math.floor(Math.random() * sampleQueries.length)]
      setTranscript(chosen)
      playChime("start")
      setTimeout(() => {
        handleProcessVoiceCommand(chosen)
      }, 400)
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      playChime("start")
      setTranscript("Listening... Speak your command 🎙️")
      setAiResponse("")
      recognitionRef.current.lang = voiceLang
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const QUICK_COMMANDS = [
    { label: "📊 Today's Total Sales", cmd: "What is today's total sales and revenue?", cat: "SALES" },
    { label: "⚠️ Low Stock Alert", cmd: "Which products have low stock and need restock?", cat: "STOCK" },
    { label: "💳 Add ₹150 Khata Credit", cmd: "Add 150 to Ramesh Kumar khata credit", cat: "KHATA" },
    { label: "📦 Add +20 Oil Stock", cmd: "Add 20 units to Fortune Sunlite Oil stock", cat: "STOCK" },
    { label: "💰 Settle ₹100 Ramesh", cmd: "Ramesh paid 100 rupees for khata settlement", cat: "KHATA" },
    { label: "🛒 Supplier Dues", cmd: "List all suppliers and balance due", cat: "SALES" },
    { label: "🔍 Check Oil Price & Stock", cmd: "Check stock of Fortune Sunlite Oil", cat: "STOCK" },
    { label: "💡 Profit Margin Tips", cmd: "Give me profit margin and growth tips", cat: "SALES" },
  ]

  const filteredCommands = QUICK_COMMANDS.filter(
    c => activeTabCategory === "ALL" || c.cat === activeTabCategory
  )

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-500/20">
            🎙️
          </div>
          <div>
            <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
              StoreSync AI Voice Assistant
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Voice command actions, live inventory/Khata manipulation & spoken responses
            </p>
          </div>
        </div>

        {/* Controls: Language, TTS Toggle, Hands-Free Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 border" style={{ borderColor: "var(--border)" }}>
            {(["en-IN", "hi-IN", "bn-IN"] as const).map(l => (
              <button
                key={l}
                onClick={() => setVoiceLang(l)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  voiceLang === l ? "bg-amber-500 text-white shadow-xs" : "text-gray-400 hover:text-white"
                }`}
              >
                {l === "en-IN" ? "English" : l === "hi-IN" ? "हिन्दी" : "বাংলা"}
              </button>
            ))}
          </div>

          <button
            onClick={() => setContinuousMode(!continuousMode)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              continuousMode
                ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                : "border-neutral-700 text-gray-400 hover:text-white"
            }`}
            title="Continuous hands-free listening at billing counter"
          >
            {continuousMode ? "🟢 Hands-Free: ON" : "⚪ Hands-Free: OFF"}
          </button>

          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className="px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            style={{ borderColor: "var(--border)", background: "var(--card)", color: "var(--foreground)" }}
          >
            {ttsEnabled ? "🔊 Spoken: ON" : "🔇 Spoken: OFF"}
          </button>
        </div>
      </div>

      {/* Live Action Success Banner */}
      {lastActionMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between slide-up shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <span>Live Action Executed: <strong>{lastActionMessage}</strong></span>
          </div>
          <button onClick={() => setLastActionMessage(null)} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Fluid Glowing Voice Orb Container */}
      <div
        className="rounded-3xl border text-center p-6 md:p-8 flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            isListening ? "opacity-30" : "opacity-5"
          }`}
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.4) 0%, rgba(249, 115, 22, 0.2) 50%, transparent 80%)",
          }}
        />

        <div className="relative">
          {isListening && (
            <>
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 animate-ping opacity-25" />
              <div className="absolute -inset-8 rounded-full bg-amber-500/10 animate-pulse" />
            </>
          )}

          <button
            onClick={toggleListening}
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-4xl shadow-2xl transition-all cursor-pointer relative z-10 active:scale-95 ${
              isListening
                ? "bg-gradient-to-tr from-red-500 via-orange-500 to-amber-500 scale-105 animate-pulse text-white ring-8 ring-amber-500/20"
                : "bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-500 hover:scale-105 text-white shadow-amber-500/30"
            }`}
          >
            <span>{isListening ? "⏹️" : "🎙️"}</span>
            <span className="text-[10px] font-bold mt-1 tracking-wider uppercase opacity-90">
              {isListening ? "Listening" : "Tap Mic"}
            </span>
          </button>
        </div>

        <div className="relative z-10 space-y-1">
          <p className="font-display font-black text-xl" style={{ color: "var(--foreground)" }}>
            {isListening ? "Listening to your command..." : "Tap Microphone to Speak or Command"}
          </p>
          <p className="text-xs text-gray-500">
            {speechSupported
              ? `Language: ${voiceLang === "en-IN" ? "English" : voiceLang === "hi-IN" ? "Hindi (हिन्दी)" : "Bengali (বাংলা)"}`
              : "Speech simulation active"}
          </p>
        </div>

        {/* Animated Spectrum Waveform Visualizer */}
        {isListening && (
          <div className="flex items-center gap-1.5 h-8">
            {[35, 75, 55, 100, 80, 45, 90, 60, 85, 40, 95, 70, 50, 85, 30].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-amber-500 to-orange-400 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDelay: `${(i % 5) * 0.12}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Audio Tuning Drawer */}
        <div className="w-full pt-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-semibold">Pitch:</span>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={speechPitch}
              onChange={e => setSpeechPitch(parseFloat(e.target.value))}
              className="w-20 accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-[10px] text-amber-500 font-bold">{speechPitch.toFixed(2)}x</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-semibold">Speed:</span>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={speechRate}
              onChange={e => setSpeechRate(parseFloat(e.target.value))}
              className="w-20 accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-[10px] text-amber-500 font-bold">{speechRate.toFixed(2)}x</span>
          </div>

          {availableVoices.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-semibold">Voice:</span>
              <select
                value={selectedVoiceName}
                onChange={e => setSelectedVoiceName(e.target.value)}
                className="px-2.5 py-1 rounded-lg border text-[11px] outline-none max-w-44 truncate font-medium"
                style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {availableVoices
                  .filter(v => v.lang.startsWith(voiceLang.slice(0, 2)))
                  .map((v, i) => (
                    <option key={i} value={v.name}>
                      {v.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Categorized Suggested Voice Commands */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            💡 Tap Any Command to Execute:
          </p>

          <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border text-[11px]" style={{ borderColor: "var(--border)" }}>
            {(["ALL", "SALES", "STOCK", "KHATA"] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTabCategory(cat)}
                className={`px-2.5 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTabCategory === cat ? "bg-amber-500 text-white" : "text-gray-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {filteredCommands.map((sc, i) => (
            <button
              key={i}
              onClick={() => {
                setTranscript(sc.cmd)
                playChime("start")
                handleProcessVoiceCommand(sc.cmd)
              }}
              className="card-hover p-3 rounded-2xl border text-left text-xs font-medium transition-all hover:border-amber-400 cursor-pointer shadow-2xs flex flex-col justify-between space-y-1.5"
              style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              <span className="font-bold truncate" style={{ color: "var(--foreground)" }}>{sc.label}</span>
              <span className="text-[10px] text-gray-400 font-mono truncate">"{sc.cmd}"</span>
            </button>
          ))}
        </div>
      </div>

      {/* Spoken Conversation History Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-sm" style={{ color: "var(--foreground)" }}>
            💬 Spoken Conversation Log ({history.length})
          </h3>
          <button
            onClick={() => setHistory([])}
            className="text-[11px] text-gray-400 hover:text-red-500 cursor-pointer"
          >
            Clear Log
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {history.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border space-y-2 shadow-sm transition-all"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
                  🗣️ "{item.userText}"
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{item.timestamp}</span>
              </div>

              <div
                className="p-3 rounded-xl border text-xs space-y-1.5"
                style={{ background: "var(--muted)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-500 text-[10px] uppercase tracking-wider">
                    🤖 AI Spoken Response:
                  </span>
                  <button
                    onClick={() => speakText(item.aiText)}
                    className="text-[10px] text-amber-500 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    🔊 Replay Audio
                  </button>
                </div>
                <p className="text-xs font-medium leading-relaxed" style={{ color: "var(--foreground)" }}>
                  {item.aiText}
                </p>

                {item.actionDone && (
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600">
                    ✓ {item.actionDone}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
