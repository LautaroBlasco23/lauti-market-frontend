"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cartService } from "@/lib/mock-services"

export function CartSummary() {
  const [subtotal, setSubtotal] = useState(0)
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    const cart = cartService.getCart()
    const total = cartService.getTotal()
    const count = cart.reduce((sum, item) => sum + item.quantity, 0)
    setSubtotal(total)
    setItemCount(count)
  }, [])

  const shipping = subtotal > 0 ? 10 : 0
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + shipping + tax

  return (
    <Card className="sticky top-20">
      <CardHeader className="border-b">
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-6 gap-4 flex flex-col">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium">{subtotal > 0 ? `$${shipping.toFixed(2)}` : "-"}</span>
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

        <Button size="lg" className="w-full" asChild disabled={itemCount === 0}>
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>

        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>Secure checkout powered by Stripe</p>
        </div>
      </CardContent>
    </Card>
  )
}
