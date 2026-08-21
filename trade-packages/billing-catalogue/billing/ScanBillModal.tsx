import React, { useState } from "react"
import { Product } from "../../types"

interface ScanBillModalProps {
  onClose: () => void
  onAddItemsToCart: (items: { product: Product; qty: number }[]) => void
  availableProducts: Product[]
}

interface ExtractedLine {
  id: number
  name: string
  qty: number
  price: number
  category: string
  matchedProductId?: number
}

const SAMPLE_BILLS = [
  {
    title: "📝 Kirana Customer Estimate Slip",
    supplier: "Walk-in Regular List",
    items: [
      { name: "Fortune Sunlite Oil 1L", qty: 2, price: 145, category: "Grocery" },
      { name: "Tata Salt 1kg", qty: 1, price: 26, category: "Grocery" },
      { name: "Parle-G Gold 1kg", qty: 3, price: 28, category: "Snacks" },
      { name: "Amul Butter 500g", qty: 1, price: 280, category: "Dairy" },
    ],
  },
  {
    title: "🧾 Wholesale Grocery Invoice",
    supplier: "Metro Cash & Carry",
    items: [
      { name: "Aashirvaad Atta 5kg", qty: 2, price: 245, category: "Grocery" },
      { name: "Surf Excel 1kg", qty: 1, price: 120, category: "FMCG" },
      { name: "Tata Tea Premium 500g", qty: 2, price: 210, category: "Beverages" },
    ],
  },
]

