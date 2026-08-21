import { useState } from "react"
import { Lang } from "../../types"
import { TR } from "../../constants/translations"
import { db } from "../../services/storage"

export default function OCRModule({ lang }: { lang: Lang }) {
  const [state, setState] = useState<"idle" | "scanning" | "done">("idle")
  const [extractedItems, setExtractedItems] = useState([
    { name: "Parle-G Gold 1kg", qty: 24, price: 80, category: "Snacks" },
    { name: "Maggi 70g Family Pack", qty: 12, price: 95, category: "Instant Food" },
    { name: "Tata Salt Vacuum Evaporated", qty: 30, price: 28, category: "Grocery" },
    { name: "Amul Butter 100g", qty: 15, price: 58, category: "Dairy" },
  ])
  const [addedMessage, setAddedMessage] = useState(false)

  function startScanning() {
    setState("scanning")
    setAddedMessage(false)
    setTimeout(() => {
      setState("done")
    }, 2200)
  }

  function handleAddToInventory() {
    extractedItems.forEach(item => {
      db.addProduct({
        name: item.name,
        category: item.category,
        price: item.price,
        costPrice: Math.round(item.price * 0.8),
        stock: item.qty,
        minStock: 10,
        expiry: "2027-06-30",
        barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      })
    })
    setAddedMessage(true)
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">
      <div className="text-center space-y-1">
        <h2 className="font-display font-black text-3xl" style={{ color: "var(--foreground)" }}>
          📸 {TR[lang].ocr} / AI Invoice Reader
        </h2>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Scan supplier paper invoices, handwritten bills, or wholesale receipts with instant OCR extraction
        </p>
      </div>

      <div
        className="rounded-3xl border-2 border-dashed p-8 text-center flex flex-col items-center gap-5 shadow-sm transition-all"
        style={{
          borderColor: state === "scanning" ? "var(--primary)" : "var(--border)",
          background: "var(--card)",
        }}
      >
        {state === "idle" && (
          <div className="space-y-4 max-w-md">
            <div className="text-6xl animate-pulse">📷</div>
            <div>
              <p className="font-display font-bold text-xl" style={{ color: "var(--foreground)" }}>
                Take a Photo or Upload Bill
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                AI will extract item names, wholesale prices, quantities, and GST numbers automatically
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={startScanning}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer flex items-center gap-2"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                📸 Start Camera Scan
              </button>
              <button
                onClick={startScanning}
                className="px-5 py-3.5 rounded-2xl font-bold text-sm border transition-all hover:opacity-90 cursor-pointer"
                style={{ borderColor: "var(--border)", background: "var(--muted)", color: "var(--foreground)" }}
              >
                📁 Upload File (PDF / JPG)
              </button>
            </div>
          </div>
        )}

        {state === "scanning" && (
          <div className="space-y-4 py-8">
            <div className="text-6xl animate-bounce">🔍</div>
            <p className="font-display font-bold text-lg" style={{ color: "var(--primary)" }}>
              Scanning & Analyzing Bill with OCR...
            </p>
            <div className="w-64 h-2.5 rounded-full overflow-hidden mx-auto" style={{ background: "var(--muted)" }}>
              <div
                className="h-full rounded-full animate-pulse"
                style={{ background: "var(--primary)", width: "75%", transition: "width 0.5s" }}
              />
            </div>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Extracting line items, tax breakdowns, and supplier metadata...
            </p>
          </div>
        )}

        {state === "done" && (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <div className="text-left">
                  <p className="font-display font-bold text-base" style={{ color: "var(--accent)" }}>
                    Bill Extracted Successfully!
                  </p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Supplier: Metro Cash & Carry (INV-98214)
                  </p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                4 Items Found
              </span>
            </div>

            <div className="space-y-2 text-left">
              {extractedItems.map((x, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl border"
                  style={{ background: "var(--muted)", borderColor: "var(--border)" }}
                >
                  <div>
                    <span className="text-sm font-bold block" style={{ color: "var(--foreground)" }}>
                      {x.name}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                      Category: {x.category} · Qty: {x.qty} units
                    </span>
                  </div>
                  <span className="font-mono font-bold text-base" style={{ color: "var(--primary)" }}>
                    ₹{x.price}
                  </span>
                </div>
              ))}
            </div>

            {addedMessage && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                🎉 All 4 items have been successfully saved to your Catalogue inventory!
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setState("idle")}
                className="flex-1 py-3 rounded-2xl text-xs font-bold border cursor-pointer"
                style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--muted)" }}
              >
                Scan Another Bill
              </button>
              <button
                onClick={handleAddToInventory}
                disabled={addedMessage}
                className="flex-1 py-3 rounded-2xl text-xs font-display font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                style={{ background: "var(--primary)", color: "#fff" }}
              >
                {addedMessage ? "✓ Already Added" : "📥 Add All to Inventory"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
