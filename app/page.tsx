import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { productService } from "@/lib/product-service"
import { ProductCatalog } from "@/components/product-catalog"

export default async function HomePage() {
  const { products } = await productService.getAllProducts({ limit: 100 }).catch(() => ({ products: [] }))

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category))).sort()]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 text-balance">Discover Amazing Products</h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto text-pretty">
            Browse our curated selection of quality products from trusted sellers
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input type="search" placeholder="Search products..." className="pl-10 h-12" />
          </div>
        </div>

        <ProductCatalog products={products} categories={categories} />
      </main>

      <SiteFooter />
    </div>
  )
}
