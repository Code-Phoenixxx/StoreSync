import { useState } from "react"
import { Bill } from "../../types"

interface BillHistoryModalProps {
  bills: Bill[]
  onClose: () => void
  onPrintBill: (bill: Bill) => void
  onDeleteBill?: (billId: string) => void
}

export default function BillHistoryModal({
  bills,
  onClose,
  onPrintBill,
  onDeleteBill,
}: BillHistoryModalProps) {
  const [search, setSearch] = useState("")
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "CASH" | "UPI" | "KHATA">("ALL")
  const [selectedBill, setSelectedBill] = useState<Bill | null>(bills[0] || null)

  const filteredBills = bills.filter(b => {
    const matchSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      (b.customerPhone && b.customerPhone.includes(search))
    const matchPayment = paymentFilter === "ALL" || b.paymentType === paymentFilter
    return matchSearch && matchPayment
  })

  // Summary stats
  const totalRevenue = bills.reduce((s, b) => s + b.total, 0)
  const totalPaidRevenue = bills.filter(b => b.paid).reduce((s, b) => s + b.total, 0)
  const totalKhataCredit = bills.filter(b => !b.paid || b.paymentType === "KHATA").reduce((s, b) => s + b.total, 0)
  const totalItemsSold = bills.reduce((s, b) => s + (b.items || 0), 0)

  function handleExportCSV() {
    const headers = "Invoice ID,Customer,Phone,Time,Payment Mode,Items Qty,Total (INR),Paid Status\n"
    const rows = bills
      .map(
        b =>
          `"${b.id}","${b.customer}","${b.customerPhone || "N/A"}","${b.time}","${
            b.paymentType || "CASH"
          }",${b.items},${b.total},"${b.paid ? "PAID" : "KHATA/UNPAID"}"`
      )
      .join("\n")

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `StoreSync_Bills_History_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl p-5 md:p-6 space-y-4 slide-up my-auto max-h-[92vh] flex flex-col"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
              📜
            </div>
            <div>
              <h2 className="font-display font-black text-xl" style={{ color: "var(--foreground)" }}>
                Detailed Invoices & Billing History
              </h2>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Complete records of all store sales, line-item breakdowns, and payment statuses ({bills.length} bills)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer flex items-center gap-1.5"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            >
              📥 Export CSV
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl border space-y-1" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
            <p className="text-[11px] text-gray-500 font-semibold">Total Revenue</p>
            <p className="font-display font-black text-lg text-emerald-500">₹{totalRevenue.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-gray-400 font-mono">{bills.length} total bills</p>
          </div>
          <div className="p-3 rounded-2xl border space-y-1" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
            <p className="text-[11px] text-gray-500 font-semibold">Paid In Cash / UPI</p>
            <p className="font-display font-black text-lg text-blue-500">₹{totalPaidRevenue.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-gray-400 font-mono">Instant settlement</p>
          </div>
          <div className="p-3 rounded-2xl border space-y-1" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
            <p className="text-[11px] text-gray-500 font-semibold">Credit / Khata Pending</p>
            <p className="font-display font-black text-lg text-red-500">₹{totalKhataCredit.toLocaleString("en-IN")}</p>
            <p className="text-[10px] text-gray-400 font-mono">In customer ledgers</p>
          </div>
          <div className="p-3 rounded-2xl border space-y-1" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
            <p className="text-[11px] text-gray-500 font-semibold">Total Items Sold</p>
            <p className="font-display font-black text-lg text-amber-500">{totalItemsSold} pcs</p>
            <p className="text-[10px] text-gray-400 font-mono">Deducted from stock</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex gap-2 flex-wrap items-center">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search Invoice ID (e.g. INV-2847), customer name, or phone..."
            className="flex-1 min-w-48 px-3.5 py-2 rounded-xl text-xs outline-none border shadow-xs"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <div className="flex gap-1.5">
            {(["ALL", "CASH", "UPI", "KHATA"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setPaymentFilter(mode)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  paymentFilter === mode
                    ? "bg-amber-500 border-amber-500 text-white shadow-xs"
                    : "border-transparent bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                {mode === "ALL" ? "All Modes" : mode === "CASH" ? "💵 Cash" : mode === "UPI" ? "📱 UPI" : "💳 Khata"}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-[300px] max-h-[50vh]">
          {/* Bills List Left */}
          <div
            className="md:col-span-6 rounded-2xl border overflow-y-auto divide-y"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            {filteredBills.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-xs font-semibold">
                No matching invoices found.
              </div>
            ) : (
              filteredBills.map(b => {
                const isSelected = selectedBill?.id === b.id
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBill(b)}
                    className={`p-3.5 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-amber-500/10 border-l-4 border-l-amber-500"
                        : "hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-amber-500">{b.id}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            b.paid ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {b.paymentType || (b.paid ? "CASH" : "KHATA")}
                        </span>
                      </div>
                      <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>
                        {b.customer}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {b.time} · {b.items} items
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-sm" style={{ color: "var(--foreground)" }}>
                        ₹{b.total.toLocaleString("en-IN")}
                      </p>
                      <span className="text-[10px] text-gray-400">
                        {isSelected ? "● Viewing" : "Click to view"}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Detailed Inspector Right */}
          <div
            className="md:col-span-6 rounded-2xl border p-4 flex flex-col justify-between overflow-y-auto"
            style={{ background: "var(--muted)", borderColor: "var(--border)" }}
          >
            {selectedBill ? (
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  {/* Bill Top Bar */}
                  <div className="flex items-start justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-black text-lg text-amber-500">{selectedBill.id}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            selectedBill.paid ? "bg-emerald-500/20 text-emerald-600" : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {selectedBill.paid ? "✓ PAID" : "⚠️ UNPAID / KHATA"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        Recorded at {selectedBill.time}
                      </p>
                    </div>

                    <button
                      onClick={() => onPrintBill(selectedBill)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      🖨️ Print Bill
                    </button>
                  </div>

                  {/* Customer Info Box */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-b" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <span className="text-gray-400 text-[10px] block">Customer</span>
                      <strong style={{ color: "var(--foreground)" }}>{selectedBill.customer}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">Contact Number</span>
                      <strong style={{ color: "var(--foreground)" }}>{selectedBill.customerPhone || "Walk-in (No Phone)"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">Payment Method</span>
                      <strong className="font-mono">{selectedBill.paymentType || "CASH"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">Total Quantity</span>
                      <strong className="font-mono">{selectedBill.items} pcs</strong>
                    </div>
                  </div>

                  {/* Line Item breakdown list */}
                  <div className="space-y-1.5 pt-2">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Itemized Line Breakdown:
                    </p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {selectedBill.itemDetails && selectedBill.itemDetails.length > 0 ? (
                        selectedBill.itemDetails.map((it, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-800/80 border text-xs"
                            style={{ borderColor: "var(--border)" }}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="font-bold truncate" style={{ color: "var(--foreground)" }}>
                                {it.product.name}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono">
                                {it.qty} × ₹{it.product.price}
                              </p>
                            </div>
                            <span className="font-mono font-bold text-xs" style={{ color: "var(--foreground)" }}>
                              ₹{it.qty * it.product.price}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-800 border text-xs flex justify-between" style={{ borderColor: "var(--border)" }}>
                          <span>General Merchandise / Items ({selectedBill.items} units)</span>
                          <span className="font-mono font-bold">₹{selectedBill.total}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Total summary */}
                <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Grand Total</span>
                    <span className="font-display font-black text-xl text-amber-500">
                      ₹{selectedBill.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {onDeleteBill && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete invoice ${selectedBill.id}?`)) {
                          onDeleteBill(selectedBill.id)
                        }
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-bold p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer transition-colors"
                      title="Delete invoice record"
                    >
                      🗑️ Delete Bill
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400 text-xs">
                Select an invoice from the list to view detailed breakdown.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