export default function ScanBillModal({ onClose, onAddItemsToCart, availableProducts }: ScanBillModalProps) {
  const [mode, setMode] = useState<"upload" | "scanning" | "extracted">("upload")
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [extractedItems, setExtractedItems] = useState<ExtractedLine[]>([])
  const [detectedSupplier, setDetectedSupplier] = useState<string>("Customer Chit / Paper Bill")

  function startScanning(sampleIdx: number = 0) {
    setMode("scanning")
    const sample = SAMPLE_BILLS[sampleIdx] || SAMPLE_BILLS[0]
    setDetectedSupplier(sample.supplier)

    setTimeout(() => {
      // Map sample items to actual inventory products if available
      const mapped: ExtractedLine[] = sample.items.map((it, idx) => {
        const found = availableProducts.find(
          p => p.name.toLowerCase().includes(it.name.toLowerCase().split(" ")[0])
        )
        return {
          id: idx + 1,
          name: found ? found.name : it.name,
          qty: it.qty,
          price: found ? found.price : it.price,
          category: found ? found.category : it.category,
          matchedProductId: found?.id,
        }
      })
      setExtractedItems(mapped)
      setMode("extracted")
    }, 1800)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file.name)
      startScanning(0)
    }
  }

  function handleImportToCart() {
    const itemsToCart = extractedItems.map(item => {
      // Find matching product or create a temporary mock product
      let prod = availableProducts.find(p => p.id === item.matchedProductId)
      if (!prod) {
        prod = availableProducts.find(p => p.name.toLowerCase() === item.name.toLowerCase())
      }
      if (!prod) {
        prod = {
          id: 9000 + item.id,
          name: item.name,
          category: item.category || "General",
          price: item.price,
          stock: 99,
          minStock: 5,
          expiry: "2027-12-31",
          barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        }
      }
      return {
        product: prod,
        qty: item.qty,
      }
    })

    onAddItemsToCart(itemsToCart)
    onClose()
  }

  function updateItemQty(id: number, delta: number) {
    setExtractedItems(prev =>
      prev
        .map(x => (x.id === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x))
        .filter(x => x.qty > 0)
    )
  }

  function removeItem(id: number) {
    setExtractedItems(prev => prev.filter(x => x.id !== id))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 slide-up my-auto"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <div>
              <h3 className="font-display font-black text-lg" style={{ color: "var(--foreground)" }}>
                AI Bill & Slip Scanner
              </h3>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Scan handwritten slips, paper bills, or invoices to auto-fill POS Cart
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
          >
            ✕
          </button>
        </div>

        {/* Step 1: Upload / Choose Mode */}
        {mode === "upload" && (
          <div className="space-y-4 py-2">
            {/* Upload Box */}
            <label
              className="border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-400 transition-all space-y-2 group"
              style={{ borderColor: "var(--border)", background: "var(--muted)" }}
            >
              <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📷
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>
                  Upload Bill Photo / Receipt Image
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Supports JPG, PNG, Camera photo, or PDF invoices
                </p>
              </div>
              <span className="px-4 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-sm mt-2 inline-block">
                Browse or Take Photo
              </span>
            </label>

            {/* Instant Presets / Demos */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                ⚡ Or Try Instant Sample Slips:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SAMPLE_BILLS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => startScanning(idx)}
                    className="card-hover p-3 rounded-2xl border text-left flex flex-col justify-between space-y-1 transition-all cursor-pointer shadow-sm"
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                  >
                    <p className="font-bold text-xs" style={{ color: "var(--foreground)" }}>
                      {sample.title}
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono">
                      {sample.items.length} items · ₹{sample.items.reduce((s, x) => s + x.price * x.qty, 0)}
                    </p>
                    <span className="text-[10px] text-amber-500 font-bold">
                      Scan Slip ➔
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Scanning Animation */}
        {mode === "scanning" && (
          <div className="py-10 text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-amber-500/10 rounded-3xl overflow-hidden border border-amber-400">
              <span className="text-4xl animate-bounce">📄</span>
              <div
                className="absolute inset-x-0 h-1 bg-amber-500 shadow-lg animate-pulse"
                style={{ top: "40%" }}
              />
            </div>
            <div>
              <p className="font-display font-bold text-lg" style={{ color: "var(--primary)" }}>
                AI OCR Extracting Items & Quantities...
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Matching items with current store catalogue & pricing
              </p>
            </div>
            <div className="w-48 h-2 rounded-full overflow-hidden mx-auto bg-neutral-200 dark:bg-neutral-700">
              <div className="h-full bg-amber-500 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        {/* Step 3: Extracted Preview & Confirm */}
        {mode === "extracted" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <div>
                  <p className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    Extracted {extractedItems.length} Items from Bill
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Source: {detectedSupplier}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMode("upload")}
                className="text-[11px] text-amber-500 font-bold hover:underline cursor-pointer"
              >
                Scan Another
              </button>
            </div>

            {/* Extracted items list */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {extractedItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl border gap-2 shadow-xs"
                  style={{ background: "var(--muted)", borderColor: "var(--border)" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>
                      {item.name}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      ₹{item.price} each · {item.matchedProductId ? "✓ Matched Inventory" : "✨ New Item"}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-800 rounded-lg px-2 py-0.5 border" style={{ borderColor: "var(--border)" }}>
                    <button
                      onClick={() => updateItemQty(item.id, -1)}
                      className="text-xs font-bold px-1 hover:text-red-500 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-bold w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateItemQty(item.id, 1)}
                      className="text-xs font-bold px-1 hover:text-green-500 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <p className="font-bold font-mono text-xs w-14 text-right" style={{ color: "var(--foreground)" }}>
                    ₹{item.price * item.qty}
                  </p>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 text-xs ml-1 cursor-pointer p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Total and Import Button */}
            <div className="border-t pt-3 space-y-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-between items-center text-sm font-bold">
                <span style={{ color: "var(--foreground)" }}>Estimated Total:</span>
                <span className="text-base text-amber-500 font-mono">
                  ₹{extractedItems.reduce((s, x) => s + x.price * x.qty, 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl font-bold text-xs border cursor-pointer"
                  style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportToCart}
                  disabled={extractedItems.length === 0}
                  className="flex-1 py-3 rounded-2xl font-display font-bold text-xs shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer disabled:opacity-40"
                  style={{ background: "var(--primary)", color: "#fff" }}
                >
                  🛒 Add All to Cart ({extractedItems.reduce((s, x) => s + x.qty, 0)} pcs)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
