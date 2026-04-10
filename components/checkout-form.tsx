"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cartService } from "@/lib/mock-services"
import { paymentService } from "@/lib/payment-service"
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

      // Convert cart items to preference items
      const preferenceItems = items.map(({ product, quantity }) => ({
        product_id: product.id,
        quantity,
        unit_price: product.price,
      }))

      // Create payment preference with cart items (NOT order IDs)
      const preference = await paymentService.createCartPreference({
        items: preferenceItems,
      })

      toast({
        title: "Redirecting to MercadoPago",
        description: "Please wait while we redirect you to complete your payment...",
      })

      // DO NOT clear cart here - only clear on success page
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
