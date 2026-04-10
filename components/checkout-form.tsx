"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cartService } from "@/lib/mock-services"
import { orderService } from "@/lib/order-service"
import { paymentService } from "@/lib/payment-service"
import { toast } from "@/hooks/use-toast"
import { getErrorMessage } from "@/lib/error-utils"

export function CheckoutForm() {
  const router = useRouter()
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

      toast({
        title: "Redirecting to MercadoPago",
        description: "Please wait while we redirect you to complete your payment...",
      })

      // Redirect to MercadoPago's hosted checkout (sandbox in test mode).
      window.location.href = preference.sandbox_init_point
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
        {loading ? "Redirecting to MercadoPago..." : "Pay with MercadoPago"}
      </Button>
    </div>
  )
}
