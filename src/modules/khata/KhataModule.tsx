import { useState } from "react"
import { Customer, Lang } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

/**
 * ============================================================================
 * MODULE: KHATA / CREDIT LEDGER
 * OWNER: Person 2 (Shop Operations Specialist)
 * ============================================================================
 * TASKS FOR PERSON 2 TO IMPLEMENT:
 * 1. [ ] Customer credit book listing & total credit calculation.
 * 2. [ ] Settle / record payment modal using `db.recordPayment(...)`.
 * 3. [ ] Send WhatsApp / SMS payment reminder action.
 * 4. [ ] Add new customer khata entry option.
 * ============================================================================
 */

export default function KhataModule({ lang }: { lang: Lang }) {
  const [customers] = useState<Customer[]>(db.getCustomers())
  const total = customers.reduce((s, c) => s + c.credit, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            💳 {TR[lang].khata} / Credit Ledger
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Assigned to: <strong>Person 2 (Shop Operations)</strong>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{TR[lang].totalCredit}</p>
          <p className="font-display font-black text-xl text-red-500">₹{total.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Developer Tasks Checklist Card */}
      <div
        className="rounded-2xl border p-5 space-y-3"
        style={{ background: "rgba(245,158,11,0.06)", borderColor: "var(--border)" }}
      >
        <h3 className="font-display font-bold text-sm" style={{ color: "var(--primary)" }}>
          🛠️ Person 2 Implementation Checklist:
        </h3>
        <ul className="text-xs space-y-2 font-medium" style={{ color: "var(--foreground)" }}>
          <li>⏳ <strong>Task 1:</strong> Build <strong>Settle Payment Dialog</strong> to reduce customer credit.</li>
          <li>⏳ <strong>Task 2:</strong> Add <strong>Send Reminder</strong> button (WhatsApp/SMS link).</li>
          <li>⏳ <strong>Task 3:</strong> Build <strong>Add New Customer Credit Entry</strong> form.</li>
        </ul>
      </div>

      {/* Basic Customers List */}
      <div className="space-y-3">
        {customers.map(c => (
          <div
            key={c.id}
            className="rounded-2xl border p-4 flex items-center justify-between shadow-sm"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{c.name}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>📞 {c.phone} · Last Visit: {c.lastVisit}</p>
            </div>
            <div className="text-right flex items-center gap-3">
              <span className="font-mono font-bold text-red-500">₹{c.credit}</span>
              <button
                onClick={() => alert(`TODO: Person 2 to implement Settle Payment / Remind for ${c.name}`)}
                className="text-xs px-3 py-1.5 rounded-xl font-semibold border cursor-pointer hover:bg-amber-500 hover:text-white transition-all"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
              >
                Action (TODO)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
