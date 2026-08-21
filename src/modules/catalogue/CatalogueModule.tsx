import { useState } from "react"
import { Lang, Product } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

/**
 * ============================================================================
 * MODULE: CATALOGUE / INVENTORY
 * OWNER: Person 2 (Shop Operations Specialist)
 * ============================================================================
 * TASKS FOR PERSON 2 TO IMPLEMENT:
 * 1. [ ] Add Product option: Modal / Form to insert a new product via `db.addProduct(...)`.
 * 2. [ ] Search & Filter by categories (Grocery, Dairy, Snacks, FMCG, etc.).
 * 3. [ ] Real-time stock alerts (low stock warning badges).
 * 4. [ ] Edit and Delete existing products.
 * ============================================================================
 */

export default function CatalogueModule({ lang }: { lang: Lang }) {
  const [products] = useState<Product[]>(db.getProducts())

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            📦 {TR[lang].catalogue} / Inventory
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Assigned to: <strong>Person 2 (Shop Operations)</strong>
          </p>
        </div>
        <button
          onClick={() => alert("TODO: Person 2 to implement Add Product modal!")}
          className="px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all hover:opacity-90 cursor-pointer"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          + {TR[lang].addProduct} (TODO: Person 2)
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
          <li>⏳ <strong>Task 1:</strong> Enable <strong>Add Product Option</strong> (Name, Price, Category, Stock, Expiry, Barcode).</li>
          <li>⏳ <strong>Task 2:</strong> Build live Search bar & Category filter buttons.</li>
          <li>⏳ <strong>Task 3:</strong> Add Low Stock badges & Expiry warnings.</li>
        </ul>
      </div>

      {/* Basic Catalogue Preview List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(p => (
          <div
            key={p.id}
            className="rounded-2xl border p-4 shadow-sm space-y-2"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{p.name}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{p.category}</p>
              </div>
              <p className="font-display font-bold text-base" style={{ color: "var(--primary)" }}>₹{p.price}</p>
            </div>
            <div className="flex justify-between text-xs pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <span style={{ color: "var(--muted-foreground)" }}>Stock: {p.stock} units</span>
              <span style={{ color: "var(--muted-foreground)" }}>Barcode: {p.barcode.slice(-6)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
