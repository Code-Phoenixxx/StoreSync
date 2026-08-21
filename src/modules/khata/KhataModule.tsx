import { useState } from "react"
import { Customer, Lang } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

export default function KhataModule({ lang }: { lang: Lang }) {
  const [customers, setCustomers] = useState<Customer[]>(db.getCustomers())
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [newCreditModal, setNewCreditModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", amount: "" })

  const totalCredit = customers.reduce((s, c) => s + c.credit, 0)

  function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCustomer || !paymentAmount) return
    const amt = Number(paymentAmount)
    const updated = db.recordPayment(selectedCustomer.id, amt)
    setCustomers(updated)
    setSelectedCustomer(null)
    setPaymentAmount("")
  }

  function handleAddNewCredit(e: React.FormEvent) {
    e.preventDefault()
    if (!newCustomer.name.trim() || !newCustomer.amount) return
    const updated = db.addCustomerCredit(
      newCustomer.name.trim(),
      newCustomer.phone.trim(),
      Number(newCustomer.amount)
    )
    setCustomers(updated)
    setNewCreditModal(false)
    setNewCustomer({ name: "", phone: "", amount: "" })
  }

  function sendReminder(name: string, phone: string, amount: number) {
    alert(`📲 Reminder sent to ${name} (${phone}) for ₹${amount} via SMS/WhatsApp!`)
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            💳 {TR[lang].khata} / Digital Ledger
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Track customer credit (Udhaar), record payments and send automatic payment reminders
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {TR[lang].totalCredit}
            </p>
            <p className="font-display font-black text-2xl" style={{ color: "var(--destructive)" }}>
              ₹{totalCredit.toLocaleString("en-IN")}
            </p>
          </div>
          <button
            onClick={() => setNewCreditModal(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all hover:opacity-90 cursor-pointer"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            + New Khata Entry
          </button>
        </div>
      </div>

      {/* Customers Ledger List */}
      <div className="space-y-3">
        {customers.map(c => (
          <div
            key={c.id}
            className="card-hover rounded-2xl border p-5 flex items-center justify-between gap-4 shadow-sm"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-lg shadow-sm"
                style={{
                  background: c.credit > 0 ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
                  color: c.credit > 0 ? "var(--destructive)" : "var(--accent)",
                }}
              >
                {c.name[0]}
              </div>
              <div>
                <p className="font-bold text-base" style={{ color: "var(--foreground)" }}>
                  {c.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  📞 {c.phone} · Last Visit: {c.lastVisit}
                </p>
              </div>
            </div>

            <div className="text-right flex items-center gap-3">
              <div>
                {c.credit > 0 ? (
                  <>
                    <p className="font-display font-black text-lg text-red-500">₹{c.credit.toLocaleString("en-IN")}</p>
                    <p className="text-[10px] text-red-400 font-semibold">Credit Due</p>
                  </>
                ) : (
                  <p className="font-semibold text-sm" style={{ color: "var(--accent)" }}>
                    ✅ All Cleared
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {c.credit > 0 && (
                  <button
                    onClick={() => sendReminder(c.name, c.phone, c.credit)}
                    className="text-xs px-3 py-2 rounded-xl font-semibold transition-all hover:opacity-80 cursor-pointer"
                    style={{ background: "rgba(245,158,11,0.12)", color: "var(--primary)" }}
                  >
                    📲 Remind
                  </button>
                )}
                <button
                  onClick={() => setSelectedCustomer(c)}
                  className="text-xs px-3.5 py-2 rounded-xl font-semibold transition-all hover:opacity-90 shadow-sm cursor-pointer"
                  style={{ background: "var(--secondary)", color: "#fff" }}
                >
                  💵 Pay / Settle
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Record Payment Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
                Record Payment for {selectedCustomer.name}
              </h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400">✕</button>
            </div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Current Outstanding Balance: <strong className="text-red-500">₹{selectedCustomer.credit}</strong>
            </p>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  Received Amount (₹)
                </label>
                <input
                  required
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder={`Max ₹${selectedCustomer.credit}`}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none font-mono"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentAmount(String(selectedCustomer.credit))}
                  className="text-xs px-2.5 py-1 rounded-lg border font-semibold"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  Full Clear (₹{selectedCustomer.credit})
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
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
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Credit Modal */}
      {newCreditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <h3 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
                Add New Khata Entry
              </h3>
              <button onClick={() => setNewCreditModal(false)} className="text-gray-400">✕</button>
            </div>
            <form onSubmit={handleAddNewCredit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  Customer Name *
                </label>
                <input
                  required
                  value={newCustomer.name}
                  onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Anand Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  Phone Number
                </label>
                <input
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                  placeholder="9876543210"
                  type="tel"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                  Credit Amount (₹) *
                </label>
                <input
                  required
                  type="number"
                  value={newCustomer.amount}
                  onChange={e => setNewCustomer(p => ({ ...p, amount: e.target.value }))}
                  placeholder="e.g. 750"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none font-mono"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setNewCreditModal(false)}
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
