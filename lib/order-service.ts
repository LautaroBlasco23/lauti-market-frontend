import { apiFetch } from "./api-client"

export interface OrderItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
}

export interface Order {
  id: string
  user_id: string
  store_id: string
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  items: OrderItem[]
  total_price: number
  created_at: string
  updated_at: string
}

export interface CreateOrderRequest {
  store_id: string
  items: { product_id: string; quantity: number }[]
}

export const orderService = {
  createOrder: (data: CreateOrderRequest): Promise<Order> =>
    apiFetch<Order>("/orders", { method: "POST", body: JSON.stringify(data) }),

  getOrder: (orderId: string): Promise<Order> =>
    apiFetch<Order>(`/orders/${orderId}`),

  getUserOrders: (userId: string, limit?: number, offset?: number): Promise<Order[]> => {
    const params = new URLSearchParams()
    if (limit !== undefined) params.set("limit", String(limit))
    if (offset !== undefined) params.set("offset", String(offset))
    const query = params.toString() ? `?${params}` : ""
    return apiFetch<Order[]>(`/users/${userId}/orders${query}`)
  },

  getStoreOrders: (storeId: string, limit?: number, offset?: number): Promise<Order[]> => {
    const params = new URLSearchParams()
    if (limit !== undefined) params.set("limit", String(limit))
    if (offset !== undefined) params.set("offset", String(offset))
    const query = params.toString() ? `?${params}` : ""
    return apiFetch<Order[]>(`/stores/${storeId}/orders${query}`)
  },

  updateOrderStatus: (orderId: string, status: string): Promise<Order> =>
    apiFetch<Order>(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
}
