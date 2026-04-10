"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cartService } from "@/lib/mock-services"
import { paymentService } from "@/lib/payment-service"
import { orderService } from "@/lib/order-service"
import { toast } from "@/hooks/use-toast"
import { getErrorMessage } from "@/lib/error-utils"

export function CheckoutForm() {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const items = cartService.getCart()
      if (items.length === 0) {
        toast({
          title: "Empty cart",
          description: "Your cart is empty. Add some items before checking out.",
          variant: "destructive",
        })
        return
      }

      // Group cart items by store
      const byStore = new Map<string, { product_id: string; quantity: number }[]>()
      for (const { product, quantity } of items) {
        const storeItems = byStore.get(product.store_id) ?? []
        storeItems.push({ product_id: product.id, quantity })
        byStore.set(product.store_id, storeItems)
      }

      // Create one order per store
      const orders = await Promise.all(
        Array.from(byStore.entries()).map(([store_id, storeItems]) =>
          orderService.createOrder({ store_id, items: storeItems })
        )
      )

      // Create MP preference with the real order IDs
      const preference = await paymentService.createPreference({
        order_ids: orders.map((o) => o.id),
      })

      // Orders exist — safe to clear the cart now
      cartService.clearCart()

      toast({
        title: "Redirecting to MercadoPago",
        description: "Please complete your payment in the new tab.",
      })

      window.open(preference.sandbox_init_point, "_blank")
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "Failed to process payment. Please try again.")

      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      })
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
        {loading ? "Creating order..." : "Pay with MercadoPago"}
      </Button>
    </div>
  )
}
