import { useState, useEffect } from "react"
import { Customer, Lang, Bill, ShopInfo } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

export default function KhataModule({ lang }: { lang: Lang }) {
  const [customers, setCustomers] = useState<Customer[]>(() => db.getCustomers())
  const [bills, setBills] = useState<Bill[]>(() => db.getBills())
  const [shopInfo] = useState<ShopInfo>(() => db.getShopInfo())
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"ALL" | "DUE" | "SETTLED">("ALL")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [settleCustomer, setSettleCustomer] = useState<Customer | null>(null)
  const [remindCustomer, setRemindCustomer] = useState<Customer | null>(null)
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null)
  const [deleteCustomerId, setDeleteCustomerId] = useState<number | null>(null)

  // Add Customer Form state
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newCredit, setNewCredit] = useState("")

  // Settle Payment Form state
  const [settleAmount, setSettleAmount] = useState("")
  const [settleMode, setSettleMode] = useState<"CASH" | "UPI">("CASH")

  useEffect(() => {
    setCustomers(db.getCustomers())
    setBills(db.getBills())
  }, [])

  function triggerToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Summary Metrics
  const totalCreditDue = customers.reduce((s, c) => s + c.credit, 0)
  const totalDebtors = customers.filter(c => c.credit > 0).length
  const totalSettledCount = customers.filter(c => c.credit === 0).length

  // Filtered List
  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === "ALL"
        ? true
        : filter === "DUE"
        ? c.credit > 0
        : c.credit === 0
    return matchesSearch && matchesFilter
  })

  // Handlers
  function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return

    const creditAmount = parseFloat(newCredit) || 0
    const updated = db.addCustomerCredit(newName.trim(), newPhone.trim() || "N/A", creditAmount)
    setCustomers(updated)
    setShowAddModal(false)
    setNewName("")
    setNewPhone("")
    setNewCredit("")
    triggerToast(`🎉 Customer "${newName}" added to Khata with ₹${creditAmount} credit!`)
  }

  function handleSettlePayment(e: React.FormEvent) {
    e.preventDefault()
    if (!settleCustomer) return

    const amount = parseFloat(settleAmount) || 0
    if (amount <= 0) return

    const updated = db.recordPayment(settleCustomer.id, amount)
    setCustomers(updated)
    triggerToast(`✅ Recorded ₹${amount} payment for ${settleCustomer.name} via ${settleMode}!`)
    setSettleCustomer(null)
    setSettleAmount("")
  }

  function handleDeleteCustomer(id: number) {
    const updated = db.deleteCustomer(id)
    setCustomers(updated)
    setDeleteCustomerId(null)
    triggerToast("🗑️ Customer ledger record removed.")
  }

  function getWhatsAppReminderLink(customer: Customer): string {
    const phone = customer.phone.replace(/[^0-9]/g, "")
    const validPhone = phone.length === 10 ? `91${phone}` : phone
    const text = encodeURIComponent(
      `Namaste ${customer.name} ji,\n\nThis is a friendly reminder from *${shopInfo.shopName}* regarding your outstanding Khata credit balance of *₹${customer.credit.toLocaleString(
        "en-IN"
      )}*.\n\nPlease clear the balance via UPI or visit the shop at your convenience.\n\nThank you! 🙏\n-${shopInfo.ownerName}`
    )
    return `https://wa.me/${validPhone}?text=${text}`
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-neutral-900 text-amber-400 border border-amber-500/50 shadow-2xl px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 slide-up">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <div>
          <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
            💳 {TR[lang].khata} / Customer Credit Ledger
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Track customer udhaar, record payments, and send instant WhatsApp/SMS reminders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl font-display font-bold text-xs shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer flex items-center gap-1.5"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            ➕ Add Customer / Khata
          </button>
        </div>
      </div>

      {/* Financial Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-3xl border p-4 sm:p-5 space-y-1 shadow-sm relative overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Outstanding Udhaar</span>
            <span className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center text-sm font-bold">
              💳
            </span>
          </div>
          <p className="font-display font-black text-2xl text-red-500">
            ₹{totalCreditDue.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-gray-400 font-mono">
            Across {totalDebtors} active customer accounts
          </p>
        </div>

        <div
          className="rounded-3xl border p-4 sm:p-5 space-y-1 shadow-sm relative overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Customers with Balance</span>
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold">
              👥
            </span>
          </div>
          <p className="font-display font-black text-2xl text-amber-500">
            {totalDebtors} Customers
          </p>
          <p className="text-[11px] text-gray-400 font-mono">
            Requires follow-up reminder
          </p>
        </div>

        <div
          className="rounded-3xl border p-4 sm:p-5 space-y-1 shadow-sm relative overflow-hidden"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Zero Balance / Cleared</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm font-bold">
              ✅
            </span>
          </div>
          <p className="font-display font-black text-2xl text-emerald-500">
            {totalSettledCount} Settled
          </p>
          <p className="text-[11px] text-gray-400 font-mono">
            Fully paid and up to date
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search customer name or phone number..."
            className="w-full px-4 py-2.5 rounded-2xl text-xs outline-none border shadow-xs pl-9"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <span className="absolute left-3 top-2.5 text-xs opacity-60">👤</span>
        </div>

        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl border" style={{ borderColor: "var(--border)" }}>
          {(["ALL", "DUE", "SETTLED"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {f === "ALL" ? `All (${customers.length})` : f === "DUE" ? `Pending Due (${totalDebtors})` : `Cleared (${totalSettledCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Ledgers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400 text-xs font-semibold">
            No customers found matching your criteria.
          </div>
        ) : (
          filteredCustomers.map(customer => {
            const hasDue = customer.credit > 0
            return (
              <div
                key={customer.id}
                className="rounded-3xl border p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all card-hover"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>
                        {customer.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        📞 {customer.phone || "No phone listed"}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold font-mono ${
                        hasDue ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      }`}
                    >
                      {hasDue ? "DUE" : "CLEARED"}
                    </span>
                  </div>

                  <div className="mt-4 p-3 rounded-2xl border space-y-1" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Current Balance Due:</span>
                      <span className={`font-mono font-bold text-base ${hasDue ? "text-red-500" : "text-emerald-500"}`}>
                        ₹{customer.credit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span>Last Activity:</span>
                      <span className="font-mono">{customer.lastVisit || "Recent"}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSettleCustomer(customer)
                        setSettleAmount(customer.credit > 0 ? customer.credit.toString() : "")
                      }}
                      className="py-2 px-3 rounded-xl text-xs font-bold border transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-500 cursor-pointer text-center"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      💰 Settle Pay
                    </button>

                    <button
                      onClick={() => setRemindCustomer(customer)}
                      disabled={!hasDue}
                      className="py-2 px-3 rounded-xl text-xs font-bold border transition-all hover:bg-amber-500 hover:text-white hover:border-amber-500 cursor-pointer text-center disabled:opacity-40 disabled:pointer-events-none"
                      style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                    >
                      📲 Remind
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <button
                      onClick={() => setStatementCustomer(customer)}
                      className="text-amber-500 hover:underline font-bold cursor-pointer"
                    >
                      📜 View Statement
                    </button>

                    <button
                      onClick={() => setDeleteCustomerId(customer.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Customer Record"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Modal 1: Add Customer / Khata Entry ─────────────────────────────── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">➕</span>
                <h3 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
                  Add Customer to Khata
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>
                  Customer Name *
                </label>
                <input
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar, Sunita Devi"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none font-mono"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>
                  Initial Credit / Udhaar Balance (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newCredit}
                  onChange={e => setNewCredit(e.target.value)}
                  placeholder="e.g. 250 (Leave 0 if starting fresh)"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none font-mono"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer"
                  style={{ borderColor: "var(--border)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  Save Customer ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Settle Payment ────────────────────────────────────────── */}
      {settleCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <div>
                <h3 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
                  Record Payment Repayment
                </h3>
                <p className="text-xs text-gray-400">Customer: {settleCustomer.name}</p>
              </div>
              <button onClick={() => setSettleCustomer(null)} className="text-gray-400">✕</button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex justify-between items-center">
              <span>Current Outstanding Due:</span>
              <span className="font-mono font-bold text-base text-amber-500">
                ₹{settleCustomer.credit.toLocaleString("en-IN")}
              </span>
            </div>

            <form onSubmit={handleSettlePayment} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>
                  Repayment Amount (₹) *
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max={settleCustomer.credit || 100000}
                  value={settleAmount}
                  onChange={e => setSettleAmount(e.target.value)}
                  placeholder="Enter amount paid"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none font-mono font-bold"
                  style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSettleAmount(settleCustomer.credit.toString())}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 cursor-pointer"
                >
                  Full Settle (₹{settleCustomer.credit})
                </button>
                {settleCustomer.credit >= 200 && (
                  <button
                    type="button"
                    onClick={() => setSettleAmount((settleCustomer.credit / 2).toFixed(0))}
                    className="px-3 py-1 rounded-lg text-xs font-bold border text-gray-400 hover:text-white cursor-pointer"
                    style={{ borderColor: "var(--border)" }}
                  >
                    50% (₹{(settleCustomer.credit / 2).toFixed(0)})
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--foreground)" }}>
                  Payment Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettleMode("CASH")}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      settleMode === "CASH" ? "bg-amber-500 border-amber-500 text-white shadow-xs" : "border-neutral-700 text-gray-400"
                    }`}
                  >
                    💵 Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettleMode("UPI")}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      settleMode === "UPI" ? "bg-amber-500 border-amber-500 text-white shadow-xs" : "border-neutral-700 text-gray-400"
                    }`}
                  >
                    📱 UPI / QR Code
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSettleCustomer(null)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer"
                  style={{ borderColor: "var(--border)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  ✓ Record Settle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 3: Send WhatsApp Reminder ────────────────────────────────── */}
      {remindCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">📲</span>
                <h3 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
                  Send Khata Payment Reminder
                </h3>
              </div>
              <button onClick={() => setRemindCustomer(null)} className="text-gray-400">✕</button>
            </div>

            <p className="text-xs text-gray-400">
              Send a personalized reminder on WhatsApp or SMS with the balance amount and UPI payment request:
            </p>

            <div className="p-4 rounded-2xl border text-xs space-y-2" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
              <p className="font-semibold text-amber-500">Preview Message:</p>
              <p className="text-gray-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                {`Namaste ${remindCustomer.name} ji,\n\nThis is a friendly reminder from ${shopInfo.shopName} regarding your outstanding Khata credit balance of ₹${remindCustomer.credit.toLocaleString(
                  "en-IN"
                )}.\n\nPlease clear the balance via UPI or visit the shop at your convenience.\n\nThank you! 🙏\n-${shopInfo.ownerName}`}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={getWhatsAppReminderLink(remindCustomer)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                💬 Open WhatsApp & Send
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Namaste ${remindCustomer.name} ji, reminder from ${shopInfo.shopName} for pending Khata balance of ₹${remindCustomer.credit}. Please pay via UPI.`
                  )
                  triggerToast("📋 Copied reminder text to clipboard!")
                }}
                className="w-full py-2.5 rounded-2xl font-bold text-xs border text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                style={{ borderColor: "var(--border)" }}
              >
                📋 Copy Message to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 4: Customer Statement Timeline ───────────────────────────── */}
      {statementCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up max-h-[85vh] flex flex-col"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <div>
                <h3 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
                  📜 Customer Statement / Ledger
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  {statementCustomer.name} · {statementCustomer.phone}
                </p>
              </div>
              <button onClick={() => setStatementCustomer(null)} className="text-gray-400">✕</button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex justify-between items-center">
              <span>Current Outstanding Due:</span>
              <span className="font-mono font-bold text-base text-red-500">
                ₹{statementCustomer.credit.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Invoices recorded for this customer */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Recent Invoices for {statementCustomer.name}:
              </p>

              {bills.filter(b => b.customer.toLowerCase() === statementCustomer.name.toLowerCase()).length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">
                  No individual line-item bills recorded yet. Balance was set directly in Khata.
                </div>
              ) : (
                bills
                  .filter(b => b.customer.toLowerCase() === statementCustomer.name.toLowerCase())
                  .map(b => (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl border text-xs flex justify-between items-center"
                      style={{ background: "var(--muted)", borderColor: "var(--border)" }}
                    >
                      <div>
                        <span className="font-mono font-bold text-amber-500">{b.id}</span>
                        <p className="text-[10px] text-gray-400">{b.time} · {b.items} items</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold">₹{b.total}</span>
                        <span className={`block text-[9px] font-bold ${b.paid ? "text-emerald-500" : "text-red-500"}`}>
                          {b.paymentType}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <button
              onClick={() => setStatementCustomer(null)}
              className="w-full py-2.5 rounded-xl border text-xs font-bold cursor-pointer"
              style={{ borderColor: "var(--border)" }}
            >
              Close Statement
            </button>
          </div>
        </div>
      )}

      {/* ── Modal 5: Delete Customer Confirmation ──────────────────────────── */}
      {deleteCustomerId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up text-center"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>
            <div>
              <h3 className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>
                Delete Customer Record?
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Are you sure you want to remove this customer from the Khata ledger?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCustomerId(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border cursor-pointer"
                style={{ borderColor: "var(--border)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCustomer(deleteCustomerId)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
