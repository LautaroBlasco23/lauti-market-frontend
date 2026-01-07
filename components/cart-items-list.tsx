"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { cartService } from "@/lib/mock-services"
import type { Product } from "@/lib/mock-data"

interface CartItem {
  product: Product
  quantity: number
}

export function CartItemsList() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    setCartItems(cartService.getCart())
  }, [])

  const updateQuantity = (productId: string, delta: number) => {
    const item = cartItems.find((item) => item.product.id === productId)
    if (item) {
      const newQuantity = item.quantity + delta
      if (newQuantity > 0 && newQuantity <= item.product.stock) {
        item.quantity = newQuantity
        setCartItems([...cartItems])
      }
    }
  }

  const removeItem = (productId: string) => {
    cartService.removeFromCart(productId)
    setCartItems(cartService.getCart())
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ShoppingBag className="size-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-6">Add some products to get started</p>
          <Button asChild>
            <Link href="/">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {cartItems.map((item, index) => (
            <div key={item.product.id} className="p-6">
              <div className="flex gap-4">
                {/* Product Image */}
                <Link
                  href={`/products/${item.product.id}`}
                  className="relative size-24 rounded-md overflow-hidden bg-muted shrink-0"
                >
                  <Image
                    src={item.product.image || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="font-semibold hover:underline line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">by {item.product.sellerName}</p>
                    </div>
                    <Button variant="ghost" size="icon-sm" onClick={() => removeItem(item.product.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => updateQuantity(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold text-lg">${(item.product.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} each</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
