import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default async function CheckoutPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ external_reference?: string; payment_id?: string }>
}) {
  const params = await searchParams
  const orderIds = params.external_reference?.split(",").filter(Boolean) ?? []

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="size-20 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mx-auto mb-6">
                <Clock className="size-10 text-yellow-600 dark:text-yellow-500" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Payment Pending</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Your payment is pending confirmation. This can happen with cash payments or bank transfers.
                We'll update your order as soon as the payment is confirmed.
              </p>

              {orderIds.length > 0 && (
                <div className="bg-muted rounded-lg p-6 mb-8">
                  <p className="text-sm text-muted-foreground mb-2">Order ID{orderIds.length > 1 ? "s" : ""}</p>
                  {orderIds.map((id) => (
                    <p key={id} className="text-sm font-mono font-semibold break-all">
                      {id}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/orders">View Orders</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/">Continue Shopping</Link>
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
