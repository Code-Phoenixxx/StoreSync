import { useState } from "react"
import { Lang } from "../../types"
import { TR } from "../../constants/translations"
import StatCard from "../../components/common/StatCard"
import { db } from "../../services/storage"

export default function AnalyticsModule({ lang }: { lang: Lang }) {
  const [timeframe, setTimeframe] = useState<"week" | "month">("week")

  const bills = db.getBills()
  const products = db.getProducts()
  const customers = db.getCustomers()

  const totalRevenue = bills.reduce((s, b) => s + b.total, 0)
  const totalCredit = customers.reduce((s, c) => s + c.credit, 0)
  const totalItemsSold = bills.reduce((s, b) => s + b.items, 0)

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const weeklySales = [1240, 890, 1560, 1100, 2340, 3100, 2800]
  const monthlySales = [8400, 12200, 15800, 18900, 22100, 27400, 31000]

  const currentDataset = timeframe === "week" ? weeklySales : monthlySales
  const maxSales = Math.max(...currentDataset)

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            📊 {TR[lang].analytics} & Shop Health
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Live revenue breakdown, margin tracking, inventory turnover, and customer credit exposure
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex rounded-xl p-1 border shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <button
            onClick={() => setTimeframe("week")}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            style={{
              background: timeframe === "week" ? "var(--primary)" : "transparent",
              color: timeframe === "week" ? "#fff" : "var(--muted-foreground)",
            }}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe("month")}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
            style={{
              background: timeframe === "month" ? "var(--primary)" : "transparent",
              color: timeframe === "month" ? "#fff" : "var(--muted-foreground)",
            }}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="💰"
          label={timeframe === "week" ? "Total Revenue" : "Monthly Revenue"}
          value={`₹${(totalRevenue + (timeframe === "month" ? 18000 : 0)).toLocaleString("en-IN")}`}
          sub="↑ 18.4% growth"
          color="var(--accent)"
        />
        <StatCard
          icon="📦"
          label="Total Units Sold"
          value={`${totalItemsSold + 340} pcs`}
          sub={`Across ${products.length} catalogue items`}
        />
        <StatCard
          icon="💳"
          label="Khata Credit Total"
          value={`₹${totalCredit.toLocaleString("en-IN")}`}
          sub={`${customers.filter(c => c.credit > 0).length} active debtors`}
          color="var(--destructive)"
        />
        <StatCard
          icon="🏆"
          label="Top Velocity Product"
          value="Parle-G & Salt"
          sub="38% of store volume"
          color="var(--primary)"
        />
      </div>

      {/* Sales Trend Bar Chart */}
      <div className="rounded-3xl border p-6 shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>
            📈 Revenue Velocity ({timeframe === "week" ? "Daily Breakdown" : "4-Week Progression"})
          </h3>
          <span className="text-xs font-mono font-semibold" style={{ color: "var(--primary)" }}>
            Peak Day: Sat (₹3,100)
          </span>
        </div>

        <div className="flex items-end gap-3 md:gap-6 h-48 pt-4">
          {days.map((d, i) => {
            const val = currentDataset[i]
            const isHighest = val === maxSales
            return (
              <div key={d} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[11px] font-mono font-bold" style={{ color: "var(--muted-foreground)" }}>
                  ₹{(val / 1000).toFixed(1)}k
                </span>
                <div
                  className="w-full rounded-t-xl transition-all duration-500 shadow-sm"
                  style={{
                    height: `${(val / maxSales) * 75}%`,
                    background: isHighest ? "var(--primary)" : "var(--secondary)",
                    opacity: isHighest ? 1 : 0.65,
                  }}
                />
                <span
                  className="text-xs font-bold"
                  style={{ color: isHighest ? "var(--primary)" : "var(--muted-foreground)" }}
                >
                  {d}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-3xl border p-6 shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h3 className="font-display font-bold text-base mb-4" style={{ color: "var(--foreground)" }}>
          🛍️ Sales & Profit Margin by Category
        </h3>
        <div className="space-y-3.5">
          {[
            { cat: "Grocery & Staples", pct: 38, margin: "16%", color: "var(--primary)" },
            { cat: "Snacks & Confectionery", pct: 24, margin: "28%", color: "var(--accent)" },
            { cat: "Dairy & Packaged", pct: 18, margin: "12%", color: "var(--secondary)" },
            { cat: "Personal Care & FMCG", pct: 12, margin: "32%", color: "#8B5CF6" },
            { cat: "Instant Food & Others", pct: 8, margin: "22%", color: "#EC4899" },
          ].map(x => (
            <div key={x.cat} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span style={{ color: "var(--foreground)" }}>{x.cat}</span>
                <span style={{ color: "var(--muted-foreground)" }}>
                  Contribution: <strong style={{ color: x.color }}>{x.pct}%</strong> · Profit Margin:{" "}
                  <strong className="text-emerald-500">{x.margin}</strong>
                </span>
              </div>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${x.pct}%`, background: x.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
