import { apiFetch } from "./api-client"

export interface CreatePreferenceRequest {
  order_ids: string[]
}

export interface CreatePreferenceResponse {
  preference_id: string
  init_point: string
  sandbox_init_point: string
}

export type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "in_process"

export interface PaymentResponse {
  id: string
  order_id: string
  user_id: string
  mp_payment_id: string
  amount: number
  currency: string
  status: PaymentStatus
  status_detail: string
  payment_method: string
  preference_id: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  product_id: string
  quantity: number
  unit_price: number
}

export interface CreateCartPreferenceRequest {
  items: CartItem[]
}

export const paymentService = {
  createPreference: (data: CreatePreferenceRequest): Promise<CreatePreferenceResponse> =>
    apiFetch<CreatePreferenceResponse>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createCartPreference: (data: CreateCartPreferenceRequest): Promise<CreatePreferenceResponse> =>
    apiFetch<CreatePreferenceResponse>("/payments/cart", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getPayment: (id: string): Promise<PaymentResponse> =>
    apiFetch<PaymentResponse>(`/payments/${id}`),
}
