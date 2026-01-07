"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CartItemsList } from "@/components/cart-items-list"
import { CartSummary } from "@/components/cart-summary"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { authService } from "@/lib/mock-services"

export default function CartPage() {
  const router = useRouter()

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user) {
      router.push("/login")
    } else if (user.role !== "buyer") {
      router.push("/seller")
    }
  }, [router])

  const user = authService.getCurrentUser()

  if (!user || user.role !== "buyer") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Continue Shopping
          </Link>
        </Button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">Review your items before checkout</p>
        </div>

        {/* Cart Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItemsList />
          </div>
          <div>
            <CartSummary />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
