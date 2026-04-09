"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cartService } from "@/lib/mock-services"
import { orderService } from "@/lib/order-service"
import { paymentService } from "@/lib/payment-service"

export function CheckoutForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const items = cartService.getCart()
      if (items.length === 0) {
        setError("Your cart is empty.")
        return
      }

      // Group cart items by store and create one order per store.
      const byStore = new Map<string, { product_id: string; quantity: number }[]>()
      for (const { product, quantity } of items) {
        const storeItems = byStore.get(product.store_id) ?? []
        storeItems.push({ product_id: product.id, quantity })
        byStore.set(product.store_id, storeItems)
      }

      const orders = await Promise.all(
        Array.from(byStore.entries()).map(([store_id, storeItems]) =>
          orderService.createOrder({ store_id, items: storeItems }),
        ),
      )

      // Create a single Checkout Pro preference covering all orders.
      const preference = await paymentService.createPreference({
        order_ids: orders.map((o) => o.id),
      })

      cartService.clearCart()

      // Redirect to MercadoPago's hosted checkout (sandbox in test mode).
      window.location.href = preference.sandbox_init_point
    } catch (err: any) {
      setError(err?.error ?? err?.message ?? "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        size="lg"
        className="w-full"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? "Redirecting to MercadoPago..." : "Pay with MercadoPago"}
      </Button>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
