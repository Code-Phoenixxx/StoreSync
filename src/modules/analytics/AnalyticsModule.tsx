import { useState } from "react"
import { Lang } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"
import StatCard from "../../components/common/StatCard"

/**
 * ============================================================================
 * MODULE: ANALYTICS & INSIGHTS
 * OWNER: Person 3 (AI & Smart Systems Specialist)
 * ============================================================================
 * TASKS FOR PERSON 3 TO IMPLEMENT:
 * 1. [ ] Make analytics completely functionable from live `db.getBills()` and `db.getProducts()`.
 * 2. [ ] Render interactive sales revenue trends (Daily / Weekly / Monthly).
 * 3. [ ] Calculate category margins & top-selling products.
 * ============================================================================
 */

export default function AnalyticsModule({ lang }: { lang: Lang }) {
  const bills = db.getBills()
  const totalRevenue = bills.reduce((s, b) => s + b.total, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            📊 {TR[lang].analytics} & Reports
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Assigned to: <strong>Person 3 (AI & Smart Systems Specialist)</strong>
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
          Under Construction by Person 3
        </span>
      </div>

      {/* Developer Tasks Checklist Card */}
      <div
        className="rounded-2xl border p-5 space-y-3"
        style={{ background: "rgba(245,158,11,0.06)", borderColor: "var(--border)" }}
      >
        <h3 className="font-display font-bold text-sm" style={{ color: "var(--primary)" }}>
          🛠️ Person 3 Implementation Checklist:
        </h3>
        <ul className="text-xs space-y-2 font-medium" style={{ color: "var(--foreground)" }}>
          <li>⏳ <strong>Task 1:</strong> Make <strong>Analytics Functionable</strong> from live DB bills & inventory data.</li>
          <li>⏳ <strong>Task 2:</strong> Build <strong>Sales Revenue Trend Chart</strong> (bar chart / line graph).</li>
          <li>⏳ <strong>Task 3:</strong> Build <strong>Category Profit Margin & Top Selling Items</strong> breakdown.</li>
        </ul>
      </div>

      {/* Basic Metrics Preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="💰" label="Total Revenue (Live)" value={`₹${totalRevenue.toLocaleString("en-IN")}`} sub={`${bills.length} bills recorded`} color="var(--accent)" />
        <StatCard icon="📦" label="Total Items Sold" value="TODO (Person 3)" sub="Calculate from items" />
        <StatCard icon="📈" label="Gross Profit" value="TODO (Person 3)" sub="Calculate margins" />
        <StatCard icon="🏆" label="Top Product" value="TODO (Person 3)" sub="Velocity analysis" />
      </div>

      {/* Chart Skeleton Box */}
      <div className="rounded-3xl border p-8 text-center space-y-3 shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <p className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
          📈 Sales Velocity Trend Graph
        </p>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          (TODO: Person 3 to render dynamic SVG / Tailwind bars based on live weekly revenue)
        </p>
      </div>
    </div>
  )
}
