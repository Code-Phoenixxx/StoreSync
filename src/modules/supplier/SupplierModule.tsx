import { useState } from "react"
import { Lang, Supplier } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

export default function SupplierModule({ lang }: { lang: Lang }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(db.getSuppliers())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [form, setForm] = useState({
    name: "",
    category: "Grocery",
    contact: "",
    email: "",
    rating: "4.8",
  })
  const [orderNotification, setOrderNotification] = useState<string | null>(null)

  function openAddModal() {
    setEditingSupplier(null)
    setForm({ name: "", category: "Grocery", contact: "", email: "", rating: "4.8" })
    setIsModalOpen(true)
  }

  function openEditModal(s: Supplier) {
    setEditingSupplier(s)
    setForm({
      name: s.name,
      category: s.category,
      contact: s.contact,
      email: s.email || "",
      rating: String(s.rating),
    })
    setIsModalOpen(true)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.contact.trim()) return

    if (editingSupplier) {
      // Edit
      const updated = db.updateSupplier(editingSupplier.id, {
        name: form.name.trim(),
        category: form.category,
        contact: form.contact.trim(),
        email: form.email.trim(),
        rating: Number(form.rating) || 4.5,
      })
      setSuppliers(updated)
    } else {
      // Add
      const updated = db.addSupplier({
        name: form.name.trim(),
        category: form.category,
        contact: form.contact.trim(),
        email: form.email.trim(),
        rating: Number(form.rating) || 4.5,
        lastOrder: "Today",
      })
      setSuppliers(updated)
    }

    setIsModalOpen(false)
  }

  function handleDelete(id: number) {
    if (confirm("Are you sure you want to delete this supplier?")) {
      const updated = db.deleteSupplier(id)
      setSuppliers(updated)
    }
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
            Manage distributors, wholesale contacts, procurement orders, and supplier credit
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all hover:opacity-90 cursor-pointer"
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

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {suppliers.map(s => (
          <div
            key={s.id}
            className="card-hover rounded-2xl border p-5 space-y-4 shadow-sm flex flex-col justify-between"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold font-display text-base" style={{ color: "var(--foreground)" }}>
                    {s.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    Category: {s.category}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(16,185,129,0.12)", color: "var(--accent)" }}
                  >
                    ⭐ {s.rating}
                  </span>
                  <button
                    onClick={() => openEditModal(s)}
                    className="text-xs p-1 text-gray-400 hover:text-amber-500 cursor-pointer"
                    title="Edit Supplier"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-xs p-1 text-gray-400 hover:text-red-500 cursor-pointer"
                    title="Delete Supplier"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs mt-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <span style={{ color: "var(--muted-foreground)" }}>Last Purchase Order:</span>
                <span className="font-semibold" style={{ color: "var(--foreground)" }}>
                  {s.lastOrder}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`tel:${s.contact}`}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border text-center transition-all hover:opacity-80"
                style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--muted)" }}
              >
                📞 {s.contact}
              </a>
              <button
                onClick={() => alert(`📦 Order request dispatched to ${s.name}!`)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 shadow-sm cursor-pointer"
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
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
                {editingSupplier ? "✏️ Edit Supplier" : "✨ Add Supplier"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
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
                  <input
                    value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    placeholder="Grocery / Dairy"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
                    style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
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
                  Email / Order Desk (Optional)
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

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  {editingSupplier ? "Save Changes" : "Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
