"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, PackageIcon } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { authService } from "@/lib/auth-service"
import { orderService, type Order } from "@/lib/order-service"
import { useRouter } from "next/navigation"

const statusColors = {
  pending: "default",
  confirmed: "secondary",
  shipped: "outline",
  delivered: "secondary",
  cancelled: "destructive",
} as const

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const user = authService.getCurrentUser()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (user.role !== "buyer") {
      router.push("/seller")
      return
    }

    orderService
      .getUserOrders(user.id)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [router, user?.id])

  if (!user || user.role !== "buyer") {
    return null
  }

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId)
    try {
      const updated = await orderService.updateOrderStatus(orderId, "cancelled")
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <PackageIcon className="size-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <Button asChild>
                <Link href="/">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Placed on{" "}
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge variant={statusColors[order.status]} className="capitalize">
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold mb-1">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.map((item) => `${item.quantity}x ${item.product_id}`).join(", ")}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-bold text-lg">${order.total_price.toFixed(2)}</p>
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent text-destructive hover:text-destructive"
                            disabled={cancellingId === order.id}
                            onClick={() => handleCancel(order.id)}
                          >
                            {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="bg-transparent">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
