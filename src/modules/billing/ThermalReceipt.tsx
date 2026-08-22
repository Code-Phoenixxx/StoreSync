import React, { useState } from "react"
import { Bill, ShopInfo } from "../../types"

interface ThermalReceiptProps {
  bill: Bill
  shopInfo: ShopInfo
  onClose: () => void
}

export default function ThermalReceipt({ bill, shopInfo, onClose }: ThermalReceiptProps) {
  const [paperWidth, setPaperWidth] = useState<"80mm" | "58mm">("80mm")
  const [copied, setCopied] = useState(false)

  // Fallback if opening an older bill without itemDetails
  const items =
    bill.itemDetails && bill.itemDetails.length > 0
      ? bill.itemDetails
      : [
          {
            product: {
              id: 1,
              name: "General Merchandise / Store Items",
              category: "General",
              price: Math.round((bill.total || 100) / Math.max(1, bill.items || 1)),
              stock: 50,
              minStock: 5,
              expiry: "2027-12-31",
              barcode: "8901234567890",
            },
            qty: bill.items || 1,
          },
        ]

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.qty, 0)
  const gstRate = 0.05 // 5% GST display
  const gstAmount = Math.round(subtotal * gstRate)
  const grandTotal = bill.total || subtotal

  const is58 = paperWidth === "58mm"


  function handlePrint() {
    window.print()
  }

  function handleCopyText() {
    const textReceipt = `
================================
     ${shopInfo.shopName.toUpperCase()}
   ${shopInfo.ownerName ? `Prop: ${shopInfo.ownerName}` : "Retail & Wholesale Store"}
   Phone: ${shopInfo.phone || "+91 98765 43210"}
================================
INVOICE: ${bill.id}
DATE: ${new Date().toLocaleDateString("en-IN")} ${bill.time}
CUSTOMER: ${bill.customer}
${bill.customerPhone ? `PHONE: ${bill.customerPhone}` : ""}
PAYMENT: ${bill.paymentType || "PAID"}
--------------------------------
ITEM               QTY    PRICE   AMT
--------------------------------
${items
  .map(
    it =>
      `${it.product.name.slice(0, 16).padEnd(16)} ${String(it.qty).padStart(3)}  ${String(
        it.product.price
      ).padStart(6)}  ${String(it.qty * it.product.price).padStart(6)}`
  )
  .join("\n")}
--------------------------------
TOTAL ITEMS: ${bill.items || items.length}
GRAND TOTAL: ₹${grandTotal}
PAYMENT STATUS: ${bill.paid ? "PAID [COMPLETED]" : "KHATA [CREDIT]"}
================================
   THANK YOU! VISIT AGAIN
  Powered by StoreSync
================================
`.trim()

    navigator.clipboard.writeText(textReceipt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div
      className="thermal-receipt-modal fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 max-h-[95vh] my-auto">
        {/* Paper Container */}
        <div
          className={`thermal-receipt-paper ${is58 ? "paper-58mm" : ""} bg-white text-black font-mono shadow-2xl rounded-sm p-4 transition-all overflow-y-auto max-h-[85vh] select-text`}
          style={{
            width: is58 ? "280px" : "360px",
            color: "#000000",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-gray-400 pb-3">
            <h1 className="font-bold text-base tracking-wider uppercase leading-tight font-mono">
              {shopInfo.shopName || "STORESYNC RETAIL"}
            </h1>
            <p className="text-[11px] leading-tight text-gray-700">
              {shopInfo.ownerName ? `Prop: ${shopInfo.ownerName}` : "General Merchant & Kirana"}
            </p>
            <p className="text-[11px] text-gray-600">
              📞 {shopInfo.phone || "+91 98765 43210"}
            </p>
            <p className="text-[10px] tracking-widest text-gray-500 font-semibold mt-1">
              ** TAX INVOICE / RETAIL MEMO **
            </p>
          </div>

          {/* Bill Metadata */}
          <div className="py-2 text-[11px] border-b border-dashed border-gray-400 space-y-0.5 leading-snug">
            <div className="flex justify-between">
              <span className="text-gray-600">Bill ID:</span>
              <span className="font-bold">{bill.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date/Time:</span>
              <span>{new Date().toLocaleDateString("en-IN")} · {bill.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-bold truncate max-w-[170px]">{bill.customer}</span>
            </div>
            {bill.customerPhone && (
              <div className="flex justify-between">
                <span className="text-gray-600">Contact:</span>
                <span>{bill.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Payment:</span>
              <span className="font-bold px-1.5 py-0.2 bg-black text-white text-[10px] rounded-xs">
                {bill.paymentType || "CASH"}
              </span>
            </div>
          </div>

          {/* Table Header */}
          <div className="py-2 border-b border-dashed border-gray-400 text-[11px] font-bold flex justify-between">
            <span className="w-1/2">Item</span>
            <span className="w-1/4 text-center">Qty</span>
            <span className="w-1/4 text-right">Amt (₹)</span>
          </div>

          {/* Item Rows */}
          <div className="py-2 border-b border-dashed border-gray-400 space-y-1.5 text-[11px] leading-snug">
            {items.map((it, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-900 leading-tight w-7/12 break-words">
                    {it.product.name}
                  </span>
                  <span className="w-2/12 text-center text-gray-600">{it.qty}</span>
                  <span className="w-3/12 text-right font-bold">
                    ₹{it.qty * it.product.price}
                  </span>
                </div>
                <div className="text-[9px] text-gray-500 pl-1">
                  @{it.product.price}/unit
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
            <div className="flex justify-between text-gray-700">
              <span>Total Items / Qty:</span>
              <span>{bill.items} pcs</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>GST (Included):</span>
              <span>₹{gstAmount}</span>
            </div>
            <div className="border-t border-dashed border-gray-300 pt-1 mt-1 flex justify-between text-sm font-black tracking-wide">
              <span>NET TOTAL:</span>
              <span className="text-base">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-600 pt-0.5">
              <span>Status:</span>
              <span className="font-bold">{bill.paid ? "PAID FULL" : "CREDIT DUE (KHATA)"}</span>
            </div>
          </div>

          {/* Barcode Mock & Footer */}
          <div className="pt-3 text-center space-y-2">
            {/* Visual Barcode */}
            <div className="flex flex-col items-center justify-center">
              <svg className="w-44 h-10 overflow-hidden" viewBox="0 0 200 45">
                <rect x="0" y="0" width="200" height="45" fill="#ffffff" />
                <g fill="#000000">
                  <rect x="10" y="5" width="2" height="30" />
                  <rect x="14" y="5" width="3" height="30" />
                  <rect x="19" y="5" width="1" height="30" />
                  <rect x="23" y="5" width="4" height="30" />
                  <rect x="30" y="5" width="2" height="30" />
                  <rect x="34" y="5" width="2" height="30" />
                  <rect x="38" y="5" width="5" height="30" />
                  <rect x="46" y="5" width="2" height="30" />
                  <rect x="50" y="5" width="3" height="30" />
                  <rect x="55" y="5" width="1" height="30" />
                  <rect x="59" y="5" width="4" height="30" />
                  <rect x="66" y="5" width="2" height="30" />
                  <rect x="71" y="5" width="3" height="30" />
                  <rect x="76" y="5" width="1" height="30" />
                  <rect x="80" y="5" width="5" height="30" />
                  <rect x="88" y="5" width="2" height="30" />
                  <rect x="93" y="5" width="3" height="30" />
                  <rect x="98" y="5" width="2" height="30" />
                  <rect x="103" y="5" width="4" height="30" />
                  <rect x="110" y="5" width="2" height="30" />
                  <rect x="115" y="5" width="1" height="30" />
                  <rect x="118" y="5" width="4" height="30" />
                  <rect x="125" y="5" width="3" height="30" />
                  <rect x="130" y="5" width="2" height="30" />
                  <rect x="135" y="5" width="4" height="30" />
                  <rect x="142" y="5" width="1" height="30" />
                  <rect x="145" y="5" width="3" height="30" />
                  <rect x="151" y="5" width="2" height="30" />
                  <rect x="155" y="5" width="4" height="30" />
                  <rect x="162" y="5" width="2" height="30" />
                  <rect x="166" y="5" width="3" height="30" />
                  <rect x="172" y="5" width="2" height="30" />
                  <rect x="177" y="5" width="4" height="30" />
                  <rect x="184" y="5" width="2" height="30" />
                  <rect x="188" y="5" width="3" height="30" />
                </g>
                <text x="100" y="42" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#000">
                  {bill.id}
                </text>
              </svg>
            </div>

            <p className="text-[10px] text-gray-700 font-semibold">
              🙏 Thank You! Visit Again 🙏
            </p>
            <p className="text-[8px] text-gray-500">
              Goods once sold cannot be returned without original receipt.
            </p>
          </div>
        </div>

        {/* Right Controller Panel (Excluded from print) */}
        <div className="no-print bg-neutral-900 border border-neutral-700 text-white rounded-2xl p-4 sm:p-5 space-y-4 w-full sm:w-80 shadow-2xl">
          <div className="flex justify-between items-center border-b border-neutral-700 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white">🖨️ Print Bill Settings</h3>
              <p className="text-xs text-neutral-400">Ready for printer & PDF</p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white text-lg font-bold p-1"
            >
              ✕
            </button>
          </div>

          {/* Paper Size selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Bill Paper Size</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaperWidth("80mm")}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  paperWidth === "80mm"
                    ? "bg-amber-500 border-amber-400 text-black shadow-md"
                    : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                80mm (Standard POS)
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth("58mm")}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  paperWidth === "58mm"
                    ? "bg-amber-500 border-amber-400 text-black shadow-md"
                    : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                58mm (Compact)
              </button>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-neutral-800/80 rounded-xl p-3 space-y-1 text-xs text-neutral-300 border border-neutral-700/50 font-mono">
            <div className="flex justify-between">
              <span>Invoice #:</span>
              <span className="text-amber-400 font-bold">{bill.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="text-emerald-400 font-bold">₹{grandTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold">{bill.paymentType || "CASH"}</span>
            </div>
            <div className="flex justify-between">
              <span>Inventory Sync:</span>
              <span className="text-emerald-400">✓ Deducted</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handlePrint}
              className="w-full py-3 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              🖨️ Print Bill
            </button>

            <button
              onClick={handleCopyText}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {copied ? "✅ Copied to Clipboard!" : "📋 Copy Bill (SMS / WhatsApp)"}
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-transparent hover:bg-neutral-800 text-neutral-400 transition-all cursor-pointer text-center"
            >
              Done / Close
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
