"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cartService } from "@/lib/mock-services"
import Image from "next/image"

export function CheckoutSummary() {
  const [cart, setCart] = useState<ReturnType<typeof cartService.getCart>>([])
  const [subtotal, setSubtotal] = useState(0)

  useEffect(() => {
    const cartItems = cartService.getCart()
    const total = cartService.getTotal()
    setCart(cartItems)
    setSubtotal(total)
  }, [])

  const shipping = subtotal > 0 ? 10 : 0
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  return (
    <Card className="sticky top-20">
      <CardHeader className="border-b">
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-6 gap-4 flex flex-col">
        {/* Cart Items */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto">
          {cart.map((item) => (
            <div key={item.product.id} className="flex gap-3">
              <div className="relative size-16 rounded-md overflow-hidden bg-muted shrink-0">
                <Image
                  src={item.product.image || "/placeholder.svg"}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-medium text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">${shipping.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">Total</span>
          <span className="font-bold text-2xl">${total.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
