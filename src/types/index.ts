export type Screen = "welcome" | "language" | "login" | "app"
export type Lang = "en" | "hi" | "bn" | "te" | "ta" | "mr" | "gu" | "kn"
export type Theme = "light" | "dark" | "saffron"
export type Module =
  | "dashboard" | "catalogue" | "billing" | "pos" | "khata" | "ocr"
  | "supplier" | "analytics" | "copilot" | "voice" | "vexyl_stt" | "settings" | "contact"

export interface Product {
  id: number
  name: string
  category: string
  price: number
  costPrice?: number
  stock: number
  minStock: number
  expiry: string
  barcode: string
}

export interface Customer {
  id: number
  name: string
  phone: string
  credit: number
  lastVisit: string
}

export interface BillItem {
  product: Product
  qty: number
}

export interface Bill {
  id: string
  customer: string
  customerPhone?: string
  items: number
  total: number
  time: string
  paid: boolean
  paymentType?: "CASH" | "UPI" | "KHATA"
  itemDetails?: BillItem[]
}

export interface Supplier {
  id: number
  name: string
  category: string
  rating: number
  lastOrder: string
  contact: string
  email?: string
  address?: string
  balanceDue?: number
}

export interface AISuggestion {
  type: "restock" | "expiry" | "insight" | "credit"
  icon: string
  title: string
  desc: string
  priority: "high" | "medium" | "low"
}

export interface ShopInfo {
  shopName: string
  shopType?: string
  ownerName: string
  phone?: string
  currency?: string
  pin?: string
  token?: string
  createdAt?: string
}

export interface AuthSession {
  isAuthenticated: boolean
  shopInfo: ShopInfo
  token?: string
  lastActive?: string
}

export interface ChatMessage {
  id?: string
  role: "user" | "assistant"
  text: string
  timestamp?: string
}
