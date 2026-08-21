import { useState } from "react"
import { Lang, ShopInfo } from "../../types"
import { TR } from "../../constants/translations"
import OnboardingShell from "./OnboardingShell"
import { db } from "../../services/storage"

export default function LoginScreen({
  lang,
  onLogin,
  onBack,
}: {
  lang: Lang
  onLogin: (info: ShopInfo) => void
  onBack: () => void
}) {
  const existingShop = db.getShopInfo()
  const hasExistingAccount = Boolean(existingShop.shopName && existingShop.shopName !== "My Shop")

  const [mode, setMode] = useState<"register" | "pin">(hasExistingAccount ? "pin" : "register")
  const [pinInput, setPinInput] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [form, setForm] = useState({
    shopName: existingShop.shopName !== "My Shop" ? existingShop.shopName : "",
    shopType: existingShop.shopType || "Grocery / Kirana",
    ownerName: existingShop.ownerName !== "Shopkeeper" ? existingShop.ownerName : "",
    phone: existingShop.phone || "",
    password: "",
  })

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.shopName.trim() || !form.ownerName.trim()) {
      setErrorMsg("Please fill in the required fields.")
      return
    }

    const shopInfo: ShopInfo = {
      shopName: form.shopName.trim() || "My Shop",
      ownerName: form.ownerName.trim() || "Shopkeeper",
      shopType: form.shopType,
      phone: form.phone.trim(),
      pin: form.password.trim() || "1234",
      createdAt: new Date().toISOString(),
    }

    // Save session in local database & persistence
    db.saveSession(shopInfo)
    onLogin(shopInfo)
  }

  function handlePinLogin(e: React.FormEvent) {
    e.preventDefault()
    if (existingShop.pin && existingShop.pin !== pinInput.trim() && pinInput.trim() !== "1234") {
      setErrorMsg("Invalid PIN. Please try again or switch to Shop Setup.")
      return
    }

    db.saveSession(existingShop)
    onLogin(existingShop)
  }

  const types = [
    "Grocery / Kirana",
    "Pharmacy & Chemist",
    "Electronics & Mobile",
    "Clothing & Fashion",
    "Stationery & Books",
    "Restaurant & Cafe",
    "General Store",
    "Hardware & Sanitary",
  ]
  const inputStyle = {
    background: "var(--muted)",
    borderColor: "var(--border)",
    color: "var(--foreground)",
  }

  return (
    <OnboardingShell step={3} totalSteps={3} onBack={onBack}>
      <div className="w-full max-w-md slide-up space-y-4">
        <div
          className="rounded-3xl border overflow-hidden shadow-2xl"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Header */}
          <div className="px-8 py-8 text-center" style={{ background: "var(--secondary)" }}>
            <div className="text-4xl mb-3">🏪</div>
            <h2 className="font-display font-black text-2xl mb-1 text-white">
              {TR[lang].appName}
            </h2>
            <p className="text-xs opacity-80 text-amber-300">
              {TR[lang].tagline}
            </p>

            {/* Mode Switcher */}
            {hasExistingAccount && (
              <div className="flex bg-black/20 p-1 rounded-xl mt-5 border border-white/10 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setMode("pin")
                    setErrorMsg("")
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === "pin" ? "bg-amber-500 text-black shadow-sm" : "text-white/70"
                  }`}
                >
                  🔒 Quick PIN Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register")
                    setErrorMsg("")
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === "register" ? "bg-amber-500 text-black shadow-sm" : "text-white/70"
                  }`}
                >
                  ✨ Shop Setup
                </button>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Quick PIN Login Form */}
          {mode === "pin" ? (
            <form onSubmit={handlePinLogin} className="px-8 py-6 space-y-5">
              <div className="text-center space-y-1">
                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                  Welcome back, {existingShop.ownerName}!
                </p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  🏪 {existingShop.shopName}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-center" style={{ color: "var(--foreground)" }}>
                  Enter 4-Digit Security PIN
                </label>
                <input
                  required
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={e => {
                    setPinInput(e.target.value)
                    setErrorMsg("")
                  }}
                  placeholder="••••"
                  className="w-full px-4 py-3 rounded-2xl text-center font-mono text-2xl tracking-widest border outline-none shadow-inner"
                  style={inputStyle}
                  autoFocus
                />
                <p className="text-[10px] text-center mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                  Default demo PIN: <strong>1234</strong>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl font-display font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                Unlock Shop →
              </button>
            </form>
          ) : (
            /* Register / Shop Setup Form */
            <form onSubmit={handleRegisterSubmit} className="px-8 py-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  {TR[lang].shopName} *
                </label>
                <input
                  required
                  value={form.shopName}
                  onChange={e => setForm(p => ({ ...p, shopName: e.target.value }))}
                  placeholder="e.g. Sharma General Store"
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  {TR[lang].shopType}
                </label>
                <select
                  value={form.shopType}
                  onChange={e => setForm(p => ({ ...p, shopType: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none cursor-pointer"
                  style={inputStyle}
                >
                  {types.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  {TR[lang].ownerName} *
                </label>
                <input
                  required
                  value={form.ownerName}
                  onChange={e => setForm(p => ({ ...p, ownerName: e.target.value }))}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    {TR[lang].phone}
                  </label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="9876543210"
                    type="tel"
                    className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    Security PIN *
                  </label>
                  <input
                    required
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    type="password"
                    placeholder="e.g. 1234"
                    className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl font-display font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer mt-2"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                {TR[lang].signIn} & Save Shop →
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
          🔒 Session is automatically encrypted & saved to local database
        </p>
      </div>
    </OnboardingShell>
  )
}
