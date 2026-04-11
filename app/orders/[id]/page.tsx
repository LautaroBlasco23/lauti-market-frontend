"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import { ArrowLeft, Package, Store, CreditCard, Calendar, Truck, MapPin, XCircle } from "lucide-react"
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

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const { user, isLoading: authLoading } = useRequireAuth(["buyer"])
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!user || !orderId) return

    setLoading(true)
    orderService
      .getOrder(orderId)
      .then(setOrder)
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to load order details.",
          variant: "destructive",
        })
      })
      .finally(() => setLoading(false))
  }, [user, orderId])

  const handleCancel = async () => {
    if (!order) return
    setCancelling(true)
    try {
      const updated = await orderService.updateOrderStatus(order.id, "cancelled")
      setOrder(updated)
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
      setCancelling(false)
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/orders">
              <ArrowLeft className="size-4" />
              Back to Orders
            </Link>
          </Button>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/orders">
              <ArrowLeft className="size-4" />
              Back to Orders
            </Link>
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="size-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Order Not Found</h3>
              <p className="text-muted-foreground mb-6">The order you&apos;re looking for doesn&apos;t exist.</p>
              <Button asChild>
                <Link href="/orders">View All Orders</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const canCancel = order.status === "pending"

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/orders">
            <ArrowLeft className="size-4" />
            Back to Orders
          </Link>
        </Button>

        {/* Order Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order #{order.id}</h1>
              <p className="text-muted-foreground">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={orderStatusColors[order.status]} className="capitalize text-sm">
                {orderStatusLabels[order.status]}
              </Badge>
              <Badge variant={paymentStatusColors[order.payment_status]} className="capitalize text-sm">
                {paymentStatusLabels[order.payment_status]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="size-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-center gap-4">
                        <div className="size-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          {item.product_image_url ? (
                            <img
                              src={item.product_image_url}
                              alt={item.product_name || item.product_id}
                              className="size-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="size-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {item.product_name || `Product #${item.product_id}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} × ${item.unit_price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </p>
                      </div>
                      {index < order.items.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${order.total_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${order.total_price.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="size-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`size-8 rounded-full flex items-center justify-center ${
                        order.status !== "cancelled" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}>
                        <Package className="size-4" />
                      </div>
                      {order.status !== "cancelled" && <div className="w-0.5 h-full bg-primary mt-2" />}
                    </div>
                    <div className="pb-6">
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {order.status !== "cancelled" && (
                    <>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`size-8 rounded-full flex items-center justify-center ${
                            ["confirmed", "shipped", "delivered"].includes(order.status)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}>
                            <CreditCard className="size-4" />
                          </div>
                          {["confirmed", "shipped", "delivered"].includes(order.status) && (
                            <div className="w-0.5 h-full bg-primary mt-2" />
                          )}
                        </div>
                        <div className="pb-6">
                          <p className="font-medium">Payment Confirmed</p>
                          <p className="text-sm text-muted-foreground">
                            {order.payment_status === "approved"
                              ? "Your payment has been processed"
                              : "Waiting for payment confirmation"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`size-8 rounded-full flex items-center justify-center ${
                            ["shipped", "delivered"].includes(order.status)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}>
                            <Truck className="size-4" />
                          </div>
                          {["shipped", "delivered"].includes(order.status) && (
                            <div className="w-0.5 h-full bg-primary mt-2" />
                          )}
                        </div>
                        <div className="pb-6">
                          <p className="font-medium">Shipped</p>
                          <p className="text-sm text-muted-foreground">
                            {order.status === "shipped" || order.status === "delivered"
                              ? "Your order is on the way"
                              : "Waiting to be shipped"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`size-8 rounded-full flex items-center justify-center ${
                            order.status === "delivered" ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}>
                            <MapPin className="size-4" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">Delivered</p>
                          <p className="text-sm text-muted-foreground">
                            {order.status === "delivered"
                              ? "Your order has been delivered"
                              : "Waiting for delivery"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {order.status === "cancelled" && (
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="size-8 rounded-full flex items-center justify-center bg-destructive text-destructive-foreground">
                          <XCircle className="size-4" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Order Cancelled</p>
                        <p className="text-sm text-muted-foreground">
                          This order has been cancelled
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-medium">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Store className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Store ID</p>
                    <p className="font-medium">{order.store_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <Badge variant={paymentStatusColors[order.payment_status]} className="capitalize mt-1">
                      {paymentStatusLabels[order.payment_status]}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-medium">{order.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-lg">${order.total_price.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full text-destructive hover:text-destructive" disabled={cancelling}>
                    <XCircle className="size-4 mr-2" />
                    Cancel Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this order? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Order</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={cancelling}
                    >
                      {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
