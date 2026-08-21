import { useState, useRef } from "react"
import { Lang, Module, Theme } from "../../types"
import { TR } from "../../constants/translations"

export const NAV_GROUPS: {
  label: keyof typeof TR["en"]
  icon: string
  module: Module
  children?: { label: keyof typeof TR["en"]; icon: string; module: Module }[]
}[] = [
  { label: "catalogue", icon: "📦", module: "catalogue" },
  {
    label: "billing",
    icon: "🧾",
    module: "billing",
    children: [
      { label: "newBillPOS", icon: "🧾", module: "billing" },
      { label: "khata", icon: "💳", module: "khata" },
      { label: "scanBill", icon: "📸", module: "ocr" },
    ],
  },
  { label: "supplier", icon: "🛒", module: "supplier" },
  { label: "analytics", icon: "📊", module: "analytics" },
  {
    label: "copilot",
    icon: "🤖",
    module: "copilot",
    children: [
      { label: "copilot", icon: "🤖", module: "copilot" },
      { label: "voice", icon: "🎙️", module: "voice" },
    ],
  },
  { label: "settings", icon: "⚙️", module: "settings" },
]

interface TopBarProps {
  lang: Lang
  setLang: (l: Lang) => void
  theme: Theme
  activeModule: Module
  setModule: (m: Module) => void
  shopName: string
  online: boolean
  syncing: boolean
  pendingSyncCount?: number
  onOpenTheme: () => void
}

export default function TopBar({
  lang,
  setLang,
  theme,
  activeModule,
  setModule,
  shopName,
  online,
  syncing,
  pendingSyncCount = 0,
  onOpenTheme,
}: TopBarProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function openDrop(i: number) {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpenIdx(i)
  }
  function closeDrop() {
    timerRef.current = setTimeout(() => setOpenIdx(null), 140)
  }

  const langs = [
    { value: "en" as Lang, label: "EN" },
    { value: "hi" as Lang, label: "हि" },
    { value: "bn" as Lang, label: "বা" },
  ]
  const themeIcon = theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "🧡"

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ background: "var(--secondary)" }}>
      <div className="flex items-center h-16 px-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {/* 1. Shop Logo on Far Left */}
        <button
          onClick={() => setModule("dashboard")}
          className="flex items-center gap-2.5 font-display font-black text-xl select-none shrink-0 cursor-pointer"
          style={{ color: "var(--primary)" }}
          title="Go to Dashboard"
        >
          🏪 <span className="hidden sm:inline" style={{ color: "#fff" }}>{shopName || TR[lang].appName}</span>
        </button>

        {/* 2. flex-1 Spacer */}
        <div className="flex-1" />

        {/* 3. Grouped on the Right: Nav Tabs + Language + Theme */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Navigation tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_GROUPS.map((grp, i) => {
              const isActive =
                grp.module === activeModule || grp.children?.some(c => c.module === activeModule)
              return (
                <div
                  key={i}
                  className="relative"
                  onMouseEnter={() => openDrop(i)}
                  onMouseLeave={closeDrop}
                >
                  <button
                    onClick={() => {
                      setModule(grp.module)
                      setOpenIdx(null)
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer"
                    style={{
                      color: isActive ? "var(--primary)" : "rgba(255,255,255,0.85)",
                      background: isActive ? "rgba(245,158,11,0.18)" : "transparent",
                    }}
                  >
                    <span className="text-sm">{grp.icon}</span>
                    {TR[lang][grp.label]}
                    {grp.children && (
                      <svg width="9" height="6" viewBox="0 0 9 6" fill="none" style={{ opacity: 0.6 }}>
                        <path d="M1 1l3.5 4L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  {openIdx === i && grp.children && (
                    <div
                      className="dropdown-enter absolute top-full right-0 mt-2 min-w-44 rounded-2xl shadow-2xl border py-2 z-50"
                      style={{ background: "var(--card)", borderColor: "var(--border)" }}
                      onMouseEnter={() => openDrop(i)}
                      onMouseLeave={closeDrop}
                    >
                      {grp.children.map((sub, j) => (
                        <button
                          key={j}
                          onClick={() => {
                            setModule(sub.module)
                            setOpenIdx(null)
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-left transition-all cursor-pointer"
                          style={{
                            color: sub.module === activeModule ? "var(--primary)" : "var(--foreground)",
                            background: sub.module === activeModule ? "var(--muted)" : "transparent",
                          }}
                        >
                          <span className="w-5 text-center">{sub.icon}</span>
                          {TR[lang][sub.label]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Sync status badge with pending counter */}
          <div
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-inner"
            style={{
              background: online
                ? syncing
                  ? "rgba(245,158,11,0.18)"
                  : "rgba(16,185,129,0.18)"
                : "rgba(239,68,68,0.18)",
              color: online ? (syncing ? "#F59E0B" : "#10B981") : "#EF4444",
            }}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${syncing ? "animate-ping" : ""}`}
              style={{ background: online ? (syncing ? "#F59E0B" : "#10B981") : "#EF4444" }}
            />
            {online ? (syncing ? TR[lang].syncing : TR[lang].synced) : TR[lang].offlineMode}
            {pendingSyncCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-red-500 text-white font-mono text-[10px]">
                {pendingSyncCount} pending
              </span>
            )}
          </div>

          {/* Language toggle */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
            {langs.map(l => (
              <button
                key={l.value}
                onClick={() => setLang(l.value)}
                className="px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
                style={{
                  background: lang === l.value ? "var(--primary)" : "transparent",
                  color: lang === l.value ? "#fff" : "rgba(255,255,255,0.6)",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Theme button */}
          <button
            onClick={onOpenTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all hover:opacity-80 cursor-pointer"
            style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.14)", color: "#fff" }}
            title="Change theme"
          >
            {themeIcon} <span className="hidden sm:inline text-xs">Theme</span>
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all cursor-pointer"
            style={{ color: "#fff" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Context bar */}
      <div
        className="hidden md:flex items-center px-6 py-1.5 gap-3 text-xs border-t"
        style={{
          background: "rgba(0,0,0,0.22)",
          color: "rgba(255,255,255,0.5)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.7)" }}>
          {new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : lang === "bn" ? "bn-IN" : "en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <span
          className="ml-auto flex items-center gap-1.5 xl:hidden"
          style={{ color: online ? "#10B981" : "#EF4444" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
          {online ? (syncing ? TR[lang].syncing : TR[lang].synced) : TR[lang].offlineMode}
        </span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t" style={{ background: "var(--secondary)", borderColor: "rgba(255,255,255,0.08)" }}>
          {NAV_GROUPS.flatMap(g => g.children ?? [g]).map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setModule(item.module)
                setMobileOpen(false)
              }}
              className="flex items-center gap-3 w-full px-5 py-3.5 text-sm font-medium text-left border-b"
              style={{ color: "rgba(255,255,255,0.85)", borderColor: "rgba(255,255,255,0.06)" }}
            >
              <span>{item.icon}</span> {TR[lang][item.label]}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
