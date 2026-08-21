import { Lang, ShopInfo } from "../../types"
import { TR, AI_SUGGESTIONS } from "../../constants/translations"
import StatCard from "../../components/common/StatCard"
import HealthScoreRing from "../../components/common/HealthScoreRing"
import { db } from "../../services/storage"

export default function DashboardModule({
  lang,
  shopInfo,
  onNavigate,
}: {
  lang: Lang
  shopInfo: ShopInfo
  onNavigate?: (module: string) => void
}) {
  const products = db.getProducts()
  const bills = db.getBills()
  const lowStock = products.filter(p => p.stock <= p.minStock)
  const todaySales = bills.reduce((s, b) => s + b.total, 0)

  function getGreeting(l: Lang): string {
    const h = new Date().getHours()
    if (h < 12) return TR[l].goodMorning
    if (h < 17) return TR[l].goodAfternoon
    return TR[l].goodEvening
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome header */}
      <div className="rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl" style={{ background: "var(--secondary)" }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: "radial-gradient(circle at 80% 50%, var(--primary), transparent)" }}
        />
        <div className="relative">
          <p className="text-sm font-semibold mb-1" style={{ color: "#FDE68A" }}>
            {getGreeting(lang)}
          </p>
          <h2 className="font-display font-black text-2xl md:text-3xl mb-1" style={{ color: "#fff" }}>
            {shopInfo.ownerName}
          </h2>
          <p className="text-sm opacity-80" style={{ color: "#fff" }}>
            🏪 {shopInfo.shopName} · {shopInfo.shopType || "Retail"} ·{" "}
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="💰"
          label={TR[lang].totalSales}
          value={`₹${todaySales.toLocaleString("en-IN")}`}
          sub="↑ 12% vs yesterday"
          color="var(--accent)"
        />
        <StatCard icon="📈" label={TR[lang].profit} value={`₹${Math.round(todaySales * 0.22).toLocaleString("en-IN")}`} sub="↑ 22% margin" />
        <StatCard icon="👥" label={TR[lang].customers} value={`${bills.length + 8}`} sub="Today's visitors" />
        <StatCard
          icon="⚠️"
          label={TR[lang].stockAlert}
          value={`${lowStock.length} items`}
          sub="Need reorder"
          color="var(--destructive)"
        />
      </div>

      {/* Health score + AI suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HealthScoreRing score={Math.max(40, 100 - lowStock.length * 8)} lang={lang} />

        {/* AI Suggestions */}
        <div
          className="md:col-span-2 rounded-2xl p-5 border shadow-sm"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🤖</span>
            <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>
              {TR[lang].aiSuggestions}
            </h3>
            <span
              className="ml-auto text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold"
              style={{ background: "rgba(245,158,11,0.15)", color: "var(--primary)" }}
            >
              {AI_SUGGESTIONS.length} insights
            </span>
          </div>
          <div className="space-y-3">
            {AI_SUGGESTIONS.slice(0, 3).map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl transition-all"
                style={{
                  background:
                    s.priority === "high"
                      ? "rgba(239,68,68,0.08)"
                      : s.priority === "medium"
                      ? "rgba(245,158,11,0.08)"
                      : "var(--muted)",
                }}
              >
                <span className="text-xl shrink-0">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>
                    {s.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {s.desc}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    s.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : s.priority === "medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {s.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bills + low stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent bills */}
        <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>
              🧾 Recent Bills
            </h3>
            <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
              Live
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {bills.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center px-5 py-3 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                    {b.customer}
                  </p>
                  <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                    {b.id} · {b.time}
                  </p>
                </div>
                <p className="font-bold font-mono text-sm" style={{ color: "var(--foreground)" }}>
                  ₹{b.total}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    b.paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {b.paid ? "Paid" : "Khata"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>
              📦 Low Stock Alert
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
              {lowStock.length} items
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {lowStock.length === 0 && (
              <p className="text-center py-6 text-xs text-green-600 font-medium">✅ All stock levels healthy!</p>
            )}
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center px-5 py-3 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                    {p.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    {p.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-red-500">{p.stock} left</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    min: {p.minStock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
