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
  const syncQueue = db.getSyncQueue()

  function handleLockApp() {
    if (confirm("Lock DukaanOS? You will need to enter your Security PIN to unlock.")) {
      db.clearSession()
      if (onLogout) onLogout()
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
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
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

      {/* Offline Sync Engine Status */}
      <div className="rounded-3xl border p-5 space-y-3 shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>
            🔄 Offline Database & Auto-Sync Engine
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
            {db.isOnline() ? "Online Mode" : "Offline Cache Active"}
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          All sales bills, stock updates, and supplier records are cached locally in IndexedDB / LocalStorage. Whenever connection is detected, pending actions are auto-flushed to the cloud.
        </p>
        <div className="flex items-center justify-between pt-2 text-xs">
          <span style={{ color: "var(--muted-foreground)" }}>Pending Offline Transactions in Queue:</span>
          <span className="font-mono font-bold" style={{ color: "var(--primary)" }}>
            {syncQueue.length} items
          </span>
        </div>
        <button
          onClick={() => {
            db.flushSyncQueue()
            alert("✅ Sync complete! All local offline records pushed to cloud database.")
          }}
          className="px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all hover:opacity-90 cursor-pointer"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          ⚡ Force Sync Now
        </button>
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
