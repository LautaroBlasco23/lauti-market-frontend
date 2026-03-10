import { apiFetch } from "./api-client"

export interface Product {
  id: string
  store_id: string
  name: string
  description: string
  category: string
  price: number
  stock: number
  image_url?: string
}

export interface CreateProductData {
  name: string
  description: string
  category: string
  price: number
  stock: number
  image?: File
}

export interface UpdateProductData {
  name?: string
  description?: string
  category?: string
  price?: number
  stock?: number
  image_url?: string
}

interface GetAllProductsParams {
  limit?: number
  offset?: number
  category?: string
}

interface GetAllProductsResponse {
  products: Product[]
  limit: number
  offset: number
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

async function fetchPublic<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw { error: data.error ?? data.message ?? "Request failed" }
  }
  return data as T
}

export const productService = {
  getAllProducts: (params: GetAllProductsParams = {}): Promise<GetAllProductsResponse> => {
    const query = new URLSearchParams()
    if (params.limit !== undefined) query.set("limit", String(params.limit))
    if (params.offset !== undefined) query.set("offset", String(params.offset))
    if (params.category) query.set("category", params.category)
    const qs = query.toString()
    return fetchPublic(`/products${qs ? `?${qs}` : ""}`)
  },

  getStoreProducts: (storeId: string): Promise<Product[]> =>
    apiFetch(`/stores/${storeId}/products`),

  getProduct: (storeId: string, productId: string): Promise<Product> =>
    apiFetch(`/stores/${storeId}/products/${productId}`),

  createProduct: async (storeId: string, data: CreateProductData): Promise<Product> => {
    const headers: Record<string, string> = {}
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) headers["Authorization"] = `Bearer ${token}`
    }

    const form = new FormData()
    form.append("name", data.name)
    form.append("description", data.description)
    form.append("category", data.category)
    form.append("price", String(data.price))
    form.append("stock", String(data.stock))
    if (data.image) form.append("image", data.image)

    const res = await fetch(`${BASE_URL}/stores/${storeId}/products`, {
      method: "POST",
      headers,
      body: form,
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw { error: json.error ?? json.message ?? "Failed to create product", fields: json.fields ?? null }
    }
    return json as Product
  },

  updateProduct: (storeId: string, productId: string, data: UpdateProductData): Promise<Product> =>
    apiFetch(`/stores/${storeId}/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteProduct: (storeId: string, productId: string): Promise<void> =>
    apiFetch(`/stores/${storeId}/products/${productId}`, {
      method: "DELETE",
    }),

  uploadProductImage: async (storeId: string, productId: string, file: File): Promise<Product> => {
    const formData = new FormData()
    formData.append("image", file)

    const headers: Record<string, string> = {}
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token")
      if (token) headers["Authorization"] = `Bearer ${token}`
    }

    const res = await fetch(`${BASE_URL}/stores/${storeId}/products/${productId}/image`, {
      method: "POST",
      headers,
      body: formData,
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw { error: data.error ?? data.message ?? "Upload failed", fields: data.fields ?? null }
    }
    return data as Product
  },
}
