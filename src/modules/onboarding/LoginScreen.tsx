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
  const [form, setForm] = useState({
    shopName: "",
    shopType: "Grocery",
    ownerName: "",
    phone: "",
    password: "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const shopInfo: ShopInfo = {
      shopName: form.shopName.trim() || "My Shop",
      ownerName: form.ownerName.trim() || "Shopkeeper",
      shopType: form.shopType,
      phone: form.phone.trim(),
    }
    db.saveShopInfo(shopInfo)
    onLogin(shopInfo)
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
    border: "1.5px solid var(--border)",
    color: "var(--foreground)",
  }

  return (
    <OnboardingShell step={3} totalSteps={3} onBack={onBack}>
      <div className="w-full max-w-md slide-up">
        <div
          className="rounded-3xl border overflow-hidden shadow-xl"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Header */}
          <div className="px-8 py-8 text-center" style={{ background: "var(--secondary)" }}>
            <div className="text-4xl mb-3">🏪</div>
            <h2 className="font-display font-black text-2xl mb-1" style={{ color: "#fff" }}>
              DukaanOS
            </h2>
            <p className="text-sm opacity-80" style={{ color: "#FDE68A" }}>
              {TR[lang].tagline}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                {TR[lang].shopName} *
              </label>
              <input
                required
                value={form.shopName}
                onChange={e => setForm(p => ({ ...p, shopName: e.target.value }))}
                placeholder="e.g. Sharma General Store"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-amber-500"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                {TR[lang].shopType}
              </label>
              <select
                value={form.shopType}
                onChange={e => setForm(p => ({ ...p, shopType: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
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
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                {TR[lang].ownerName} *
              </label>
              <input
                required
                value={form.ownerName}
                onChange={e => setForm(p => ({ ...p, ownerName: e.target.value }))}
                placeholder="e.g. Ramesh Sharma"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                {TR[lang].phone}
              </label>
              <input
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                type="tel"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>
                {TR[lang].password} / Secret PIN
              </label>
              <input
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
            </div>

            {/* AI tip */}
            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <p className="text-xs font-semibold flex items-center gap-2" style={{ color: "var(--primary)" }}>
                🤖 AI Tip: Fill in your shop type for smarter product recommendations & automatic category restock!
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-display font-bold text-base transition-all hover:opacity-90 active:scale-95 shadow-lg cursor-pointer"
              style={{ background: "var(--primary)", color: "#fff" }}
            >
              {TR[lang].signIn} →
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
          🔒 Your data is stored securely in local database and works offline
        </p>
      </div>
    </OnboardingShell>
  )
}
