"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Store, ShoppingBag } from "lucide-react"
import { authService } from "@/lib/mock-services"

export default function ProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser())

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user) {
      router.push("/login")
    } else {
      setCurrentUser(user)
    }
  }, [router])

  if (!currentUser) {
    return null
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="size-10 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{currentUser.name}</h1>
                <p className="text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="size-4" />
                      <span>Full Name</span>
                    </div>
                    <p className="font-medium">{currentUser.name}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="size-4" />
                      <span>Email</span>
                    </div>
                    <p className="font-medium">{currentUser.email}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {currentUser.role === "seller" ? (
                        <Store className="size-4" />
                      ) : (
                        <ShoppingBag className="size-4" />
                      )}
                      <span>Account Type</span>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {currentUser.role}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4" />
                      <span>Member Since</span>
                    </div>
                    <p className="font-medium">January 2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-specific information */}
            {currentUser.role === "buyer" && (
              <Card>
                <CardHeader>
                  <CardTitle>Buyer Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <ShoppingBag className="size-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Browse Products</h4>
                      <p className="text-sm text-muted-foreground">
                        Explore thousands of products from verified sellers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <ShoppingBag className="size-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Track Orders</h4>
                      <p className="text-sm text-muted-foreground">Monitor your order status and delivery updates</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button asChild>
                      <a href="/">Browse Products</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentUser.role === "seller" && (
              <Card>
                <CardHeader>
                  <CardTitle>Seller Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Store className="size-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Manage Products</h4>
                      <p className="text-sm text-muted-foreground">List, edit, and manage your product inventory</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Store className="size-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Process Orders</h4>
                      <p className="text-sm text-muted-foreground">View and manage customer orders and fulfillment</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button asChild>
                      <a href="/seller">Go to Dashboard</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
