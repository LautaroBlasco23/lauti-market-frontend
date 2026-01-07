"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, User, Store } from "lucide-react"
import { authService } from "@/lib/mock-services"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleLogin = async (email: string, role: "buyer" | "seller") => {
    setLoading(email)
    const user = await authService.login(email)

    if (user) {
      // Redirect based on role
      if (role === "seller") {
        router.push("/seller")
      } else {
        router.push("/")
      }
      router.refresh()
    }

    setLoading(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Package className="size-8" />
          <h1 className="text-3xl font-bold">Marketplace</h1>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Buyer Login */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="size-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Login as Buyer</CardTitle>
              <CardDescription>Browse and purchase products from sellers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">As a buyer, you can:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Browse product catalog</li>
                  <li>• Add items to cart</li>
                  <li>• Place orders</li>
                  <li>• Track order history</li>
                </ul>
              </div>
              <div className="pt-4 space-y-2">
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  <p className="font-medium">Test Email:</p>
                  <p className="font-mono">user@buyer.com</p>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleLogin("user@buyer.com", "buyer")}
                  disabled={loading !== null}
                >
                  {loading === "user@buyer.com" ? "Logging in..." : "Login as Buyer"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Seller Login */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Store className="size-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Login as Seller</CardTitle>
              <CardDescription>Manage your products and orders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">As a seller, you can:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Manage your products</li>
                  <li>• View sales analytics</li>
                  <li>• Process orders</li>
                  <li>• Track inventory</li>
                </ul>
              </div>
              <div className="pt-4 space-y-2">
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  <p className="font-medium">Test Email:</p>
                  <p className="font-mono">user@seller.com</p>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleLogin("user@seller.com", "seller")}
                  disabled={loading !== null}
                >
                  {loading === "user@seller.com" ? "Logging in..." : "Login as Seller"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          This is a demo application with mocked authentication.
        </p>
      </div>
    </div>
  )
}
