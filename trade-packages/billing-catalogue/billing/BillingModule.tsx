import { useState, useEffect } from "react"
import { Bill, BillItem, Lang, Product, ShopInfo } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"
import ThermalReceipt from "./ThermalReceipt"
import ScanBillModal from "./ScanBillModal"
import BillHistoryModal from "./BillHistoryModal"

export default function BillingModule({ lang }: { lang: Lang }) {
  const [products, setProducts] = useState<Product[]>(() => db.getProducts())
  const [cart, setCart] = useState<BillItem[]>([])
  const [search, setSearch] = useState("")
  const [customer, setCustomer] = useState("Walk-in")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentType, setPaymentType] = useState<"CASH" | "UPI" | "KHATA">("CASH")
  const [completedBill, setCompletedBill] = useState<Bill | null>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [recentBills, setRecentBills] = useState<Bill[]>(() => db.getBills())
  const [shopInfo] = useState<ShopInfo>(() => db.getShopInfo())
  const [stockAlert, setStockAlert] = useState<string | null>(null)


  // Reload products whenever storage changes or module mounts
  useEffect(() => {
    setProducts(db.getProducts())
    setRecentBills(db.getBills())
  }, [])

  function triggerStockAlert(msg: string) {
    setStockAlert(msg)
    setTimeout(() => setStockAlert(null), 3500)
  }

  function addToCart(p: Product) {
    if (p.stock <= 0) {
      triggerStockAlert(`⚠️ "${p.name}" is OUT OF STOCK!`)
      return
    }

    setCart(prev => {
      const ex = prev.find(x => x.product.id === p.id)
      if (ex) {
        if (ex.qty >= p.stock) {
          triggerStockAlert(`⚠️ Cannot add more. Only ${p.stock} units in stock for "${p.name}".`)
          return prev
        }
        return prev.map(x => (x.product.id === p.id ? { ...x, qty: x.qty + 1 } : x))
      }
      return [...prev, { product: p, qty: 1 }]
    })
  }

  function handleImportScannedItems(items: { product: Product; qty: number }[]) {
    let addedCount = 0
    setCart(prev => {
      let updated = [...prev]
      items.forEach(newItem => {
        const exIdx = updated.findIndex(x => x.product.id === newItem.product.id)
        if (exIdx >= 0) {
          const newQty = Math.min(updated[exIdx].product.stock, updated[exIdx].qty + newItem.qty)
          updated[exIdx] = { ...updated[exIdx], qty: newQty }
        } else {
          updated.push({
            product: newItem.product,
            qty: Math.min(newItem.product.stock, newItem.qty),
          })
        }
        addedCount += newItem.qty
      })
      return updated
    })
    triggerStockAlert(`🎉 Successfully imported ${items.length} items from scanned bill!`)
  }

  function handleBarcodeSearch(query: string) {
    setSearch(query)
    const trimmed = query.trim()
    if (!trimmed) return

    // Exact barcode match -> auto add to cart
    const barcodeMatch = products.find(p => p.barcode === trimmed)
    if (barcodeMatch) {
      addToCart(barcodeMatch)
      setSearch("") // Clear input for next barcode scan
    }
  }

  function updateQty(id: number, delta: number) {
    setCart(prev =>
      prev
        .map(x => {
          if (x.product.id === id) {
            const newQty = x.qty + delta
            if (newQty > x.product.stock) {
              triggerStockAlert(`⚠️ Cannot exceed available inventory of ${x.product.stock} units!`)
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
  const filtered = products.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  )

  function handleCheckout(type: "CASH" | "UPI" | "KHATA") {
    if (cart.length === 0) {
      triggerStockAlert("⚠️ Please add items to the cart before checkout!")
      return
    }

    // Validate that stock hasn't changed underneath
    for (const item of cart) {
      const currentProd = db.getProducts().find(p => p.id === item.product.id)
      if (!currentProd || currentProd.stock < item.qty) {
        triggerStockAlert(`⚠️ Stock changed for "${item.product.name}". Available: ${currentProd?.stock ?? 0}`)
        setProducts(db.getProducts())
        return
      }
    }

    if (type === "KHATA" && (!customer.trim() || customer.trim() === "Walk-in")) {
      triggerStockAlert("⚠️ Please provide Customer Name for Khata (Credit) ledger entry!")
      return
    }

    // Automatically deduct stock and create bill
    const { bill, updatedProducts } = db.createBill({
      customer: customer.trim() || "Walk-in",
      customerPhone: customerPhone.trim(),
      items: cart,
      paymentType: type,
    })

    setProducts(updatedProducts)
    setRecentBills(db.getBills())
    setCompletedBill(bill)
    setShowPrintModal(true)
    setCart([])
    setCustomer("Walk-in")
    setCustomerPhone("")
  }

  function openReceipt(b: Bill) {
    setCompletedBill(b)
    setShowPrintModal(true)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Stock Alert Toast */}
      {stockAlert && (
        <div className="fixed top-20 right-5 z-50 bg-neutral-900 text-amber-400 border border-amber-500/50 shadow-2xl px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 slide-up">
          <span>{stockAlert}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            🧾 {TR[lang].billing} & POS
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Fast checkout with real-time stock deduction, barcode lookup & printable bills
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScanModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer bg-gradient-to-r from-amber-500 to-orange-500 text-white"
          >
            📸 Scan Bill / Slip
          </button>
          <span className="text-xs px-3 py-1.5 rounded-xl border font-mono font-bold" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
            📦 {products.reduce((acc, p) => acc + p.stock, 0)} in stock
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* Product picker & quick scanner */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={e => handleBarcodeSearch(e.target.value)}
                placeholder="🔍 Search product, category, or scan barcode..."
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none border shadow-sm pl-10"
                style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
              <span className="absolute left-3.5 top-3.5 text-sm opacity-60">🏷️</span>
            </div>
            <button
              onClick={() => setShowScanModal(true)}
              className="px-4 py-3 rounded-2xl border text-xs font-bold flex items-center gap-1.5 hover:border-amber-500 transition-all cursor-pointer shrink-0 shadow-sm"
              style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
              title="Scan physical bill or customer chit"
            >
              📸 Scan Bill
            </button>
          </div>


          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(p => {
              const isOut = p.stock <= 0
              const isLow = p.stock > 0 && p.stock <= p.minStock
              const inCartQty = cart.find(x => x.product.id === p.id)?.qty || 0

              return (
                <button
                  key={p.id}
                  disabled={isOut}
                  onClick={() => addToCart(p)}
                  className={`card-hover text-left p-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm relative ${
                    isOut ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                  style={{ background: "var(--card)", borderColor: inCartQty > 0 ? "var(--primary)" : "var(--border)" }}
                >
                  {inCartQty > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 text-white font-mono text-xs font-bold flex items-center justify-center shadow-md">
                      {inCartQty}
                    </span>
                  )}
                  <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>
                    {p.name}
                  </p>
                  <p className="font-display font-bold text-base mt-1" style={{ color: "var(--primary)" }}>
                    ₹{p.price}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span style={{ color: "var(--muted-foreground)" }}>Stock:</span>
                    <span className={`font-mono font-bold ${isOut ? "text-red-600" : isLow ? "text-amber-500" : "text-emerald-500"}`}>
                      {p.stock} units
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between items-center text-[10px] text-gray-400 font-mono">
                    <span>{p.category}</span>
                    <span>{p.barcode.slice(-4)}</span>
                  </div>
                  {isOut && (
                    <span className="absolute top-2 right-2 text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">
                      OUT OF STOCK
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
              <span className="text-xs text-amber-300 font-mono">{cart.length} items ({cart.reduce((a, b) => a + b.qty, 0)} pcs)</span>
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
                  Cart is empty. Tap products or scan barcode to add!
                </p>
              </div>
            )}
            {cart.map(x => (
              <div key={x.product.id} className="flex items-center px-4 py-3 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>
                    {x.product.name}
                  </p>
                  <p className="text-[10px] font-mono text-gray-500">
                    ₹{x.product.price} each · Stock left: {x.product.stock - x.qty}
                  </p>
                </div>

                {/* Qty controller */}
                <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg px-2 py-0.5 border" style={{ borderColor: "var(--border)" }}>
                  <button
                    onClick={() => updateQty(x.product.id, -1)}
                    className="text-xs font-bold px-1 hover:text-red-500 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-mono text-xs font-bold w-4 text-center">{x.qty}</span>
                  <button
                    onClick={() => updateQty(x.product.id, 1)}
                    className="text-xs font-bold px-1 hover:text-green-500 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <p className="font-bold font-mono text-xs w-14 text-right" style={{ color: "var(--foreground)" }}>
                  ₹{x.product.price * x.qty}
                </p>
                <button
                  onClick={() => removeFromCart(x.product.id)}
                  className="text-red-400 hover:text-red-600 text-xs ml-1 cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Cart Footer */}
          <div className="border-t p-4 space-y-3" style={{ borderColor: "var(--border)" }}>
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

      {/* Recent Bills & Re-Print Table */}
      <div className="rounded-3xl border p-5 space-y-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>
              🕒 Recent Invoices & Print Bill
            </h3>
            <span className="text-xs text-gray-500 font-mono">{recentBills.length} recorded bills in store</span>
          </div>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-amber-500 hover:text-white hover:border-amber-500 cursor-pointer shadow-xs flex items-center gap-1.5"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--muted)" }}
          >
            📜 View Detailed History ({recentBills.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                <th className="py-2.5 font-bold">Invoice ID</th>
                <th className="py-2.5 font-bold">Customer</th>
                <th className="py-2.5 font-bold">Time</th>
                <th className="py-2.5 font-bold">Payment</th>
                <th className="py-2.5 font-bold text-right">Total</th>
                <th className="py-2.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
              {recentBills.slice(0, 5).map(b => (
                <tr key={b.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-2.5 font-mono font-bold text-amber-500">{b.id}</td>
                  <td className="py-2.5 font-medium">{b.customer}</td>
                  <td className="py-2.5 text-gray-500 font-mono">{b.time}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.paid ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                    }`}>
                      {b.paymentType || (b.paid ? "CASH" : "KHATA")}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono font-bold text-right">₹{b.total.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => openReceipt(b)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all hover:bg-amber-500 hover:text-white cursor-pointer"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      🖨️ Print Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Thermal Receipt Modal */}
      {showPrintModal && completedBill && (
        <ThermalReceipt
          bill={completedBill}
          shopInfo={shopInfo}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* AI Scan Bill & Slip Modal */}
      {showScanModal && (
        <ScanBillModal
          availableProducts={products}
          onClose={() => setShowScanModal(false)}
          onAddItemsToCart={handleImportScannedItems}
        />
      )}

      {/* Detailed Bill History Modal */}
      {showHistoryModal && (
        <BillHistoryModal
          bills={recentBills}
          onClose={() => setShowHistoryModal(false)}
          onPrintBill={bill => {
            setShowHistoryModal(false)
            openReceipt(bill)
          }}
          onDeleteBill={billId => {
            const updated = db.deleteBill(billId)
            setRecentBills(updated)
            triggerStockAlert(`🗑️ Invoice ${billId} has been deleted.`)
          }}
        />
      )}
    </div>
  )
}



