import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/product-service"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-md cursor-pointer h-full">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {product.stock < 10 && product.stock > 0 && (
            <Badge variant="secondary" className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm">
              Low Stock
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge variant="destructive" className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm">
              Out of Stock
            </Badge>
          )}
        </div>
        <CardContent className="p-4 gap-2 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold line-clamp-1 text-base">{product.name}</h3>
            <Badge variant="outline" className="shrink-0">
              {product.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">by {product.store_name || product.store_id}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
