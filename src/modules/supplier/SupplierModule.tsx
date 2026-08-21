import { useState } from "react"
import { Lang, Supplier } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

export default function SupplierModule({ lang }: { lang: Lang }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => db.getSuppliers())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null)
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null)
  const [payAmount, setPayAmount] = useState("")
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("All")
  const [form, setForm] = useState({
    name: "",
    category: "Grocery",
    contact: "",
    email: "",
    address: "",
    rating: "4.8",
    balanceDue: "0",
  })
  const [orderNotification, setOrderNotification] = useState<string | null>(null)

  const categories = ["All", ...Array.from(new Set(suppliers.map(s => s.category).filter(Boolean)))]

  const filteredSuppliers = suppliers.filter(s => {
    const matchCat = catFilter === "All" || s.category === catFilter
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contact.toLowerCase().includes(search.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  function openAddModal() {
    setEditingSupplier(null)
    setForm({
      name: "",
      category: "Grocery",
      contact: "",
      email: "",
      address: "",
      rating: "4.8",
      balanceDue: "0",
    })
    setIsModalOpen(true)
  }

  function openEditModal(s: Supplier) {
    setEditingSupplier(s)
    setForm({
      name: s.name,
      category: s.category || "Grocery",
      contact: s.contact,
      email: s.email || "",
      address: s.address || "",
      rating: String(s.rating || 4.5),
      balanceDue: String(s.balanceDue || 0),
    })
    setIsModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.contact.trim()) return

    if (editingSupplier) {
      // Update existing supplier
      const updated = db.updateSupplier(editingSupplier.id, {
        name: form.name.trim(),
        category: form.category,
        contact: form.contact.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        rating: Number(form.rating) || 4.5,
        balanceDue: Number(form.balanceDue) || 0,
      })
      setSuppliers(updated)
    } else {
      // Add new supplier
      const updated = db.addSupplier({
        name: form.name.trim(),
        category: form.category,
        contact: form.contact.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        rating: Number(form.rating) || 4.5,
        balanceDue: Number(form.balanceDue) || 0,
        lastOrder: "Today",
      })
      setSuppliers(updated)
    }

    setIsModalOpen(false)
  }

  function confirmDelete() {
    if (deletingSupplier) {
      const updated = db.deleteSupplier(deletingSupplier.id)
      setSuppliers(updated)
      setDeletingSupplier(null)
    }
  }

  function handlePaySupplier(e: React.FormEvent) {
    e.preventDefault()
    if (!payingSupplier || !payAmount) return
    const amt = Number(payAmount)
    const currentDue = payingSupplier.balanceDue || 0
    const newDue = Math.max(0, currentDue - amt)
    const updated = db.updateSupplier(payingSupplier.id, { balanceDue: newDue })
    setSuppliers(updated)
    setPayingSupplier(null)
    setPayAmount("")
    setOrderNotification(`✅ Payment of ₹${amt} recorded for ${payingSupplier.name}!`)
    setTimeout(() => setOrderNotification(null), 4000)
  }

  function handleAutoOrder() {
    setOrderNotification("✅ Auto-generated PO for Colgate Toothpaste (24 units) & Amul Butter (12 units) sent to Metro Cash & Carry!")
    setTimeout(() => setOrderNotification(null), 5000)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            🛒 {TR[lang].supplier} Directory
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Manage distributors, wholesale contacts, procurement orders, and supplier credit ({suppliers.length} vendors)
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          + Add New Supplier
        </button>
      </div>

      {/* Smart Restock Banner */}
      <div
        className="rounded-3xl p-6 relative overflow-hidden shadow-lg"
        style={{ background: "linear-gradient(135deg, var(--secondary), #2D5A8E)" }}
      >
        <div className="flex items-start gap-4">
          <span className="text-3xl">🔮</span>
          <div className="flex-1">
            <p className="font-display font-bold text-white text-lg mb-1">{TR[lang].smartRestock}</p>
            <p className="text-sm opacity-90 text-white leading-relaxed">
              AI recommends ordering: <strong>Colgate Toothpaste ×24, Amul Butter ×12, Parle-G ×50</strong> before the weekend rush.
            </p>
            <button
              onClick={handleAutoOrder}
              className="mt-4 px-5 py-2.5 rounded-xl text-xs font-display font-bold shadow-md transition-all hover:opacity-90 cursor-pointer"
              style={{ background: "var(--primary)", color: "#fff" }}
            >
              ⚡ Auto-Generate Restock PO
            </button>
            {orderNotification && (
              <p className="mt-2 text-xs font-bold text-emerald-300 animate-fade-in">{orderNotification}</p>
            )}
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex gap-3 flex-wrap items-center">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search supplier name, category, phone or email..."
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl text-sm outline-none border shadow-sm"
          style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
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

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map(s => (
          <div
            key={s.id}
            className="card-hover rounded-2xl border p-5 space-y-4 shadow-sm flex flex-col justify-between"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold font-display text-base truncate" style={{ color: "var(--foreground)" }}>
                    {s.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    🏷️ Category: <span className="font-semibold">{s.category || "General"}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(16,185,129,0.12)", color: "var(--accent)" }}
                  >
                    ⭐ {s.rating}
                  </span>
                  <button
                    onClick={() => openEditModal(s)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs hover:bg-amber-500/10 text-gray-500 hover:text-amber-500 cursor-pointer transition-colors"
                    title="Edit Supplier"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeletingSupplier(s)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs hover:bg-red-500/10 text-gray-500 hover:text-red-500 cursor-pointer transition-colors"
                    title="Delete Supplier"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {s.address && (
                <p className="text-xs text-gray-500 mt-2 truncate">
                  📍 {s.address}
                </p>
              )}

              <div className="space-y-1.5 mt-3 pt-3 border-t text-xs" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--muted-foreground)" }}>Last Purchase:</span>
                  <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                    {s.lastOrder || "Recent"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--muted-foreground)" }}>Balance / Due:</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-bold ${(s.balanceDue ?? 0) > 0 ? "text-red-500" : "text-emerald-500"}`}>
                      ₹{(s.balanceDue ?? 0).toLocaleString("en-IN")}
                    </span>
                    {(s.balanceDue ?? 0) > 0 && (
                      <button
                        onClick={() => {
                          setPayingSupplier(s)
                          setPayAmount(String(s.balanceDue))
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold transition-all cursor-pointer"
                      >
                        Settle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`tel:${s.contact}`}
                className="flex-1 py-2 rounded-xl text-xs font-bold border text-center transition-all hover:opacity-80 flex items-center justify-center gap-1"
                style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--muted)" }}
              >
                📞 Call
              </a>
              {s.email ? (
                <a
                  href={`mailto:${s.email}`}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border text-center transition-all hover:opacity-80 flex items-center justify-center gap-1"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--muted)" }}
                >
                  ✉️ Email
                </a>
              ) : null}
              <button
                onClick={() => alert(`📦 Order request dispatched to ${s.name} (${s.contact})!`)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 shadow-sm cursor-pointer"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                {TR[lang].orderNow}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
                {editingSupplier ? "✏️ Edit Supplier" : "✨ Add New Supplier"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  Supplier / Distributor Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Parle Biscuit Agency"
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
                    <option>Beverages</option>
                    <option>Snacks</option>
                    <option>FMCG</option>
                    <option>Personal Care</option>
                    <option>Wholesale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    Phone / Contact *
                  </label>
                  <input
                    required
                    value={form.contact}
                    onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  Email / Order Desk
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="orders@supplier.in"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  Warehouse / Address
                </label>
                <input
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="e.g. Sector 4, Wholesale Market"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    Rating (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={form.rating}
                    onChange={e => setForm(p => ({ ...p, rating: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                    Balance Due (₹)
                  </label>
                  <input
                    type="number"
                    value={form.balanceDue}
                    onChange={e => setForm(p => ({ ...p, balanceDue: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none font-mono"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  {editingSupplier ? "Save Changes ✓" : "Add Supplier ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSupplier && (
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
                Delete Supplier?
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to remove <strong>{deletingSupplier.name}</strong> from your supplier directory?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingSupplier(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md cursor-pointer transition-all"
              >
                Delete Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settle Balance Modal */}
      {payingSupplier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>
                Settle Due with {payingSupplier.name}
              </h3>
              <button onClick={() => setPayingSupplier(null)} className="text-gray-400">✕</button>
            </div>
            <form onSubmit={handlePaySupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  Pay Amount (₹)
                </label>
                <input
                  required
                  type="number"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  placeholder={`Max ₹${payingSupplier.balanceDue || 0}`}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none font-mono"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingSupplier(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

