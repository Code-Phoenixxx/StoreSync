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
