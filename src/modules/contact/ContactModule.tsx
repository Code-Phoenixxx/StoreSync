import { useState } from "react"
import { Lang } from "../../types"
import { TR } from "../../constants/translations"

export default function ContactModule({ lang }: { lang: Lang }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 4000)
    setForm({ name: "", email: "", message: "" })
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>
          📞 {TR[lang].contact} & Shopkeeper Helpdesk
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
          24/7 dedicated support for billing, hardware printers, barcode scanners, and inventory sync
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact info cards */}
        <div className="space-y-4">
          <div className="rounded-3xl p-6 shadow-lg" style={{ background: "var(--secondary)" }}>
            <h3 className="font-display font-bold text-xl text-white mb-4">StoreSyncOS Merchant Care</h3>
            <div className="space-y-3.5">
              {[
                { icon: "📞", label: "Toll-Free Support Helpline", value: "1800-STORE-SYNC (Toll Free)" },
                { icon: "📧", label: "Support Email", value: "help@storesyncos.in" },
                { icon: "💬", label: "Instant WhatsApp Merchant Group", value: "+91 98765 00000" },
                { icon: "🕐", label: "Operating Hours", value: "Mon–Sat, 8:00 AM – 9:00 PM IST" },
              ].map(x => (
                <div key={x.label} className="flex items-center gap-3">
                  <span className="text-2xl">{x.icon}</span>
                  <div>
                    <p className="text-[11px] opacity-70 text-white">{x.label}</p>
                    <p className="text-sm font-semibold text-white">{x.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border p-5 shadow-sm space-y-2" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="font-display font-bold text-sm" style={{ color: "var(--foreground)" }}>
              ⚡ Quick Merchant Guides
            </h3>
            {[
              "How to connect USB/Bluetooth thermal receipt printer?",
              "How to backup offline database to Google Drive?",
              "How to scan barcode using mobile camera?",
              "How to add GST percentage on POS invoices?",
            ].map(q => (
              <button
                key={q}
                onClick={() => alert(`Opening knowledge guide for: ${q}`)}
                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between border transition-all hover:opacity-80 cursor-pointer"
                style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                {q} <span style={{ color: "var(--primary)" }}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border p-6 space-y-4 shadow-sm"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <h3 className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
            {TR[lang].sendMessage}
          </h3>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
              {TR[lang].yourName} *
            </label>
            <input
              required
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Ramesh Sharma"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
              {TR[lang].email} (or Phone Number) *
            </label>
            <input
              required
              type="text"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="ramesh@gmail.com or 9876543210"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
              {TR[lang].message} *
            </label>
            <textarea
              required
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              rows={4}
              placeholder="Describe your issue or feature request..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          {sent && (
            <div className="px-4 py-3 rounded-xl text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              ✅ Message sent! Our team will contact you within 24 hours.
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl font-display font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            {TR[lang].send} →
          </button>
        </form>
      </div>
    </div>
  )
}
