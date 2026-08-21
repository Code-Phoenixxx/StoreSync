import { useState } from "react"
import { Lang } from "../../types"
import { TR } from "../../constants/translations"

/**
 * ============================================================================
 * MODULE: BILL SCANNER (OCR)
 * OWNER: Person 3 (AI & Smart Systems Specialist)
 * ============================================================================
 * TASKS FOR PERSON 3 TO IMPLEMENT:
 * 1. [ ] Camera scan / Image file upload component.
 * 2. [ ] OCR Engine: Extract line items, quantities, and prices from supplier bills.
 * 3. [ ] Auto-Add to Inventory: Push extracted items directly into `db.addProduct(...)`.
 * ============================================================================
 */

export default function OCRModule({ lang }: { lang: Lang }) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-1 border-b pb-4" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-display font-black text-3xl" style={{ color: "var(--foreground)" }}>
          📸 {TR[lang].ocr} / Bill Scanner
        </h2>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Assigned to: <strong>Person 3 (AI & Smart Systems Specialist)</strong>
        </p>
      </div>

      {/* Developer Tasks Checklist Card */}
      <div
        className="rounded-2xl border p-5 space-y-3"
        style={{ background: "rgba(245,158,11,0.06)", borderColor: "var(--border)" }}
      >
        <h3 className="font-display font-bold text-sm" style={{ color: "var(--primary)" }}>
          🛠️ Person 3 Implementation Checklist:
        </h3>
        <ul className="text-xs space-y-2 font-medium" style={{ color: "var(--foreground)" }}>
          <li>⏳ <strong>Task 1:</strong> Enable <strong>Camera capture / Image upload</strong> file picker.</li>
          <li>⏳ <strong>Task 2:</strong> Implement <strong>OCR Bill extraction</strong> (Tesseract.js / Gemini Vision / Regex parser).</li>
          <li>⏳ <strong>Task 3:</strong> Provide <strong>"Add to Catalogue"</strong> button to insert parsed items into local DB.</li>
        </ul>
      </div>

      {/* Upload Box Starter */}
      <div
        className="rounded-3xl border-2 border-dashed p-10 text-center flex flex-col items-center gap-4 shadow-sm"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="text-5xl">📷</div>
        <p className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
          Scan or Upload Supplier Bill
        </p>
        <p className="text-xs max-w-sm" style={{ color: "var(--muted-foreground)" }}>
          AI will automatically detect printed & handwritten items, costs, and stock quantities.
        </p>

        <button
          onClick={() => alert("TODO: Person 3 to implement OCR Image Upload & Extraction algorithm!")}
          className="px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all hover:opacity-90 cursor-pointer"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          📸 Upload & Scan (TODO: Person 3)
        </button>
      </div>
    </div>
  )
}
