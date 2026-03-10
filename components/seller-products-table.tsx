"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import type { Product } from "@/lib/product-service"
import Image from "next/image"

interface SellerProductsTableProps {
  products: Product[]
}

export function SellerProductsTable({ products }: SellerProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No products yet. Add your first product to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative size-12 rounded-md overflow-hidden bg-muted shrink-0">
                    <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium line-clamp-1">{product.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="font-medium">${product.price.toFixed(2)}</TableCell>
              <TableCell>
                {product.stock > 0 ? (
                  <span className={product.stock < 10 ? "text-orange-600" : ""}>{product.stock} units</span>
                ) : (
                  <span className="text-destructive">Out of stock</span>
                )}
              </TableCell>
              <TableCell>
                {product.stock > 0 ? (
                  <Badge variant="secondary">Active</Badge>
                ) : (
                  <Badge variant="destructive">Inactive</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon-sm">
                    <Edit className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
