# 🧾 StoreSync Retail Billing POS & 📦 Inventory Catalogue

A complete, battle-tested, offline-first **Point-of-Sale (POS) Checkout & Inventory Management System** built for fast counter operations.

---

## ✨ Features Included

### 1. 🧾 Point-of-Sale (POS) & Billing
- **Fast Product Search & Category Pills**: Real-time product search, barcode scanner integration, and quick category filtering.
- **Cart Management**: Real-time quantity adjustments, discount controls, and automatic itemized subtotal calculations.
- **Multiple Checkout Modes**:
  - 💵 **Cash Checkout**
  - 📱 **UPI QR Code**
  - 💳 **Khata Credit Ledger** (auto-records customer debt)
- **🖨️ Thermal Receipt Printing**:
  - Pixel-perfect 58mm / 80mm ESC/POS thermal receipt formatting for USB/Bluetooth thermal printers and PDF print dialog.
- **📜 Past Bill Inspector**:
  - Search past invoices, reprint receipts, and track daily sales volume.

### 2. 📦 Inventory Catalogue Management
- **Full Inventory CRUD**: Add, edit, delete products with category, cost price, retail price, safety stock, and barcode.
- **Auto Stock Deduction**: Automatically decreases stock counts on every POS checkout.
- **Low Stock & Expiry Alerts**: Color-coded badges for products running low on safety stock.

---

## 🔌 2-Minute Quick Integration

### 1. Copy Files
Copy the `billing/` and `catalogue/` folders into your project:
```
src/modules/
  ├── billing/
  │   ├── BillingModule.tsx
  │   ├── ThermalReceipt.tsx
  │   ├── BillHistoryModal.tsx
  │   └── ScanBillModal.tsx
  └── catalogue/
      └── CatalogueModule.tsx
```

### 2. Import and Use
```tsx
import BillingModule from "./modules/billing/BillingModule"
import CatalogueModule from "./modules/catalogue/CatalogueModule"

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      {/* Billing POS */}
      <BillingModule lang="en" />

      {/* Inventory Catalogue */}
      <CatalogueModule lang="en" />
    </div>
  )
}
```

### 3. Dependencies
- React 18 / 19
- Tailwind CSS (v3 or v4)
