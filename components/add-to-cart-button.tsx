"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Check, Minus, Plus, Zap } from "lucide-react"
import { cartService } from "@/lib/mock-services"
import type { Product } from "@/lib/product-service"

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    cartService.addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    cartService.addToCart(product, quantity)
    router.push("/cart")
  }

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const isOutOfStock = product.stock === 0

  return (
    <div className="flex flex-col gap-4">
      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Quantity:</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm" onClick={decrementQuantity} disabled={quantity <= 1}>
              <Minus className="size-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button variant="outline" size="icon-sm" onClick={incrementQuantity} disabled={quantity >= product.stock}>
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {/* Buy Now Button */}
        <Button
          size="lg"
          variant="secondary"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="w-full"
        >
          <Zap className="size-5" />
          Buy Now
        </Button>

        {/* Add to Cart Button */}
        <Button
          size="lg"
          onClick={handleAddToCart}
          disabled={isOutOfStock || added}
          className="w-full"
          variant="outline"
        >
          {added ? (
            <>
              <Check className="size-5" />
              Added to Cart
            </>
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="size-5" />
              Add to Cart
            </>
          )}
        </Button>
      </div>

      {!isOutOfStock && (
        <p className="text-sm text-muted-foreground text-center">Total: ${(product.price * quantity).toFixed(2)}</p>
      )}
    </div>
  )
}
