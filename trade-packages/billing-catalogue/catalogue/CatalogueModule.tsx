import { useState, useEffect } from "react"
import { Lang, Product } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

// Helper to generate a random 13-digit EAN barcode
function generateEAN13() {
  const prefix = "890" // India GS1 Country code prefix
  let code = prefix
  for (let i = 0; i < 9; i++) {
    code += Math.floor(Math.random() * 10)
  }
  // Calculate checksum digit
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3)
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return code + checkDigit
}

// Visual SVG Barcode Component
function BarcodeSVG({ code }: { code: string }) {
  // Generate deterministic bar widths based on code
  const bars = []
  let x = 8
  const cleanCode = code || "8901234567890"

  for (let i = 0; i < cleanCode.length; i++) {
    const digit = parseInt(cleanCode[i]) || 3
    const width = (digit % 3) + 1
    const isBar = i % 2 === 0 || digit > 4
    if (isBar) {
      bars.push(<rect key={i} x={x} y={4} width={width * 1.5} height={24} fill="currentColor" />)
    }
    x += width * 2 + 1.5
  }

  return (
    <div className="flex flex-col items-center select-none">
      <svg className="w-28 h-7 text-neutral-800 dark:text-neutral-200 overflow-hidden" viewBox={`0 0 ${Math.max(x + 10, 90)} 32`}>
        {bars}
      </svg>
      <span className="font-mono text-[9px] tracking-widest opacity-80 mt-0.5">{cleanCode}</span>
    </div>
  )
}

