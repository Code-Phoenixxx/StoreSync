import { AuthSession, Bill, Customer, Product, ShopInfo, Supplier } from "../types"
import { INITIAL_CUSTOMERS, INITIAL_PRODUCTS, INITIAL_SUPPLIERS } from "../constants/translations"
import { cloudApi } from "./api"

const KEYS = {
  PRODUCTS: "dukaanos_products_v1",
  CUSTOMERS: "dukaanos_customers_v1",
  SUPPLIERS: "dukaanos_suppliers_v1",
  BILLS: "dukaanos_bills_v1",
  SHOP_INFO: "dukaanos_shop_info_v1",
  AUTH_SESSION: "dukaanos_auth_session_v1",
  SYNC_QUEUE: "dukaanos_sync_queue_v1",
}

class StorageService {
  private syncListeners: ((status: boolean) => void)[] = []
  private online: boolean = typeof navigator !== "undefined" ? navigator.onLine : true

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.online = true
        this.notifySync(true)
        this.flushSyncQueue()
      })
      window.addEventListener("offline", () => {
        this.online = false
        this.notifySync(false)
      })
    }
  }

  public isOnline(): boolean {
    return this.online
  }

  public onSyncStatusChange(cb: (online: boolean) => void) {
    this.syncListeners.push(cb)
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== cb)
    }
  }

  private notifySync(online: boolean) {
    this.syncListeners.forEach(cb => cb(online))
  }

  // ── Authentication & Session Persistence ──────────────────────────────────
  public getSession(): AuthSession {
    try {
      const data = localStorage.getItem(KEYS.AUTH_SESSION)
      if (data) return JSON.parse(data)
    } catch {}

    const shopInfo = this.getShopInfo()
    return {
      isAuthenticated: false,
      shopInfo,
    }
  }

  public saveSession(shopInfo: ShopInfo, token?: string): AuthSession {
    const session: AuthSession = {
      isAuthenticated: true,
      shopInfo,
      token: token || `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      lastActive: new Date().toISOString(),
    }
    localStorage.setItem(KEYS.AUTH_SESSION, JSON.stringify(session))
    this.saveShopInfo(shopInfo)
    return session
  }

  public clearSession(): void {
    localStorage.removeItem(KEYS.AUTH_SESSION)
  }

  public hasActiveSession(): boolean {
    return this.getSession().isAuthenticated
  }

  // ── Sync Queue (Offline-First Buffer) ──────────────────────────────────────
  private queueAction(action: { type: string; payload: unknown }) {
    const queue = this.getSyncQueue()
    queue.push({ ...action, timestamp: new Date().toISOString() })
    localStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue))
  }

  public getSyncQueue(): { type: string; payload: unknown; timestamp: string }[] {
    try {
      const data = localStorage.getItem(KEYS.SYNC_QUEUE)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  public async flushSyncQueue(): Promise<void> {
    if (!this.online) return
    const queue = this.getSyncQueue()
    if (queue.length === 0) return

    console.log(`[DukaanOS Sync Engine] Flushing ${queue.length} pending transactions to cloud database...`)
    
    // Attempt cloud push
    const success = await cloudApi.syncBatch(queue)
    if (success || !import.meta.env.VITE_API_URL) {
      localStorage.removeItem(KEYS.SYNC_QUEUE)
      console.log(`[DukaanOS Sync Engine] Sync batch completed successfully.`)
    }
  }

  // ── Shop Info ──────────────────────────────────────────────────────────────
  public getShopInfo(): ShopInfo {
    try {
      const data = localStorage.getItem(KEYS.SHOP_INFO)
      return data ? JSON.parse(data) : { shopName: "My Shop", ownerName: "Shopkeeper" }
    } catch {
      return { shopName: "My Shop", ownerName: "Shopkeeper" }
    }
  }

  public saveShopInfo(info: ShopInfo): void {
    localStorage.setItem(KEYS.SHOP_INFO, JSON.stringify(info))
    this.queueAction({ type: "SAVE_SHOP_INFO", payload: info })
    if (this.online) {
      cloudApi.updateShopInfo(info).catch(() => {})
    }
  }

  // ── Products (Catalogue) ───────────────────────────────────────────────────
  public getProducts(): Product[] {
    try {
      const data = localStorage.getItem(KEYS.PRODUCTS)
      if (data) return JSON.parse(data)
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS))
      return INITIAL_PRODUCTS
    } catch {
      return INITIAL_PRODUCTS
    }
  }

  public addProduct(product: Omit<Product, "id">): Product {
    const products = this.getProducts()
    const newProduct: Product = {
      ...product,
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    }
    const updated = [newProduct, ...products]
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated))
    this.queueAction({ type: "ADD_PRODUCT", payload: newProduct })

    if (this.online) {
      cloudApi.createProduct(product).catch(() => {})
    }

    return newProduct
  }

  public updateProduct(id: number, updates: Partial<Product>): Product[] {
    const products = this.getProducts()
    const updated = products.map(p => (p.id === id ? { ...p, ...updates } : p))
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated))
    this.queueAction({ type: "UPDATE_PRODUCT", payload: { id, updates } })

    if (this.online) {
      cloudApi.updateProduct(id, updates).catch(() => {})
    }

    return updated
  }

  public deleteProduct(id: number): Product[] {
    const products = this.getProducts()
    const updated = products.filter(p => p.id !== id)
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated))
    this.queueAction({ type: "DELETE_PRODUCT", payload: { id } })

    if (this.online) {
      cloudApi.deleteProduct(id).catch(() => {})
    }

    return updated
  }

  public deductStock(items: { productId: number; qty: number }[]): Product[] {
    const products = this.getProducts()
    const updated = products.map(p => {
      const sold = items.find(i => i.productId === p.id)
      if (sold) {
        return { ...p, stock: Math.max(0, p.stock - sold.qty) }
      }
      return p
    })
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(updated))
    this.queueAction({ type: "DEDUCT_STOCK", payload: items })
    return updated
  }

  // ── Bills & POS ────────────────────────────────────────────────────────────
  public getBills(): Bill[] {
    try {
      const data = localStorage.getItem(KEYS.BILLS)
      if (data) return JSON.parse(data)
      const initialBills: Bill[] = [
        {
          id: "INV-2847",
          customer: "Ramesh Sharma",
          items: 4,
          total: 342,
          time: "10:24 AM",
          paid: true,
          paymentType: "CASH",
          itemDetails: [
            { product: { id: 1, name: "Fortune Sunlite Oil 1L", category: "Grocery", price: 145, stock: 40, minStock: 5, expiry: "2027-01-01", barcode: "8901234567890" }, qty: 2 },
            { product: { id: 2, name: "Tata Salt 1kg", category: "Grocery", price: 26, stock: 50, minStock: 10, expiry: "2028-01-01", barcode: "8901234567891" }, qty: 2 },
          ],
        },
        {
          id: "INV-2848",
          customer: "Walk-in",
          items: 2,
          total: 56,
          time: "11:05 AM",
          paid: true,
          paymentType: "UPI",
          itemDetails: [
            { product: { id: 3, name: "Parle-G Gold 1kg", category: "Snacks", price: 28, stock: 60, minStock: 10, expiry: "2027-06-01", barcode: "8901234567892" }, qty: 2 },
          ],
        },
        {
          id: "INV-2849",
          customer: "Sunita Devi",
          items: 7,
          total: 890,
          time: "12:30 PM",
          paid: false,
          paymentType: "KHATA",
          itemDetails: [
            { product: { id: 4, name: "Aashirvaad Atta 5kg", category: "Grocery", price: 245, stock: 20, minStock: 5, expiry: "2027-04-01", barcode: "8901234567893" }, qty: 2 },
            { product: { id: 5, name: "Amul Butter 500g", category: "Dairy", price: 280, stock: 15, minStock: 5, expiry: "2026-10-01", barcode: "8901234567894" }, qty: 1 },
            { product: { id: 6, name: "Surf Excel 1kg", category: "FMCG", price: 120, stock: 30, minStock: 5, expiry: "2028-01-01", barcode: "8901234567895" }, qty: 1 },
          ],
        },
      ]
      localStorage.setItem(KEYS.BILLS, JSON.stringify(initialBills))
      return initialBills
    } catch {
      return []
    }
  }

  public createBill(billData: {
    customer: string
    customerPhone?: string
    items: { product: Product; qty: number }[]
    paymentType: "CASH" | "UPI" | "KHATA"
  }): { bill: Bill; updatedProducts: Product[] } {
    const total = billData.items.reduce((s, x) => s + x.product.price * x.qty, 0)
    const newBill: Bill = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: billData.customer || "Walk-in",
      customerPhone: billData.customerPhone,
      items: billData.items.reduce((s, x) => s + x.qty, 0),
      total,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      paid: billData.paymentType !== "KHATA",
      paymentType: billData.paymentType,
      itemDetails: billData.items,
    }

    // Save Bill locally
    const bills = this.getBills()
    const updatedBills = [newBill, ...bills]
    localStorage.setItem(KEYS.BILLS, JSON.stringify(updatedBills))

    // Automatically deduct stock from catalogue
    const updatedProducts = this.deductStock(
      billData.items.map(i => ({ productId: i.product.id, qty: i.qty }))
    )

    // If Khata payment, add to customer credit
    if (billData.paymentType === "KHATA" && billData.customer) {
      this.addCustomerCredit(billData.customer, billData.customerPhone || "", total)
    }

    this.queueAction({ type: "CREATE_BILL", payload: newBill })

    if (this.online) {
      cloudApi.createBill(newBill).catch(() => {})
    }

    return { bill: newBill, updatedProducts }
  }

  public deleteBill(id: string): Bill[] {
    const bills = this.getBills()
    const updated = bills.filter(b => b.id !== id)
    localStorage.setItem(KEYS.BILLS, JSON.stringify(updated))
    this.queueAction({ type: "DELETE_BILL", payload: { id } })
    return updated
  }


  // ── Khata (Customers) ──────────────────────────────────────────────────────
  public getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(KEYS.CUSTOMERS)
      if (data) return JSON.parse(data)
      localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS))
      return INITIAL_CUSTOMERS
    } catch {
      return INITIAL_CUSTOMERS
    }
  }

  public addCustomerCredit(name: string, phone: string, amount: number): Customer[] {
    const customers = this.getCustomers()
    const existing = customers.find(c => c.name.toLowerCase() === name.toLowerCase() || (phone && c.phone === phone))
    let updated: Customer[]

    if (existing) {
      updated = customers.map(c => (c.id === existing.id ? { ...c, credit: c.credit + amount, lastVisit: "Today" } : c))
    } else {
      const newCustomer: Customer = {
        id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
        name,
        phone: phone || "N/A",
        credit: amount,
        lastVisit: "Today",
      }
      updated = [newCustomer, ...customers]
    }

    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(updated))
    this.queueAction({ type: "UPDATE_KHATA", payload: { name, phone, amount } })

    if (this.online) {
      cloudApi.updateKhataCredit(name, phone, amount).catch(() => {})
    }

    return updated
  }

  public recordPayment(customerId: number, amount: number): Customer[] {
    const customers = this.getCustomers()
    const updated = customers.map(c => (c.id === customerId ? { ...c, credit: Math.max(0, c.credit - amount) } : c))
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(updated))
    this.queueAction({ type: "RECORD_KHATA_PAYMENT", payload: { customerId, amount } })

    if (this.online) {
      cloudApi.recordKhataPayment(customerId, amount).catch(() => {})
    }

    return updated
  }

  public deleteCustomer(customerId: number): Customer[] {
    const customers = this.getCustomers()
    const updated = customers.filter(c => c.id !== customerId)
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(updated))
    this.queueAction({ type: "DELETE_CUSTOMER", payload: { customerId } })
    return updated
  }


  // ── Suppliers (CRUD) ───────────────────────────────────────────────────────
  public getSuppliers(): Supplier[] {
    try {
      const data = localStorage.getItem(KEYS.SUPPLIERS)
      if (data) return JSON.parse(data)
      localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS))
      return INITIAL_SUPPLIERS
    } catch {
      return INITIAL_SUPPLIERS
    }
  }

  public addSupplier(supplier: Omit<Supplier, "id">): Supplier[] {
    const suppliers = this.getSuppliers()
    const newSupplier: Supplier = {
      ...supplier,
      id: suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1,
    }
    const updated = [newSupplier, ...suppliers]
    localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(updated))
    this.queueAction({ type: "ADD_SUPPLIER", payload: newSupplier })

    if (this.online) {
      cloudApi.createSupplier(supplier).catch(() => {})
    }

    return updated
  }

  public updateSupplier(id: number, updates: Partial<Supplier>): Supplier[] {
    const suppliers = this.getSuppliers()
    const updated = suppliers.map(s => (s.id === id ? { ...s, ...updates } : s))
    localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(updated))
    this.queueAction({ type: "UPDATE_SUPPLIER", payload: { id, updates } })

    if (this.online) {
      cloudApi.updateSupplier(id, updates).catch(() => {})
    }

    return updated
  }

  public deleteSupplier(id: number): Supplier[] {
    const suppliers = this.getSuppliers()
    const updated = suppliers.filter(s => s.id !== id)
    localStorage.setItem(KEYS.SUPPLIERS, JSON.stringify(updated))
    this.queueAction({ type: "DELETE_SUPPLIER", payload: { id } })

    if (this.online) {
      cloudApi.deleteSupplier(id).catch(() => {})
    }

    return updated
  }
}

export const db = new StorageService()
