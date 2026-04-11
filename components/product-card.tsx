import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/product-service"

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export function ProductCard({ product, priority }: ProductCardProps) {
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock < 10 && product.stock > 0

  return (
    <Link href={`/products/${product.id}`} className={isOutOfStock ? "pointer-events-none" : ""}>
      <Card className={`group overflow-hidden transition-all hover:shadow-md cursor-pointer h-full ${
        isOutOfStock ? "opacity-60" : ""
      }`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            priority={priority}
          />
          
          {/* Stock Status Badges */}
          {isLowStock && (
            <Badge variant="secondary" className="absolute top-3 right-3 bg-yellow-500/90 text-white border-0">
              Low Stock: {product.stock} left
            </Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2 font-bold">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 gap-2 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold line-clamp-1 text-base ${isOutOfStock ? "text-muted-foreground" : ""}`}>
              {product.name}
            </h3>
            <Badge variant="outline" className="shrink-0">
              {product.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-lg font-bold ${isOutOfStock ? "text-muted-foreground" : ""}`}>
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground">by {product.store_name || product.store_id}</span>
          </div>
          
          {/* Stock indicator below price */}
          {isOutOfStock && (
            <p className="text-sm text-destructive font-medium">Currently unavailable</p>
          )}
          {isLowStock && (
            <p className="text-sm text-yellow-600 font-medium">Only {product.stock} left in stock</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
