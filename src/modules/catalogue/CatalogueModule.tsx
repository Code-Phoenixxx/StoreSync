import { useState } from "react"
import { Lang, Product } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

export default function CatalogueModule({ lang }: { lang: Lang }) {
  const [products, setProducts] = useState<Product[]>(db.getProducts())
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("All")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: "",
    category: "Grocery",
    price: "",
    costPrice: "",
    stock: "",
    minStock: "10",
    expiry: "2027-01-01",
    barcode: "",
  })

  const cats = ["All", ...Array.from(new Set(products.map(p => p.category)))]
  const filtered = products.filter(
    p =>
      (catFilter === "All" || p.category === catFilter) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.price) return

    const newProd = db.addProduct({
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      costPrice: Number(form.costPrice) || Math.round(Number(form.price) * 0.8),
      stock: Number(form.stock) || 0,
      minStock: Number(form.minStock) || 5,
      expiry: form.expiry || "2027-12-31",
      barcode: form.barcode.trim() || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    })

    setProducts([newProd, ...products])
    setIsAddModalOpen(false)
    setForm({
      name: "",
      category: "Grocery",
      price: "",
      costPrice: "",
      stock: "",
      minStock: "10",
      expiry: "2027-01-01",
      barcode: "",
    })
  }

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to remove this product from catalogue?")) {
      const updated = db.deleteProduct(id)
      setProducts(updated)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            📦 {TR[lang].catalogue}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Manage your inventory, pricing, barcodes, and stock levels ({products.length} items)
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          + {TR[lang].addProduct}
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={TR[lang].searchProduct}
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl text-sm outline-none border shadow-sm"
          style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
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

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => {
          const isLow = p.stock <= p.minStock
          const daysToExpiry = Math.round((new Date(p.expiry).getTime() - Date.now()) / 86400000)
          return (
            <div
              key={p.id}
              className="card-hover rounded-2xl border overflow-hidden shadow-sm flex flex-col justify-between"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="h-2" style={{ background: isLow ? "var(--destructive)" : "var(--accent)" }} />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-sm leading-tight truncate" style={{ color: "var(--foreground)" }}>
                        {p.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {p.category}
                      </p>
                    </div>
                    <p className="font-display font-black text-lg shrink-0" style={{ color: "var(--primary)" }}>
                      ₹{p.price}
                    </p>
                  </div>

                  <div className="space-y-1.5 mt-3">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--muted-foreground)" }}>Stock</span>
                      <span className={`font-semibold font-mono ${isLow ? "text-red-500 font-bold" : ""}`}>
                        {p.stock} units
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--muted-foreground)" }}>Expiry</span>
                      <span className={`font-mono ${daysToExpiry < 30 ? "text-amber-500 font-bold" : ""}`}>
                        {daysToExpiry > 0 ? `${daysToExpiry}d left` : "Expired"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--muted-foreground)" }}>Barcode</span>
                      <span className="font-mono text-xs opacity-70" style={{ color: "var(--muted-foreground)" }}>
                        {p.barcode.slice(-6)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                  {isLow ? (
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-red-100 text-red-700 font-semibold">
                      ⚠️ Low Stock
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-green-100 text-green-700 font-semibold">
                      ✅ In Stock
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold p-1"
                    title="Delete product"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-display font-black text-xl" style={{ color: "var(--foreground)" }}>
                ✨ {TR[lang].addProduct}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  Product Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Parle Hide & Seek 120g"
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
                    placeholder="e.g. 50"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
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
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={form.expiry}
                    onChange={e => setForm(p => ({ ...p, expiry: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  Barcode / SKU
                </label>
                <input
                  value={form.barcode}
                  onChange={e => setForm(p => ({ ...p, barcode: e.target.value }))}
                  placeholder="Scan or auto-generate"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm border"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl font-display font-bold text-sm shadow-md"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  Save Product ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
