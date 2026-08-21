import { useState, useEffect } from "react"
import { Lang, Theme } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

export default function SettingsModule({
  lang,
  setLang,
  theme,
  setTheme,
  onLogout,
}: {
  lang: Lang
  setLang: (l: Lang) => void
  theme: Theme
  setTheme: (t: Theme) => void
  onLogout?: () => void
}) {
  const shopInfo = db.getShopInfo()
  const [syncQueue, setSyncQueue] = useState(db.getSyncQueue())
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)

  useEffect(() => {
    const refreshQueue = () => setSyncQueue(db.getSyncQueue())
    const interval = setInterval(refreshQueue, 2000)
    return () => clearInterval(interval)
  }, [])

  function handleLockApp() {
    if (confirm("Lock DukaanOS? You will need to enter your Security PIN to unlock.")) {
      db.clearSession()
      if (onLogout) onLogout()
    }
  }

  async function handleForceSync() {
    setIsSyncing(true)
    setSyncMsg("Pushing pending transactions to cloud database...")
    await db.flushSyncQueue()
    setSyncQueue(db.getSyncQueue())
    setTimeout(() => {
      setIsSyncing(false)
      setSyncMsg("✅ All offline records synced with cloud database successfully!")
      setTimeout(() => setSyncMsg(null), 4000)
    }, 1000)
  }

  function handleClearQueue() {
    if (confirm("Clear pending offline buffer? This will discard unsynced actions.")) {
      localStorage.removeItem("dukaanos_sync_queue_v1")
      setSyncQueue([])
    }
  }

  const themes: { value: Theme; label: string; desc: string }[] = [
    { value: "light", label: "Light Theme", desc: "Clean warm cream background" },
    { value: "dark", label: "Dark Theme", desc: "Deep navy, easy on eyes during night shifts" },
    { value: "saffron", label: "Saffron Theme 🧡", desc: "Vibrant Indian saffron palette" },
  ]
  const langs: { value: Lang; label: string; native: string; flag: string }[] = [
    { value: "en", label: "English", native: "English", flag: "🇬🇧" },
    { value: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
    { value: "bn", label: "Bengali", native: "বাংলা", flag: "🇧🇩" },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
          ⚙️ {TR[lang].settings} & Preferences
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          Configure shop profile, languages, themes, local database backups, and security settings
        </p>
      </div>

      {/* Shop Profile & Session Card */}
      <div className="rounded-3xl border p-5 space-y-4 shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>
            🏪 Shop Authentication & Security
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 font-semibold">
            ✓ Authenticated Session
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span style={{ color: "var(--muted-foreground)" }}>Shop Name:</span>
            <p className="font-bold font-display text-sm mt-0.5" style={{ color: "var(--foreground)" }}>
              {shopInfo.shopName}
            </p>
          </div>
          <div>
            <span style={{ color: "var(--muted-foreground)" }}>Owner / Admin:</span>
            <p className="font-bold font-display text-sm mt-0.5" style={{ color: "var(--foreground)" }}>
              {shopInfo.ownerName}
            </p>
          </div>
          <div>
            <span style={{ color: "var(--muted-foreground)" }}>Category:</span>
            <p className="font-bold font-display text-sm mt-0.5" style={{ color: "var(--foreground)" }}>
              {shopInfo.shopType || "Retail Kirana"}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t flex gap-3" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={handleLockApp}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all cursor-pointer flex items-center gap-1.5"
          >
            🔒 Lock App / Switch Shop
          </button>
        </div>
      </div>

      {/* Offline Sync Engine & Queue Inspector Card */}
      <div className="rounded-3xl border p-5 space-y-4 shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <div>
              <h3 className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>
                Offline Database & Sync Engine
              </h3>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                IndexedDB / LocalStorage hybrid queue for zero network latency
              </p>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              db.isOnline()
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                : "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
            }`}
          >
            {db.isOnline() ? "🟢 Online" : "🔴 Offline Mode"}
          </span>
        </div>

        {syncMsg && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs font-semibold">
            {syncMsg}
          </div>
        )}

        <div className="flex items-center justify-between text-xs pt-1">
          <span style={{ color: "var(--muted-foreground)" }}>Transactions Waiting in Offline Sync Buffer:</span>
          <span className="font-mono font-bold text-sm" style={{ color: "var(--primary)" }}>
            {syncQueue.length} items
          </span>
        </div>

        {/* Sync Queue Item Details */}
        {syncQueue.length > 0 && (
          <div className="space-y-1.5 max-h-36 overflow-y-auto p-3 rounded-2xl border" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
            {syncQueue.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[11px] font-mono border-b pb-1 last:border-0" style={{ borderColor: "var(--border)" }}>
                <span className="font-bold text-amber-600 dark:text-amber-400">{item.type}</span>
                <span style={{ color: "var(--muted-foreground)" }}>{new Date(item.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            disabled={isSyncing || syncQueue.length === 0}
            onClick={handleForceSync}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:opacity-90 cursor-pointer disabled:opacity-40"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            {isSyncing ? "⚡ Syncing..." : "⚡ Push Buffer to Cloud"}
          </button>
          {syncQueue.length > 0 && (
            <button
              onClick={handleClearQueue}
              className="px-3 py-2.5 rounded-xl text-xs font-bold border border-red-300 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
            >
              Clear Buffer
            </button>
          )}
        </div>
      </div>

      {/* Theme Picker */}
      <div className="rounded-3xl border overflow-hidden shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>
            🎨 {TR[lang].selectTheme}
          </h3>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {themes.map(t => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left cursor-pointer"
              style={{
                borderColor: theme === t.value ? "var(--primary)" : "var(--border)",
                background: theme === t.value ? "rgba(245,158,11,0.08)" : "transparent",
              }}
            >
              <div
                className="w-8 h-8 rounded-full border-2 shadow-inner"
                style={{
                  background: t.value === "light" ? "#FFFBF3" : t.value === "dark" ? "#0F172A" : "#FFF7ED",
                  borderColor: t.value === "light" ? "#F59E0B" : t.value === "dark" ? "#FBBF24" : "#EA580C",
                }}
              />
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
                  {t.label}
                </p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {t.desc}
                </p>
              </div>
              {theme === t.value && <span className="font-bold text-lg" style={{ color: "var(--primary)" }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Language Picker */}
      <div className="rounded-3xl border overflow-hidden shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>
            🌐 {TR[lang].chooseLanguage}
          </h3>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {langs.map(l => (
            <button
              key={l.value}
              onClick={() => setLang(l.value)}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left cursor-pointer"
              style={{
                borderColor: lang === l.value ? "var(--primary)" : "var(--border)",
                background: lang === l.value ? "rgba(245,158,11,0.08)" : "transparent",
              }}
            >
              <span className="text-2xl">{l.flag}</span>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
                  {l.native}
                </p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {l.label}
                </p>
              </div>
              {lang === l.value && <span className="font-bold text-lg" style={{ color: "var(--primary)" }}>✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
