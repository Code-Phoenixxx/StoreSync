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
    { value: "en", label: "English", native: "English", flag: "🇬🇧", desc: "Manage your shop in English" },
    { value: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳", desc: "हिंदी में अपनी दुकान चलाएं" },
    { value: "bn", label: "Bengali", native: "বাংলা", flag: "🇧🇩", desc: "বাংলায় আপনার দোকান পরিচালনা করুন" },
    { value: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳", desc: "తెలుగులో మీ దుకాణాన్ని నిర్వహించండి" },
    { value: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳", desc: "தமிழில் உங்கள் கடையை நிர்வகியுங்கள்" },
    { value: "mr", label: "Marathi", native: "मराठी", flag: "🇮🇳", desc: "मराठीत आपले दुकान चालवा" },
    { value: "gu", label: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳", desc: "ગુજરાતીમાં તમારી દુકાન ચલાવો" },
    { value: "kn", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳", desc: "ಕನ್ನಡದಲ್ಲಿ ನಿಮ್ಮ ಅಂಗಡಿಯನ್ನು ನಿರ್ವಹಿಸಿ" },
  ]

  return (
    <OnboardingShell step={2} totalSteps={3} onBack={onBack}>
      <div className="w-full max-w-lg slide-up py-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌐</div>
          <h2 className="font-display font-black text-2xl md:text-3xl mb-1" style={{ color: "var(--foreground)" }}>
            {TR[selected]?.chooseLanguage || "Choose Your Language"}
          </h2>
          <p className="text-xs md:text-sm" style={{ color: "var(--muted-foreground)" }}>
            {TR[selected]?.langSubtitle || "Select the language you're most comfortable with"}
          </p>
        </div>

        {/* 2-Column Responsive Language Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-h-[380px] overflow-y-auto pr-1">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className="flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left"
              style={{
                background: selected === opt.value ? "rgba(245,158,11,0.08)" : "var(--card)",
                borderColor: selected === opt.value ? "var(--primary)" : "var(--border)",
                boxShadow: selected === opt.value ? "0 0 0 3px rgba(245,158,11,0.15)" : "none",
              }}
            >
              <span className="text-2xl shrink-0">{opt.flag}</span>
              <div className="text-left flex-1 min-w-0">
                <p className="font-display font-bold text-base truncate" style={{ color: "var(--foreground)" }}>
                  {opt.native}
                </p>
                <p className="text-[11px] truncate" style={{ color: "var(--muted-foreground)" }}>
                  {opt.label}
                </p>
              </div>
              {selected === opt.value && <span className="font-bold text-base" style={{ color: "var(--primary)" }}>✓</span>}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-display font-bold text-sm border transition-all hover:opacity-80 cursor-pointer"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--card)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <button
            onClick={() => onSelect(selected)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-display font-bold text-base transition-all hover:opacity-90 active:scale-95 shadow-lg cursor-pointer"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            {TR[selected]?.continue || "Continue"}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </OnboardingShell>
  )
}
