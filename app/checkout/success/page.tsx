import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SiteHeader />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="size-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="size-10 text-green-600 dark:text-green-500" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Thank you for your purchase. We've sent a confirmation email with your order details.
              </p>

              <div className="bg-muted rounded-lg p-6 mb-8">
                <p className="text-sm text-muted-foreground mb-2">Order Number</p>
                <p className="text-2xl font-bold">#ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
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

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
