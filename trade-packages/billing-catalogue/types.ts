export type Lang = "en" | "hi" | "bn" | "te" | "ta" | "mr" | "gu" | "kn"

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

export interface Bill {
  id: number
  billNumber: string
  customerName: string
  customerPhone: string
  items: { product: Product; quantity: number; price: number }[]
  total: number
  discount: number
  tax: number
  date: string
  paid: boolean
  paymentMethod: "cash" | "upi" | "khata"
}

export interface Customer {
  id: number
  name: string
  phone: string
  credit: number
  lastVisit: string
}
