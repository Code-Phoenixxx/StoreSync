# 📸 StoreSync Optical Receipt & Supplier Bill Scanner (OCR)

An intelligent, plug-and-play **Optical Character Recognition (OCR) Bill Ingestion System** designed for retail stores and kirana merchants.

---

## ✨ Features Included
- **Multiple Capture Modes**:
  - **📁 File Upload**: Drag-and-drop or file browser for JPG, PNG, PDF, or WebP receipts.
  - **📷 Live Camera**: Direct webcam/phone camera scanner with alignment viewfinder frame.
- **AI Optical Parsing Engine**:
  - Automatically extracts: **Supplier Name**, **Invoice Number**, **Date**, **Items**, **Quantities**, **Wholesale Cost**, and **Suggested Retail Price**.
  - Dual support for **Gemini 1.5 Flash Vision AI** and **Offline Heuristics**.
  - Supports **Handwritten Mandi / Local Parchi** receipts!
- **Interactive Verification Matrix**:
  - Editable spreadsheet-style table to adjust product names, wholesale rates, quantities, and selling prices.
  - Live profit margin calculator (`+25%`, `+18%`).
  - Add / Delete line items.
- **1-Click "📦 Add to Catalogue"**:
  - Automatically inserts new products or updates existing stock in the database with one click.

---

## 🔌 2-Minute Quick Integration

### 1. Copy Files
Copy the `OCRModule.tsx` and `types.ts` into your project:
```
src/modules/ocr/
  ├── OCRModule.tsx
```

### 2. Import and Use in Any React Component
```tsx
import OCRModule from "./modules/ocr/OCRModule"

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <OCRModule lang="en" />
    </div>
  )
}
```

### 3. Dependencies
- React 18 / 19
- Tailwind CSS (v3 or v4)
- Native Browser WebCam API (`navigator.mediaDevices.getUserMedia`)
