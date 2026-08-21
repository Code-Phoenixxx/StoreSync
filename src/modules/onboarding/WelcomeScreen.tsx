import { useState, useEffect } from "react"
import { Lang } from "../../types"
import { TR, QUOTES } from "../../constants/translations"

export default function WelcomeScreen({ onEnter, lang }: { onEnter: () => void; lang: Lang }) {
  const [step, setStep] = useState(0)
  const h = new Date().getHours()
  const timeIcon = h < 12 ? "☀️" : h < 17 ? "⛅" : "🌙"
  const quote = QUOTES[new Date().getDate() % QUOTES.length]

  function getGreeting(l: Lang): string {
    if (h < 12) return TR[l].goodMorning
    if (h < 17) return TR[l].goodAfternoon
    return TR[l].goodEvening
  }

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 80),
      setTimeout(() => setStep(2), 340),
      setTimeout(() => setStep(3), 600),
      setTimeout(() => setStep(4), 860),
      setTimeout(() => setStep(5), 1100),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const show = (n: number) => ({
    opacity: step >= n ? 1 : 0,
    transform: step >= n ? "translateY(0)" : "translateY(24px)",
    transition: "opacity 0.55s ease, transform 0.55s ease",
  })

  const features = [
    { icon: "🧾", label: "Smart Billing" },
    { icon: "📦", label: "Inventory" },
    { icon: "💳", label: "Khata / Credit" },
    { icon: "📊", label: "Analytics" },
    { icon: "🤖", label: "AI Copilot" },
    { icon: "🎙️", label: "Voice Control" },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between" style={{ background: "#0D1B2A" }}>
      {/* Background patterns */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(245,158,11,0.2) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(45,90,160,0.35) 0%, transparent 70%)",
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏪</span>
          <span className="font-display font-black text-xl" style={{ color: "#F59E0B" }}>
            StoreSyncOS
          </span>
        </div>
        <div
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
        >
          {timeIcon} {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>

      {/* Center-Oriented Hero Section */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-12 max-w-4xl mx-auto w-full">
        {/* Greeting badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 shadow-sm"
          style={{
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "#FCD34D",
            ...show(1),
          }}
        >
          {timeIcon} {getGreeting(lang)}
        </div>

        {/* Headline */}
        <h1
          className="font-display font-black leading-tight mb-4 tracking-tight"
          style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", color: "#FFFFFF", ...show(2) }}
        >
          Run your shop <br />
          <span style={{ color: "#F59E0B" }}>smarter.</span>{" "}
          <span style={{ color: "#10B981" }}>faster.</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg md:text-xl mb-8 leading-relaxed max-w-2xl" style={{ color: "rgba(255,255,255,0.65)", ...show(3) }}>
          {TR[lang]?.tagline || "Your Complete Shop Management Solution"}
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-10 max-w-2xl" style={show(4)}>
          {features.map(f => (
            <span
              key={f.label}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold shadow-sm"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {f.icon} {f.label}
            </span>
          ))}
        </div>

        {/* Center CTA Button & Offline text below it */}
        <div style={show(5)} className="flex flex-col items-center gap-3 w-full max-w-md">
          <button
            onClick={onEnter}
            className="w-full sm:w-auto font-display font-bold text-lg px-12 py-4 rounded-2xl transition-all hover:scale-[1.03] active:scale-95 cursor-pointer shadow-2xl"
            style={{
              background: "#F59E0B",
              color: "#1A0E00",
              boxShadow: "0 0 40px rgba(245,158,11,0.4)",
            }}
          >
            {TR[lang]?.enterShop || "Enter Your Shop"}
          </button>
          
          <div className="flex items-center justify-center gap-2 text-xs font-medium mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            🔒 Offline-first · No internet needed
          </div>
        </div>

        {/* Motivation quote centered */}
        <div className="w-full max-w-xl mt-10 rounded-2xl p-4 text-center" style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          ...show(5),
        }}>
          <p className="text-xs italic leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            "{quote.quote}" — <span className="font-semibold not-italic text-amber-400">{quote.author}</span>
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="relative z-10 border-t px-6 md:px-12 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.25)" }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          {["📦 Catalogue", "🧾 POS Billing", "💳 Khata", "📸 OCR Scanner", "🛒 Suppliers", "📊 Analytics", "🤖 AI Copilot"].map(f => (
            <span key={f} className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
              {f}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {["Welcome", "Language", "Shop Setup"].map((label, i) => (
            <div key={label} className="flex items-center gap-1.5">
              {i > 0 && <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.15)" }} />}
              <div className="flex items-center gap-1">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: i === 0 ? "#F59E0B" : "rgba(255,255,255,0.12)",
                    color: i === 0 ? "#1A0E00" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {i + 1}
                </div>
                <span className="text-xs hidden md:inline" style={{ color: i === 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
