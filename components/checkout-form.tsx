"use client"

import type { ComponentProps } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react"
import { cartService } from "@/lib/mock-services"
import { orderService } from "@/lib/order-service"
import { paymentService } from "@/lib/payment-service"

type CardPaymentData = Parameters<ComponentProps<typeof CardPayment>["onSubmit"]>[0]

export function CheckoutForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [mpReady, setMpReady] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const total = cartService.getTotal()

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
    if (key) {
      try {
        initMercadoPago(key, {
          locale: "es-AR",
          // Disable fraud prevention in test/localhost to avoid CORS issues
          // with secure-fields.mercadopago.com iframe
          advancedFraudPrevention: false,
        })
        setMpReady(true)
      } catch (err) {
        setInitError("Failed to initialize payment system. Please refresh the page.")
      }
    } else {
      setInitError("Payment system not configured. Please contact support.")
    }
  }, [])

  const handleSubmit = async (formData: CardPaymentData) => {
    setError(null)

    const items = cartService.getCart()
    const byStore = new Map<string, { product_id: string; quantity: number }[]>()
    for (const { product, quantity } of items) {
      const storeItems = byStore.get(product.store_id) ?? []
      storeItems.push({ product_id: product.id, quantity })
      byStore.set(product.store_id, storeItems)
    }

    try {
      const orders = await Promise.all(
        Array.from(byStore.entries()).map(([store_id, storeItems]) =>
          orderService.createOrder({ store_id, items: storeItems }),
        ),
      )

      const payments = await Promise.all(
        orders.map((order) =>
          paymentService.createPayment({
            order_id: order.id,
            card_token: formData.token,
            payer_email: formData.payer.email ?? "",
            installments: formData.installments,
          }),
        ),
      )

      const failed = payments.some(
        (p) => p.status === "rejected" || p.status === "cancelled",
      )
      if (failed) {
        const err = new Error("payment_rejected")
        setError("Payment was rejected. Please check your card details and try again.")
        throw err
      }

      const overallStatus = payments.every((p) => p.status === "approved")
        ? "approved"
        : "in_process"

      cartService.clearCart()
      router.push(
        `/checkout/success?orderIds=${orders.map((o) => o.id).join(",")}&status=${overallStatus}`,
      )
    } catch (err: unknown) {
      if ((err as Error).message !== "payment_rejected") {
        setError(
          (err as { error?: string })?.error ?? "Payment failed. Please try again.",
        )
      }
      throw err
    }
  }

  if (initError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <p className="font-medium">Payment System Error</p>
        <p className="text-sm">{initError}</p>
      </div>
    )
  }

  if (!mpReady) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading payment form...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CardPayment
        initialization={{ amount: total }}
        onSubmit={handleSubmit}
        onError={(err) => {
          // Check for CORS/network errors
          if (err.message?.includes("NetworkError") || err.message?.includes("Failed to fetch")) {
            setError("Connection error. This may be a temporary issue with the payment provider's test environment. Please try again in a few moments.")
          } else {
            setError(err.message)
          }
        }}
      />
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
