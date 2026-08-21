import { Bill, Customer, Product, ShopInfo, Supplier } from "../types"

// Cloud API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

class CloudApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(options.headers || {}),
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (err) {
      console.warn(`[Cloud API] Failed request to ${endpoint}:`, err)
      return null
    }
  }

  // ── Sync Queue Flush ───────────────────────────────────────────────────────
  public async syncBatch(actions: { type: string; payload: unknown; timestamp: string }[]): Promise<boolean> {
    const res = await this.request<{ success: boolean }>("/sync", {
      method: "POST",
      body: JSON.stringify({ actions }),
    })
    return !!res?.success
  }

  // ── Products API ───────────────────────────────────────────────────────────
  public async fetchProducts(): Promise<Product[] | null> {
    return this.request<Product[]>("/products")
  }

  public async createProduct(product: Omit<Product, "id">): Promise<Product | null> {
    return this.request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(product),
    })
  }

  public async updateProduct(id: number, updates: Partial<Product>): Promise<Product | null> {
    return this.request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  public async deleteProduct(id: number): Promise<boolean> {
    const res = await this.request<{ success: boolean }>(`/products/${id}`, {
      method: "DELETE",
    })
    return !!res?.success
  }

  // ── Bills & POS API ────────────────────────────────────────────────────────
  public async fetchBills(): Promise<Bill[] | null> {
    return this.request<Bill[]>("/bills")
  }

  public async createBill(bill: Omit<Bill, "id">): Promise<Bill | null> {
    return this.request<Bill>("/bills", {
      method: "POST",
      body: JSON.stringify(bill),
    })
  }

  // ── Khata / Customers API ──────────────────────────────────────────────────
  public async fetchCustomers(): Promise<Customer[] | null> {
    return this.request<Customer[]>("/customers")
  }

  public async updateKhataCredit(name: string, phone: string, amount: number): Promise<Customer | null> {
    return this.request<Customer>("/customers/credit", {
      method: "POST",
      body: JSON.stringify({ name, phone, amount }),
    })
  }

  public async recordKhataPayment(customerId: number, amount: number): Promise<Customer | null> {
    return this.request<Customer>(`/customers/${customerId}/payment`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    })
  }

  // ── Suppliers API ──────────────────────────────────────────────────────────
  public async fetchSuppliers(): Promise<Supplier[] | null> {
    return this.request<Supplier[]>("/suppliers")
  }

  public async createSupplier(supplier: Omit<Supplier, "id">): Promise<Supplier | null> {
    return this.request<Supplier>("/suppliers", {
      method: "POST",
      body: JSON.stringify(supplier),
    })
  }

  public async updateSupplier(id: number, updates: Partial<Supplier>): Promise<Supplier | null> {
    return this.request<Supplier>(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  }

  public async deleteSupplier(id: number): Promise<boolean> {
    const res = await this.request<{ success: boolean }>(`/suppliers/${id}`, {
      method: "DELETE",
    })
    return !!res?.success
  }

  // ── Shop Info API ──────────────────────────────────────────────────────────
  public async fetchShopInfo(): Promise<ShopInfo | null> {
    return this.request<ShopInfo>("/shop/info")
  }

  public async updateShopInfo(info: ShopInfo): Promise<ShopInfo | null> {
    return this.request<ShopInfo>("/shop/info", {
      method: "PUT",
      body: JSON.stringify(info),
    })
  }
}

export const cloudApi = new CloudApiService()
