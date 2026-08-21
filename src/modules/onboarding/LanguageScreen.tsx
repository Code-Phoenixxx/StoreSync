import { useState } from "react"
import { Lang } from "../../types"
import { TR } from "../../constants/translations"
import OnboardingShell from "./OnboardingShell"

export default function LanguageScreen({
  onSelect,
  onBack,
  currentLang,
}: {
  onSelect: (l: Lang) => void
  onBack: () => void
  currentLang: Lang
}) {
  const [selected, setSelected] = useState<Lang>(currentLang)

  const options: { value: Lang; label: string; native: string; flag: string; desc: string }[] = [
    { value: "en", label: "English", native: "English", flag: "🇬🇧", desc: "Continue in English" },
    { value: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳", desc: "हिंदी में जारी रखें" },
    { value: "bn", label: "Bengali", native: "বাংলা", flag: "🇧🇩", desc: "বাংলায় চালিয়ে যান" },
  ]

  return (
    <OnboardingShell step={2} totalSteps={3} onBack={onBack}>
      <div className="w-full max-w-md slide-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌐</div>
          <h2 className="font-display font-black text-3xl mb-2" style={{ color: "var(--foreground)" }}>
            {TR[selected].chooseLanguage}
          </h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {TR[selected].langSubtitle}
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className="flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer text-left"
              style={{
                background: selected === opt.value ? "rgba(245,158,11,0.08)" : "var(--card)",
                borderColor: selected === opt.value ? "var(--primary)" : "var(--border)",
                boxShadow: selected === opt.value ? "0 0 0 4px rgba(245,158,11,0.15)" : "none",
              }}
            >
              <span className="text-3xl">{opt.flag}</span>
              <div className="text-left flex-1">
                <p className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
                  {opt.native}
                </p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {opt.desc}
                </p>
              </div>
              {selected === opt.value && <span className="font-bold text-lg" style={{ color: "var(--primary)" }}>✓</span>}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl font-display font-bold text-base border transition-all hover:opacity-80 cursor-pointer"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--card)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <button
            onClick={() => onSelect(selected)}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-display font-bold text-lg transition-all hover:opacity-90 active:scale-95 shadow-lg cursor-pointer"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            {TR[selected].continue}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </OnboardingShell>
  )
}
