import { useState } from "react"
import { Bill, BillItem, Lang, Product } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

export default function BillingModule({ lang }: { lang: Lang }) {
  const [products, setProducts] = useState<Product[]>(db.getProducts())
  const [cart, setCart] = useState<BillItem[]>([])
  const [search, setSearch] = useState("")
  const [customer, setCustomer] = useState("Walk-in")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentType, setPaymentType] = useState<"CASH" | "UPI" | "KHATA">("CASH")
  const [completedBill, setCompletedBill] = useState<Bill | null>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)

  function addToCart(p: Product) {
    if (p.stock <= 0) {
      alert("Product is out of stock in inventory!")
      return
    }
    setCart(prev => {
      const ex = prev.find(x => x.product.id === p.id)
      if (ex) {
        if (ex.qty >= p.stock) {
          alert(`Cannot add more than available stock (${p.stock} units)`)
          return prev
        }
        return prev.map(x => (x.product.id === p.id ? { ...x, qty: x.qty + 1 } : x))
      }
      return [...prev, { product: p, qty: 1 }]
    })
  }

  function updateQty(id: number, delta: number) {
    setCart(prev =>
      prev
        .map(x => {
          if (x.product.id === id) {
            const newQty = x.qty + delta
            if (newQty > x.product.stock) {
              alert(`Cannot exceed stock of ${x.product.stock}`)
              return x
            }
            return { ...x, qty: newQty }
          }
          return x
        })
        .filter(x => x.qty > 0)
    )
  }

  function removeFromCart(id: number) {
    setCart(prev => prev.filter(x => x.product.id !== id))
  }

  const total = cart.reduce((s, x) => s + x.product.price * x.qty, 0)
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  function handleCheckout(type: "CASH" | "UPI" | "KHATA") {
    if (cart.length === 0) {
      alert("Please add items to the cart before checkout")
      return
    }

    if (type === "KHATA" && (!customer.trim() || customer === "Walk-in")) {
      alert("Please enter a specific Customer Name for Khata (Credit) ledger!")
      return
    }

    const { bill, updatedProducts } = db.createBill({
      customer: customer.trim() || "Walk-in",
      customerPhone: customerPhone.trim(),
      items: cart,
      paymentType: type,
    })

    setProducts(updatedProducts)
    setCompletedBill(bill)
    setShowPrintModal(true)
    setCart([])
  }

  function triggerPrint() {
    window.print()
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            🧾 {TR[lang].billing} & POS
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Fast checkout with automatic stock deduction, Khata integration & printable receipts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* Product picker */}
        <div className="md:col-span-3 space-y-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search product name or scan barcode to add..."
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none border shadow-sm"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(p => {
              const isOut = p.stock <= 0
              return (
                <button
                  key={p.id}
                  disabled={isOut}
                  onClick={() => addToCart(p)}
                  className={`card-hover text-left p-3 rounded-2xl border transition-all cursor-pointer shadow-sm relative ${
                    isOut ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>
                    {p.name}
                  </p>
                  <p className="font-display font-bold text-base mt-1" style={{ color: "var(--primary)" }}>
                    ₹{p.price}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span style={{ color: "var(--muted-foreground)" }}>Stock:</span>
                    <span className={`font-mono font-semibold ${p.stock <= p.minStock ? "text-red-500" : ""}`}>
                      {p.stock} units
                    </span>
                  </div>
                  {isOut && (
                    <span className="absolute top-2 right-2 text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">
                      OUT
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bill Cart */}
        <div
          className="md:col-span-2 rounded-3xl border overflow-hidden flex flex-col shadow-lg"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          {/* Cart Header */}
          <div className="px-5 py-4 border-b space-y-2" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
            <div className="flex items-center justify-between">
              <p className="font-display font-bold text-white text-base">🛒 {TR[lang].newBill}</p>
              <span className="text-xs text-amber-300 font-mono">{cart.length} unique items</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                placeholder="Customer Name"
                className="w-full px-3 py-1.5 rounded-xl text-xs outline-none"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
              />
              <input
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="Phone (Optional)"
                className="w-full px-3 py-1.5 rounded-xl text-xs outline-none"
                style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto divide-y min-h-48 max-h-72" style={{ borderColor: "var(--border)" }}>
            {cart.length === 0 && (
              <div className="text-center py-14 space-y-2">
                <span className="text-4xl">🛍️</span>
                <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
                  Cart is empty. Tap products to add!
                </p>
              </div>
            )}
            {cart.map(x => (
              <div key={x.product.id} className="flex items-center px-5 py-3 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                    {x.product.name}
                  </p>
                  <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                    ₹{x.product.price} each
                  </p>
                </div>

                {/* Qty controller */}
                <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-2 py-0.5">
                  <button
                    onClick={() => updateQty(x.product.id, -1)}
                    className="text-sm font-bold px-1 hover:text-red-500"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs font-bold w-4 text-center">{x.qty}</span>
                  <button
                    onClick={() => updateQty(x.product.id, 1)}
                    className="text-sm font-bold px-1 hover:text-green-500"
                  >
                    +
                  </button>
                </div>

                <p className="font-bold font-mono text-sm w-14 text-right" style={{ color: "var(--foreground)" }}>
                  ₹{x.product.price * x.qty}
                </p>
                <button onClick={() => removeFromCart(x.product.id)} className="text-red-400 hover:text-red-600 text-xs ml-1">
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Cart Footer */}
          <div className="border-t p-5 space-y-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between font-display font-black text-xl">
              <span style={{ color: "var(--foreground)" }}>Grand Total</span>
              <span style={{ color: "var(--primary)" }}>₹{total.toLocaleString("en-IN")}</span>
            </div>

            {/* Payment Mode Selector */}
            <div className="grid grid-cols-3 gap-2">
              {(["CASH", "UPI", "KHATA"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setPaymentType(t)}
                  className="py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                  style={{
                    borderColor: paymentType === t ? "var(--primary)" : "var(--border)",
                    background: paymentType === t ? "rgba(245,158,11,0.15)" : "var(--muted)",
                    color: paymentType === t ? "var(--primary)" : "var(--foreground)",
                  }}
                >
                  {t === "CASH" ? "💵 Cash" : t === "UPI" ? "📱 UPI" : "💳 Khata"}
                </button>
              ))}
            </div>

            {/* Checkout Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                disabled={cart.length === 0}
                onClick={() => handleCheckout("KHATA")}
                className="py-3 rounded-2xl text-xs font-bold border transition-all hover:opacity-80 cursor-pointer disabled:opacity-40"
                style={{ borderColor: "var(--primary)", color: "var(--primary)", background: "transparent" }}
              >
                💳 Add to Khata
              </button>
              <button
                disabled={cart.length === 0}
                onClick={() => handleCheckout(paymentType === "KHATA" ? "CASH" : paymentType)}
                className="py-3 rounded-2xl text-xs font-display font-bold transition-all hover:opacity-90 shadow-md cursor-pointer disabled:opacity-40"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                ✓ Checkout & Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {showPrintModal && completedBill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up"
            style={{ background: "#FFFFFF", color: "#111827" }}
          >
            {/* Thermal Receipt Visual Container */}
            <div className="border-2 border-dashed border-gray-300 p-6 rounded-2xl space-y-3 font-mono text-xs">
              <div className="text-center space-y-1">
                <p className="font-black text-base uppercase tracking-wider">🏪 DukaanOS Store</p>
                <p className="text-[10px] text-gray-500">TAX INVOICE / CASH MEMO</p>
                <p className="text-[10px] text-gray-500">Bill ID: {completedBill.id} · {completedBill.time}</p>
                <p className="text-[10px] font-bold text-gray-700">Customer: {completedBill.customer}</p>
                <div className="border-b border-dashed border-gray-400 my-2" />
              </div>

              {/* Items List */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-gray-600">
                  <span>Item</span>
                  <span>Qty × Price</span>
                  <span>Amt</span>
                </div>
                {completedBill.itemDetails?.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[140px]">{it.product.name}</span>
                    <span>{it.qty} × ₹{it.product.price}</span>
                    <span className="font-bold">₹{it.qty * it.product.price}</span>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-gray-400 my-2" />

              <div className="flex justify-between text-sm font-black">
                <span>TOTAL AMOUNT</span>
                <span>₹{completedBill.total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-600">
                <span>Payment Mode:</span>
                <span className="font-bold">{completedBill.paymentType}</span>
              </div>
              <div className="text-center pt-2 text-[10px] text-gray-500">
                <p>🙏 Thank you for shopping with us! Visit again.</p>
                <p className="mt-1 font-sans text-emerald-600 font-bold">✓ Stock automatically updated in inventory</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-3 rounded-2xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={triggerPrint}
                className="flex-1 py-3 rounded-2xl font-bold text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                🖨️ Print Bill Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