export default function CatalogueModule({ lang }: { lang: Lang }) {
  const [products, setProducts] = useState<Product[]>(() => db.getProducts())
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [barcodeCopied, setBarcodeCopied] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    name: "",
    category: "Grocery",
    price: "",
    costPrice: "",
    stock: "",
    minStock: "5",
    expiry: "2027-01-01",
    barcode: "",
  })

  useEffect(() => {
    setProducts(db.getProducts())
  }, [])

  const cats = ["All", ...Array.from(new Set(products.map(p => p.category)))]
  const filtered = products.filter(
    p =>
      (catFilter === "All" || p.category === catFilter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()))
  )

  function openAddModal() {
    setEditingProduct(null)
    setForm({
      name: "",
      category: "Grocery",
      price: "",
      costPrice: "",
      stock: "",
      minStock: "5",
      expiry: "2027-01-01",
      barcode: generateEAN13(),
    })
    setIsModalOpen(true)
  }

  function openEditModal(p: Product) {
    setEditingProduct(p)
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      costPrice: String(p.costPrice || Math.round(p.price * 0.8)),
      stock: String(p.stock),
      minStock: String(p.minStock),
      expiry: p.expiry,
      barcode: p.barcode,
    })
    setIsModalOpen(true)
  }

  function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.price) return

    const finalBarcode = form.barcode.trim() || generateEAN13()
    const priceNum = Number(form.price)
    const costPriceNum = Number(form.costPrice) || Math.round(priceNum * 0.8)
    const stockNum = Number(form.stock) || 0
    const minStockNum = Number(form.minStock) || 5

    if (editingProduct) {
      // Edit existing product
      const updated = db.updateProduct(editingProduct.id, {
        name: form.name.trim(),
        category: form.category,
        price: priceNum,
        costPrice: costPriceNum,
        stock: stockNum,
        minStock: minStockNum,
        expiry: form.expiry || "2027-12-31",
        barcode: finalBarcode,
      })
      setProducts(updated)
    } else {
      // Add new product
      const newProd = db.addProduct({
        name: form.name.trim(),
        category: form.category,
        price: priceNum,
        costPrice: costPriceNum,
        stock: stockNum,
        minStock: minStockNum,
        expiry: form.expiry || "2027-12-31",
        barcode: finalBarcode,
      })
      setProducts([newProd, ...products])
    }

    setIsModalOpen(false)
  }

  function confirmDeleteProduct() {
    if (deletingProduct) {
      const updated = db.deleteProduct(deletingProduct.id)
      setProducts(updated)
      setDeletingProduct(null)
    }
  }

  function handleCopyBarcode(code: string) {
    navigator.clipboard.writeText(code)
    setBarcodeCopied(code)
    setTimeout(() => setBarcodeCopied(null), 2000)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            📦 {TR[lang].catalogue} & Barcodes
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Manage pricing, stock alerts, EAN-13 barcodes, and product catalogue ({products.length} items)
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          + {TR[lang].addProduct}
        </button>
      </div>

      {/* Search + Barcode scanner simulator + Category filter */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex-1 min-w-56 relative">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search product name or scan barcode..."
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border shadow-sm pl-10"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <span className="absolute left-3.5 top-2.5 text-sm opacity-60">📷</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
              style={{
                background: catFilter === c ? "var(--primary)" : "var(--card)",
                color: catFilter === c ? "#fff" : "var(--foreground)",
                border: `1px solid ${catFilter === c ? "transparent" : "var(--border)"}`,
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => {
          const isOut = p.stock <= 0
          const isLow = p.stock > 0 && p.stock <= p.minStock
          const daysToExpiry = Math.round((new Date(p.expiry).getTime() - Date.now()) / 86400000)

          return (
            <div
              key={p.id}
              className="card-hover rounded-2xl border overflow-hidden shadow-sm flex flex-col justify-between"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div
                className="h-2"
                style={{
                  background: isOut
                    ? "var(--destructive)"
                    : isLow
                    ? "var(--primary)"
                    : "var(--accent)",
                }}
              />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex-1 min-w-0 pr-1">
                      <p className="font-bold text-sm leading-tight truncate" style={{ color: "var(--foreground)" }}>
                        {p.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        🏷️ {p.category}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display font-black text-lg" style={{ color: "var(--primary)" }}>
                        ₹{p.price}
                      </p>
                      {p.costPrice && (
                        <p className="text-[10px] text-gray-500 font-mono">
                          CP: ₹{p.costPrice} (Margin: {Math.round(((p.price - p.costPrice) / p.price) * 100)}%)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock and Expiry Stats */}
                  <div className="space-y-1.5 mt-3 text-xs">
                    <div className="flex justify-between">
                      <span style={{ color: "var(--muted-foreground)" }}>Stock Level:</span>
                      <span className={`font-semibold font-mono ${isOut ? "text-red-600 font-bold" : isLow ? "text-amber-500 font-bold" : "text-emerald-500 font-bold"}`}>
                        {p.stock} units {isOut ? "(OUT)" : isLow ? "(LOW)" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--muted-foreground)" }}>Expiry:</span>
                      <span className={`font-mono ${daysToExpiry < 30 ? "text-amber-500 font-bold" : ""}`}>
                        {daysToExpiry > 0 ? `${daysToExpiry}d left` : "Expired"}
                      </span>
                    </div>
                  </div>

                  {/* Barcode Visual Strip */}
                  <div
                    onClick={() => handleCopyBarcode(p.barcode)}
                    className="mt-3 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
                    style={{ borderColor: "var(--border)" }}
                    title="Click to copy barcode"
                  >
                    <BarcodeSVG code={p.barcode} />
                    <span className="text-[10px] text-gray-400 font-mono">
                      {barcodeCopied === p.barcode ? "✓ Copied" : "📋"}
                    </span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                  {isOut ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-red-100 text-red-700 font-semibold">
                      🚫 Out of Stock
                    </span>
                  ) : isLow ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-100 text-amber-700 font-semibold">
                      ⚠️ Low Stock
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-green-100 text-green-700 font-semibold">
                      ✅ In Stock
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-lg text-xs hover:bg-amber-500/10 text-gray-500 hover:text-amber-500 cursor-pointer transition-colors"
                      title="Edit product"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setDeletingProduct(p)}
                      className="p-1.5 rounded-lg text-xs hover:bg-red-500/10 text-gray-500 hover:text-red-500 cursor-pointer transition-colors"
                      title="Delete product"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up my-auto"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-display font-black text-xl" style={{ color: "var(--foreground)" }}>
                {editingProduct ? "✏️ Edit Product Details" : "✨ Add New Product"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  Product Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Fortune Sunlite Sunflower Oil 1L"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none cursor-pointer"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    <option>Grocery</option>
                    <option>Dairy</option>
                    <option>Snacks</option>
                    <option>FMCG</option>
                    <option>Instant Food</option>
                    <option>Personal Care</option>
                    <option>Beverages</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    Selling Price (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="e.g. 150"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none font-mono"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    value={form.costPrice}
                    onChange={e => setForm(p => ({ ...p, costPrice: e.target.value }))}
                    placeholder="120"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none font-mono"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none font-mono"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    Min Alert Stock
                  </label>
                  <input
                    type="number"
                    value={form.minStock}
                    onChange={e => setForm(p => ({ ...p, minStock: e.target.value }))}
                    placeholder="5"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none font-mono"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.expiry}
                    onChange={e => setForm(p => ({ ...p, expiry: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none font-mono"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                      Barcode / EAN-13
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, barcode: generateEAN13() }))}
                      className="text-[10px] text-amber-500 hover:underline font-bold cursor-pointer"
                    >
                      🎲 Generate
                    </button>
                  </div>
                  <input
                    value={form.barcode}
                    onChange={e => setForm(p => ({ ...p, barcode: e.target.value }))}
                    placeholder="8901234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none font-mono"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>

              {/* Barcode Visual Preview in Modal */}
              {form.barcode && (
                <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border" style={{ borderColor: "var(--border)" }}>
                  <BarcodeSVG code={form.barcode} />
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm border cursor-pointer"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl font-display font-bold text-sm shadow-md cursor-pointer"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  {editingProduct ? "Save Changes ✓" : "Add Product ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up text-center"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center text-2xl mx-auto">
              🗑️
            </div>
            <div>
              <h3 className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>
                Delete Product?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove <strong>{deletingProduct.name}</strong> from your catalogue?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md cursor-pointer transition-all"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

