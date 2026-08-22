import { useState, useEffect } from "react"
import { Lang, Theme } from "../../types"
import { TR } from "../../constants/translations"

export default function ThemePage({
  theme,
  setTheme,
  onClose,
  lang,
}: {
  theme: Theme
  setTheme: (t: Theme) => void
  onClose: () => void
  lang: Lang
}) {
  const [selected, setSelected] = useState<Theme>(theme)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setTimeout(() => setVisible(true), 60)
  }, [])

  const options: { value: Theme; label: string; desc: string; bg: string; accent: string; preview: string[] }[] = [
    {
      value: "light",
      label: TR[lang].lightTheme,
      desc: "Warm cream canvas, easy on the eyes during the day.",
      bg: "#FFFBF3",
      accent: "#F59E0B",
      preview: ["#FFFBF3", "#FFFFFF", "#F59E0B"],
    },
    {
      value: "dark",
      label: TR[lang].darkTheme,
      desc: "Deep navy background, ideal for evening & night shifts.",
      bg: "#0F172A",
      accent: "#FBBF24",
      preview: ["#0F172A", "#1E293B", "#FBBF24"],
    },
    {
      value: "saffron",
      label: TR[lang].saffronTheme,
      desc: "Vibrant Indian saffron — bold, warm, and festive.",
      bg: "#FFF7ED",
      accent: "#EA580C",
      preview: ["#FFF7ED", "#FFFFFF", "#EA580C"],
    },
  ]

  function apply() {
    setTheme(selected)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl transition-all duration-500"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.94) translateY(20px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="font-display font-black text-xl" style={{ color: "var(--foreground)" }}>
              🎨 {TR[lang].selectTheme}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Choose how StoreSync looks for you
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-all hover:opacity-70"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all"
              style={{
                borderColor: selected === opt.value ? "var(--primary)" : "var(--border)",
                background: selected === opt.value ? "rgba(245,158,11,0.06)" : "var(--muted)",
                boxShadow: selected === opt.value ? "0 0 0 4px rgba(245,158,11,0.12)" : "none",
              }}
            >
              {/* Colour swatch */}
              <div className="flex rounded-xl overflow-hidden shrink-0 shadow-md" style={{ width: 56, height: 42 }}>
                {opt.preview.map((c, i) => (
                  <div key={i} className="flex-1" style={{ background: c }} />
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>
                  {opt.label}
                </p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {opt.desc}
                </p>
              </div>

              {/* Check indicator */}
              <div
                className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all"
                style={{
                  borderColor: selected === opt.value ? "var(--primary)" : "var(--border)",
                  background: selected === opt.value ? "var(--primary)" : "transparent",
                }}
              >
                {selected === opt.value && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-bold text-sm border transition-all hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--muted)" }}
          >
            Cancel
          </button>
          <button
            onClick={apply}
            className="flex-1 py-3 rounded-2xl font-display font-bold text-sm transition-all hover:opacity-90 active:scale-95 shadow-md"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            Apply Theme ✓
          </button>
        </div>
      </div>
    </div>
  )
}
