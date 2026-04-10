"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

// MP appends these query params on redirect:
// collection_id, collection_status, payment_id, status, external_reference, payment_type, merchant_order_id
export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()

  const status = searchParams.get("collection_status") ?? searchParams.get("status") ?? "approved"
  const isApproved = status === "approved"

  // external_reference is "orderId1,orderId2" (set when preference was created)
  const externalRef = searchParams.get("external_reference") ?? ""
  const orderIds = externalRef
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              {isApproved ? (
                <>
                  <div className="size-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="size-10 text-green-600 dark:text-green-500" />
                  </div>
                  <h1 className="text-3xl font-bold mb-4">Payment Approved!</h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Your payment was confirmed. We&apos;ll notify you when your order ships.
                  </p>
                </>
              ) : (
                <>
                  <div className="size-20 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-6">
                    <Clock className="size-10 text-blue-600 dark:text-blue-500" />
                  </div>
                  <h1 className="text-3xl font-bold mb-4">Payment Processing</h1>
                  <p className="text-lg text-muted-foreground mb-8">
                    Your payment is being processed. This may take a few minutes.
                  </p>
                </>
              )}

              <div className="bg-muted rounded-lg p-6 mb-8">
                {orderIds.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">
                      Order ID{orderIds.length > 1 ? "s" : ""}
                    </p>
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
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
