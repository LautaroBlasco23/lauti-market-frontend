"use client"

import { useEffect, useState } from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DollarSign, TrendingUp, Plus, Package, ShoppingBag } from "lucide-react"
import { SellerProductsTable } from "@/components/seller-products-table"
import { SellerOrdersTable } from "@/components/seller-orders-table"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { authService } from "@/lib/auth-service"
import { productService, type Product } from "@/lib/product-service"
import { orderService, type Order } from "@/lib/order-service"
import { useRouter } from "next/navigation"

export default function SellerDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const user = authService.getCurrentUser()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (user.role !== "seller") {
      router.push("/")
      return
    }

    Promise.all([
      productService.getStoreProducts(user.id).catch(() => [] as Product[]),
      orderService.getStoreOrders(user.id).catch(() => [] as Order[]),
    ]).then(([fetchedProducts, fetchedOrders]) => {
      setProducts(fetchedProducts)
      setOrders(fetchedOrders)
      setLoading(false)
    })
  }, [router, user?.id])

  if (!user || user.role !== "seller") {
    return null
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_price, 0)
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed").length

  const handleOrderUpdated = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Seller Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 gap-2 flex flex-col">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <DollarSign className="size-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="size-3" />
                All time earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 gap-2 flex flex-col">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Products</p>
                <Package className="size-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{products.length}</p>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 gap-2 flex flex-col">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <ShoppingBag className="size-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{orders.length}</p>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 gap-2 flex flex-col">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <ShoppingBag className="size-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{pendingOrders}</p>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <Card className="mb-8">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>Manage your product listings</CardDescription>
              </div>
              <Button asChild>
                <Link href="/seller/products/new">
                  <Plus className="size-4" />
                  Add Product
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : (
              <SellerProductsTable products={products} />
            )}
          </CardContent>
        </Card>

        {/* Orders Section */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Track and manage customer orders</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : (
              <SellerOrdersTable orders={orders} onOrderUpdated={handleOrderUpdated} />
            )}
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  )
}
