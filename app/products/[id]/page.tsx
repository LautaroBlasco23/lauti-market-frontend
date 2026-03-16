import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, Store } from "lucide-react"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { productService } from "@/lib/product-service"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  const { products } = await productService.getAllProducts({ limit: 1000 }).catch(() => ({ products: [] }))
  const product = products.find((p) => p.id === id)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to Products
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{product.category}</Badge>
                {product.stock < 10 && product.stock > 0 && <Badge variant="secondary">Low Stock</Badge>}
                {product.stock === 0 && <Badge variant="destructive">Out of Stock</Badge>}
              </div>
              <h1 className="text-4xl font-bold mb-4 text-balance">{product.name}</h1>
              <p className="text-lg text-muted-foreground text-pretty">{product.description}</p>
            </div>

            <Separator />

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
              <span className="text-muted-foreground">per item</span>
            </div>

            {/* Stock Info */}
            <div className="flex items-center gap-2 text-sm">
              <Package className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            {/* Add to Cart */}
            <AddToCartButton product={product} />

            <Separator />

            {/* Seller Info */}
            <Card>
              <CardContent className="p-6 gap-4 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                    <Store className="size-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sold by</p>
                    <p className="font-semibold">{product.store_id}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <Link href={`/stores/${product.store_id}`}>Visit Store</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardContent className="p-6 gap-3 flex flex-col">
                <h3 className="font-semibold">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Product ID</p>
                    <p className="font-medium truncate">#{product.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Availability</p>
                    <p className="font-medium">{product.stock > 0 ? "In Stock" : "Out of Stock"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
