import { apiFetch } from "./api-client"

export interface CreatePaymentRequest {
  order_id: string
  card_token: string
  payer_email: string
  installments?: number
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
  created_at: string
  updated_at: string
}

export const paymentService = {
  createPayment: (data: CreatePaymentRequest): Promise<PaymentResponse> =>
    apiFetch<PaymentResponse>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getPayment: (id: string): Promise<PaymentResponse> =>
    apiFetch<PaymentResponse>(`/payments/${id}`),
}
