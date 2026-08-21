# 🏪 StoreSync Standalone Trade Packages (Hacquire Market)

This directory contains 3 plug-and-play modules extracted from StoreSync, ready to sell or trade with other teams.

---

## 📦 Available Trade Packages

| Package | Folder | Key Capabilities | Best For |
| :--- | :--- | :--- | :--- |
| **1. 🤖 AI Copilot & Chatbot** | [`ai-copilot/`](./ai-copilot/) | Live store queries, offline heuristics, Gemini LLM mode, proactive restock advice | Teams wanting conversational AI & smart assistant |
| **2. 📸 Bill Scanner (OCR)** | [`bill-ocr/`](./bill-ocr/) | Camera & upload receipt OCR, handwritten bill support, 1-click catalogue import | Teams needing automated supplier bill ingestion |
| **3. 🧾 Billing POS & Catalogue** | [`billing-catalogue/`](./billing-catalogue/) | Fast counter checkout, thermal receipt printing, auto-stock deduction, inventory CRUD | Teams needing core POS and inventory operations |

---

## 🚀 How to Hand Over to a Buyer

1. **Zip or Share the Subdirectory**:
   - Send the buyer the folder matching the feature they purchased (e.g. `trade-packages/bill-ocr/`).
2. **Buyer Drops into their React Project**:
   - The buyer copies the component and renders it with `<Module lang="en" />`.
3. **Zero Configuration**:
   - Built with standard React and Tailwind CSS for instant compatibility.
