"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, PackageIcon } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { orderService, type Order, type OrderStatus, type PaymentStatus } from "@/lib/order-service"
import { useRequireAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

const orderStatusColors: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "default",
  confirmed: "secondary",
  shipped: "outline",
  delivered: "secondary",
  cancelled: "destructive",
}

const paymentStatusColors: Record<PaymentStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "default",
  approved: "secondary",
  rejected: "destructive",
  cancelled: "destructive",
  in_process: "outline",
  not_paid: "destructive",
}

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Payment Pending",
  approved: "Paid",
  rejected: "Payment Failed",
  cancelled: "Payment Cancelled",
  in_process: "Processing Payment",
  not_paid: "Not Paid",
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useRequireAuth(["buyer"])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    setLoading(true)
    orderService
      .getUserOrders(user.id)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId)
    try {
      const updated = await orderService.updateOrderStatus(orderId, "cancelled")
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      })
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
                    <div className="flex gap-2">
                      <Badge variant={orderStatusColors[order.status]} className="capitalize">
                        {orderStatusLabels[order.status]}
                      </Badge>
                      <Badge variant={paymentStatusColors[order.payment_status || "not_paid"]} className="capitalize">
                        {paymentStatusLabels[order.payment_status || "not_paid"]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="font-semibold mb-1">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.map((item) => 
                          `${item.quantity}x ${item.product_name || item.product_id}`
                        ).join(", ")}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-bold text-lg">${order.total_price.toFixed(2)}</p>
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent text-destructive hover:text-destructive"
                                disabled={cancellingId === order.id}
                              >
                                {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel order #{order.id}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancel(order.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  disabled={cancellingId === order.id}
                                >
                                  {cancellingId === order.id ? "Cancelling..." : "Yes, Cancel Order"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <Button variant="outline" size="sm" className="bg-transparent" asChild>
                          <Link href={`/orders/${order.id}`}>View Details</Link>
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
