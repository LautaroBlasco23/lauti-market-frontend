"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { cartService } from "@/lib/mock-services"
import { orderService } from "@/lib/order-service"
import { toast } from "@/hooks/use-toast"
import { getErrorMessage } from "@/lib/error-utils"

const ORDERS_CREATED_KEY = "orders_created_for_payment"

// MP appends these query params on redirect:
// collection_id, collection_status, payment_id, status, external_reference, payment_type, merchant_order_id
export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [orderIds, setOrderIds] = useState<string[]>([])
  
  const status = searchParams.get("collection_status") ?? searchParams.get("status") ?? "approved"
  const isApproved = status === "approved"
  const paymentId = searchParams.get("payment_id")

  useEffect(() => {
    async function createOrdersFromCart() {
      // Prevent duplicate order creation on refresh
      const alreadyCreated = paymentId && localStorage.getItem(`${ORDERS_CREATED_KEY}_${paymentId}`)
      if (alreadyCreated) {
        setIsProcessing(false)
        setOrderIds(JSON.parse(alreadyCreated))
        return
      }

      const cartItems = cartService.getCart()
      if (cartItems.length === 0) {
        setIsProcessing(false)
        return
      }

      try {
        // Group cart items by store
        const byStore = new Map<string, { product_id: string; quantity: number }[]>()
        for (const { product, quantity } of cartItems) {
          const storeItems = byStore.get(product.store_id) ?? []
          storeItems.push({ product_id: product.id, quantity })
          byStore.set(product.store_id, storeItems)
        }

        // Create orders for each store
        const orders = await Promise.all(
          Array.from(byStore.entries()).map(([store_id, items]) =>
            orderService.createOrder({ store_id, items })
          )
        )

        const newOrderIds = orders.map((o) => o.id)
        setOrderIds(newOrderIds)

        // Mark orders as created for this payment to prevent duplicates on refresh
        if (paymentId) {
          localStorage.setItem(`${ORDERS_CREATED_KEY}_${paymentId}`, JSON.stringify(newOrderIds))
        }

        // Only clear cart after successful order creation
        cartService.clearCart()
      } catch (err: unknown) {
        toast({
          title: "Order Creation Failed",
          description: getErrorMessage(err, "Failed to create orders. Please contact support."),
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    }

    if (isApproved) {
      createOrdersFromCart()
    } else {
      setIsProcessing(false)
    }
  }, [isApproved, paymentId])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              {isProcessing ? (
                <>
                  <div className="size-20 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="size-10 text-blue-600 dark:text-blue-500 animate-spin" />
                  </div>
                  <h1 className="text-3xl font-bold mb-4">Processing Your Order...</h1>
                  <p className="text-lg text-muted-foreground">
                    Please wait while we finalize your purchase.
                  </p>
                </>
              ) : (
                <>
                  <div className="size-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="size-10 text-green-600 dark:text-green-500" />
                  </div>
                  <h1 className="text-3xl font-bold mb-4">
                    {isApproved ? "Payment Approved!" : "Payment Processing"}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    {isApproved
                      ? "Your payment was confirmed. We'll notify you when your order ships."
                      : "Your payment is being processed. This may take a few minutes."}
                  </p>

                  <div className="bg-muted rounded-lg p-6 mb-8">
                    {orderIds.length > 0 ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-2">Order ID{orderIds.length > 1 ? "s" : ""}</p>
                        {orderIds.map((id) => (
                          <p key={id} className="text-sm font-mono font-semibold break-all">
                            {id}
                          </p>
                        ))}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Check your email for order details.</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild>
                      <Link href="/">Continue Shopping</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/orders">View Orders</Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
