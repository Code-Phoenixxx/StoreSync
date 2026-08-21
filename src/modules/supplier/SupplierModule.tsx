import { useState } from "react"
import { Lang, Supplier } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

/**
 * ============================================================================
 * MODULE: SUPPLIER MANAGEMENT
 * OWNER: Person 2 (Shop Operations Specialist)
 * ============================================================================
 * TASKS FOR PERSON 2 TO IMPLEMENT:
 * 1. [ ] Enable "Add Supplier" option (Name, Category, Phone, Email, Rating).
 * 2. [ ] Enable "Edit Existing Supplier" details.
 * 3. [ ] Enable "Delete Existing Supplier" option.
 * 4. [ ] Smart Restock: Generate purchase order for low-stock items.
 * ============================================================================
 */

export default function SupplierModule({ lang }: { lang: Lang }) {
  const [suppliers] = useState<Supplier[]>(db.getSuppliers())

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            🛒 {TR[lang].supplier} Directory
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Assigned to: <strong>Person 2 (Shop Operations)</strong>
          </p>
        </div>
        <button
          onClick={() => alert("TODO: Person 2 to implement Add Supplier modal!")}
          className="px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all hover:opacity-90 cursor-pointer"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          + Add Supplier (TODO: Person 2)
        </button>
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
          <li>⏳ <strong>Task 1:</strong> Implement <strong>Add Supplier</strong> form/modal with <code>db.addSupplier(...)</code>.</li>
          <li>⏳ <strong>Task 2:</strong> Implement <strong>Edit Existing Supplier</strong> with <code>db.updateSupplier(...)</code>.</li>
          <li>⏳ <strong>Task 3:</strong> Implement <strong>Delete Existing Supplier</strong> with <code>db.deleteSupplier(...)</code>.</li>
          <li>⏳ <strong>Task 4:</strong> Build <strong>Smart Restock</strong> order generator.</li>
        </ul>
      </div>

      {/* Basic Suppliers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {suppliers.map(s => (
          <div
            key={s.id}
            className="rounded-2xl border p-5 space-y-3 shadow-sm"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold font-display" style={{ color: "var(--foreground)" }}>{s.name}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Category: {s.category}</p>
              </div>
              <span className="text-xs font-semibold">⭐ {s.rating}</span>
            </div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>📞 {s.contact} · Last PO: {s.lastOrder}</p>
            <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => alert(`TODO: Person 2 to implement Edit Supplier for ${s.name}`)}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                style={{ borderColor: "var(--border)" }}
              >
                ✏️ Edit (TODO)
              </button>
              <button
                onClick={() => alert(`TODO: Person 2 to implement Delete Supplier for ${s.name}`)}
                className="flex-1 py-1.5 rounded-lg text-xs font-bold text-red-500 border border-red-200 dark:border-red-900 cursor-pointer"
              >
                🗑️ Delete (TODO)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
