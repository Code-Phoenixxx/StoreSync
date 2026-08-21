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
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: "#0D1B2A" }}>
      {/* Background patterns */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(45,90,160,0.35) 0%, transparent 70%)",
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏪</span>
          <span className="font-display font-black text-xl" style={{ color: "#F59E0B" }}>
            DukaanOS
          </span>
        </div>
        <div
          className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
        >
          {timeIcon} {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>

      {/* Main hero */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 md:px-10 py-10 max-w-6xl mx-auto w-full">
        {/* Left text column */}
        <div className="flex-1 text-center lg:text-left max-w-xl">
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

          <h1
            className="font-display font-black leading-tight mb-4"
            style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", color: "#FFFFFF", ...show(2) }}
          >
            Run your shop<br />
            <span style={{ color: "#F59E0B" }}>smarter.</span>{" "}
            <span style={{ color: "#10B981" }}>faster.</span>
          </h1>

          <p className="text-lg mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.65)", ...show(3) }}>
            {TR[lang].tagline}
          </p>

          <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-10" style={show(4)}>
            {features.map(f => (
              <span
                key={f.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {f.icon} {f.label}
              </span>
            ))}
          </div>

          <div style={show(5)} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <button
              onClick={onEnter}
              className="group font-display font-bold text-base px-8 py-4 rounded-2xl transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              style={{
                background: "#F59E0B",
                color: "#1A0E00",
                boxShadow: "0 0 40px rgba(245,158,11,0.35)",
              }}
            >
              {TR[lang].enterShop}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex items-center justify-center gap-2 text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
              🔒 Offline-first · No internet needed
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-full lg:w-auto lg:min-w-[340px] max-w-sm space-y-4" style={show(3)}>
          <div
            className="rounded-3xl p-6 shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-8 rounded-full" style={{ background: "#F59E0B" }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#F59E0B" }}>
                {TR[lang].motivationPrefix}
              </span>
            </div>
            <blockquote className="text-base font-medium italic leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.9)" }}>
              "{quote.quote}"
            </blockquote>
            <cite className="text-xs not-italic font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
              — {quote.author}
            </cite>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "10k+", label: "Shops" },
              { value: "3", label: "Languages" },
              { value: "100%", label: "Offline" },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-2xl p-3 text-center"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p className="font-display font-black text-lg" style={{ color: "#F59E0B" }}>
                  {s.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            🌐 Available in English · हिंदी · বাংলা
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="relative z-10 border-t px-6 md:px-10 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.2)" }}
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
