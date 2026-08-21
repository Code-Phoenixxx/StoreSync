import { useState } from "react"
import { Lang, Product } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

/**
 * ============================================================================
 * MODULE: BILLING & POS
 * OWNER: Person 2 (Shop Operations Specialist)
 * ============================================================================
 * TASKS FOR PERSON 2 TO IMPLEMENT:
 * 1. [ ] Product search & barcode picker to add items to cart.
 * 2. [ ] Cart state management (increment, decrement, remove, total calculation).
 * 3. [ ] Print Bill Option: Create clean thermal/standard invoice modal with window.print().
 * 4. [ ] Khata Option in Billing: Allow choosing Khata as payment mode and linking customer.
 * 5. [ ] Auto Inventory Deduction: Call `db.deductStock(...)` or `db.createBill(...)` on checkout.
 * ============================================================================
 */

export default function BillingModule({ lang }: { lang: Lang }) {
  const [products] = useState<Product[]>(db.getProducts())
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([])
  const [customerName, setCustomerName] = useState("")

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            🧾 {TR[lang].billing} & POS
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Assigned to: <strong>Person 2 (Shop Operations)</strong>
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
          Under Construction by Person 2
        </span>
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
          <li>⏳ <strong>Task 1:</strong> Build POS cart & quick item lookup from <code>products</code>.</li>
          <li>⏳ <strong>Task 2:</strong> Implement <strong>Print Bill Option</strong> (thermal receipt dialog with <code>window.print()</code>).</li>
          <li>⏳ <strong>Task 3:</strong> Implement <strong>Khata Option</strong> (save credit bill linked to customer name).</li>
          <li>⏳ <strong>Task 4:</strong> Automatically deduct sold stock from inventory on checkout.</li>
        </ul>
      </div>

      {/* Starter Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Product Selector Placeholder */}
        <div className="md:col-span-2 rounded-2xl border p-6 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <h4 className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>
            1. Select Products
          </h4>
          <input
            placeholder="Search catalogue or scan barcode..."
            className="w-full px-4 py-2.5 rounded-xl text-sm border outline-none"
            style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.slice(0, 6).map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setCart(prev => [...prev, { product: p, qty: 1 }])
                }}
                className="p-3 rounded-xl border text-left transition-all hover:border-amber-500 cursor-pointer"
                style={{ background: "var(--muted)", borderColor: "var(--border)" }}
              >
                <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>{p.name}</p>
                <p className="text-sm font-bold mt-1" style={{ color: "var(--primary)" }}>₹{p.price}</p>
                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Stock: {p.stock}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Cart & Checkout Starter */}
        <div className="rounded-2xl border p-6 space-y-4 flex flex-col justify-between" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div>
            <h4 className="font-display font-bold text-base mb-3" style={{ color: "var(--foreground)" }}>
              2. Cart & Customer
            </h4>
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Customer Name (for Khata/Bill)"
              className="w-full px-3 py-2 rounded-xl text-xs border outline-none mb-3"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
            <div className="text-xs min-h-32 space-y-2">
              {cart.length === 0 ? (
                <p className="text-center py-8" style={{ color: "var(--muted-foreground)" }}>
                  Cart is empty. Tap items on left to test.
                </p>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b pb-1">
                    <span>{item.product.name}</span>
                    <span className="font-bold">₹{item.product.price}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => alert("TODO: Person 2 to implement full Print Bill popup & receipt layout!")}
              className="w-full py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all hover:opacity-90"
              style={{ background: "var(--primary)", color: "#fff" }}
            >
              🖨️ Print Bill (TODO: Person 2)
            </button>
            <button
              onClick={() => alert("TODO: Person 2 to implement Khata Credit ledger checkout!")}
              className="w-full py-2.5 rounded-xl text-xs font-bold border cursor-pointer"
              style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
            >
              💳 Khata Option (TODO: Person 2)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
