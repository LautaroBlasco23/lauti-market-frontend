"use client"

import { useState } from "react"
import { ProductCard } from "@/components/product-card"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import type { Product } from "@/lib/product-service"

interface ProductCatalogProps {
  products: Product[]
  categories: string[]
}

export function ProductCatalog({ products, categories }: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filtered =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory)

  return (
    <>
      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === selectedCategory ? "default" : "outline"}
              className="cursor-pointer hover:bg-accent transition-colors px-4 py-2"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="size-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </>
  )
}
