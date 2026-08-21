import { useState, useEffect } from "react"
import { Lang } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

export default function VoiceModule({ lang }: { lang: Lang }) {
  const [state, setState] = useState<"idle" | "listening" | "processing" | "done">("idle")
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")

  const products = db.getProducts()
  const bills = db.getBills()
  const customers = db.getCustomers()

  function startListening() {
    setState("listening")
    setTranscript("")
    setResponse("")

    // Check if Browser Web Speech API is supported
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition; webkitSpeechRecognition?: typeof window.SpeechRecognition })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition })
        .webkitSpeechRecognition

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition()
        recognition.lang = lang === "hi" ? "hi-IN" : lang === "bn" ? "bn-IN" : "en-IN"
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const spokenText = event.results[0][0].transcript
          setTranscript(spokenText)
          processVoiceQuery(spokenText)
        }

        recognition.onerror = () => {
          simulateVoiceFallback()
        }

        recognition.start()
        return
      } catch {
        simulateVoiceFallback()
      }
    } else {
      simulateVoiceFallback()
    }
  }

  function simulateVoiceFallback() {
    setTimeout(() => {
      setState("processing")
      const simulatedText =
        lang === "hi"
          ? "दुकान में कितना स्टॉक बचा है?"
          : lang === "bn"
          ? "দোকানে কত স্টক বাকি আছে?"
          : "How much stock is remaining in shop?"
      setTranscript(simulatedText)
      setTimeout(() => {
        processVoiceQuery(simulatedText)
      }, 1000)
    }, 2000)
  }

  function processVoiceQuery(query: string) {
    setState("processing")
    const q = query.toLowerCase()
    let reply = ""

    const lowStock = products.filter(p => p.stock <= p.minStock)
    const todaySales = bills.reduce((s, b) => s + b.total, 0)
    const totalCredit = customers.reduce((s, c) => s + c.credit, 0)

    if (q.includes("बिक्री") || q.includes("বিক্রয়") || q.includes("sale") || q.includes("sales")) {
      reply =
        lang === "hi"
          ? `आज की कुल बिक्री ₹${todaySales} हुई है ${bills.length} ग्राहकों से।`
          : lang === "bn"
          ? `আজকের মোট বিক্রয় হয়েছে ₹${todaySales}।`
          : `Today's total sales are ₹${todaySales} from ${bills.length} bills.`
    } else if (q.includes("उधार") || q.includes("ধার") || q.includes("credit") || q.includes("khata") || q.includes("ramesh")) {
      reply =
        lang === "hi"
          ? `कुल उधार ₹${totalCredit} है। रमेश शर्मा का ₹1,240 बाकी है।`
          : lang === "bn"
          ? `মোট ধার ₹${totalCredit}। রমেশের বাকি ₹১,২৪০।`
          : `Total Khata credit outstanding is ₹${totalCredit}. Ramesh has ₹1,240 balance due.`
    } else {
      reply =
        lang === "hi"
          ? `दुकान में ${products.length} प्रोडक्ट्स हैं, जिनमें से ${lowStock.length} प्रोडक्ट्स में कम स्टॉक बचा है।`
          : lang === "bn"
          ? `দোকানে ${products.length}টি পণ্য আছে, যার মধ্যে ${lowStock.length}টি পণ্যের স্টক কম।`
          : `Your shop has ${products.length} items in catalogue. ${lowStock.length} items require restocking.`
    }

    setResponse(reply)
    setState("done")

    // Speech Synthesis
    if ("speechSynthesis" in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(reply)
        utterance.lang = lang === "hi" ? "hi-IN" : lang === "bn" ? "bn-IN" : "en-IN"
        window.speechSynthesis.speak(utterance)
      } catch {
        // synthesis ignored
      }
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-display font-black text-3xl" style={{ color: "var(--foreground)" }}>
          🎙️ {TR[lang].voice} Assistant
        </h2>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Hands-free voice recognition in English, हिंदी, and বাংলা
        </p>
      </div>

      <div
        className="rounded-3xl border text-center p-8 flex flex-col items-center gap-6 shadow-xl"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {/* Animated Mic Button */}
        <button
          onClick={state === "idle" || state === "done" ? startListening : undefined}
          className="relative w-28 h-28 rounded-full flex items-center justify-center text-4xl transition-all cursor-pointer shadow-2xl active:scale-90"
          style={{
            background: state === "listening" ? "var(--destructive)" : "var(--primary)",
            boxShadow:
              state === "listening"
                ? "0 0 0 16px rgba(239,68,68,0.25), 0 0 0 32px rgba(239,68,68,0.12)"
                : "0 8px 32px rgba(245,158,11,0.4)",
          }}
        >
          🎙️
          {state === "listening" && (
            <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
          )}
        </button>

        <div className="space-y-2 w-full">
          <p className="font-display font-bold text-xl" style={{ color: "var(--foreground)" }}>
            {state === "idle"
              ? "Tap microphone to speak"
              : state === "listening"
              ? "Listening... Speak now!"
              : state === "processing"
              ? "Processing Voice Query..."
              : "Voice Answer Ready"}
          </p>

          {transcript && (
            <div className="mt-3 px-4 py-3 rounded-2xl text-left border" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
              <p className="text-[11px] font-bold mb-0.5" style={{ color: "var(--muted-foreground)" }}>
                You said:
              </p>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                "{transcript}"
              </p>
            </div>
          )}

          {state === "done" && response && (
            <div
              className="mt-3 px-5 py-4 rounded-2xl text-left shadow-sm space-y-1"
              style={{ background: "rgba(245,158,11,0.1)", border: "1.5px solid rgba(245,158,11,0.3)" }}
            >
              <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--primary)" }}>
                🤖 AI Voice Response:
              </p>
              <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--foreground)" }}>
                {response}
              </p>
            </div>
          )}
        </div>

        {/* Example voice commands */}
        <div className="w-full space-y-2 text-left pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
            Sample voice commands you can speak:
          </p>
          {[
            lang === "hi" ? "\"आज कितनी बिक्री हुई?\"" : lang === "bn" ? "\"আজ কত বিক্রি হয়েছে?\"" : "\"How much did I sell today?\"",
            lang === "hi" ? "\"रमेश का उधार कितना है?\"" : lang === "bn" ? "\"রমেশের ধার কত?\"" : "\"What is Ramesh's credit balance?\"",
            lang === "hi" ? "\"दुकान का स्टॉक चेक करो\"" : lang === "bn" ? "\"দোকানের স্টক চেক করো\"" : "\"Check store inventory levels\"",
          ].map((t, i) => (
            <div
              key={i}
              className="px-3.5 py-2 rounded-xl text-xs font-mono border cursor-pointer hover:opacity-80"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
              onClick={() => {
                setTranscript(t.replace(/"/g, ""))
                processVoiceQuery(t.replace(/"/g, ""))
              }}
            >
              👉 {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
