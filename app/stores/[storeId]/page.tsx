import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Store } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductCard } from "@/components/product-card"
import { storeService } from "@/lib/store-service"
import { productService } from "@/lib/product-service"

interface StorePageProps {
  params: Promise<{ storeId: string }>
}

export default async function StorePage({ params }: StorePageProps) {
  const { storeId } = await params

  const [store, products] = await Promise.all([
    storeService.getStore(storeId).catch(() => null),
    productService.getStoreProducts(storeId).catch(() => []),
  ])

  if (!store) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to Products
          </Link>
        </Button>

        {/* Store Header */}
        <div className="mb-10 flex items-center gap-5">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Store className="size-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{store.name}</h1>
            {store.description && (
              <p className="text-muted-foreground mt-1 max-w-xl text-pretty">{store.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">{products.length} products</p>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="size-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground">This store hasn&apos;t listed any products.</p>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
