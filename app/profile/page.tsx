"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Store, ShoppingBag, Package, ArrowRight } from "lucide-react"
import { userService, type UserProfile } from "@/lib/user-service"
import { storeService, type StoreProfile } from "@/lib/store-service"
import { orderService, type Order, type OrderStatus, type PaymentStatus } from "@/lib/order-service"
import { useAuth } from "@/contexts/auth-context"
import { getErrorMessage } from "@/lib/error-utils"

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

export default function ProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | StoreProfile | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    setIsLoading(true)
    if (user.role === "buyer") {
      userService.getUser(user.id)
        .then(setProfile)
        .catch(() => null)
        .finally(() => setIsLoading(false))
      
      // Fetch recent orders for buyers
      setOrdersLoading(true)
      orderService.getUserOrders(user.id, 3)
        .then(setRecentOrders)
        .catch(() => setRecentOrders([]))
        .finally(() => setOrdersLoading(false))
    } else {
      storeService.getStore(user.id)
        .then(setProfile)
        .catch(() => null)
        .finally(() => setIsLoading(false))
    }
  }, [user])

  if (authLoading || !user) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    )
  }

  const isBuyer = user.role === "buyer"
  const buyerProfile = isBuyer ? (profile as UserProfile | null) : null
  const storeProfile = !isBuyer ? (profile as StoreProfile | null) : null

  const displayName = isBuyer
    ? buyerProfile
      ? `${buyerProfile.first_name} ${buyerProfile.last_name}`.trim()
      : user.name
    : storeProfile?.name ?? user.name

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError(null)

    const form = e.currentTarget
    try {
      if (isBuyer) {
        const updated = await userService.updateUser(user.id, {
          first_name: (form.elements.namedItem("first_name") as HTMLInputElement).value,
          last_name: (form.elements.namedItem("last_name") as HTMLInputElement).value,
        })
        setProfile(updated)
        // Refresh auth context to update name
        await refreshUser()
      } else {
        const updated = await storeService.updateStore(user.id, {
          name: (form.elements.namedItem("name") as HTMLInputElement).value,
          description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
          address: (form.elements.namedItem("address") as HTMLInputElement).value,
          phone_number: (form.elements.namedItem("phone_number") as HTMLInputElement).value,
        })
        setProfile(updated)
        // Refresh auth context to update name
        await refreshUser()
      }
      setIsEditing(false)
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to save changes.")
      setSaveError(message)
    } finally {
      setIsSaving(false)
    }
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
                <h1 className="text-3xl font-bold">{displayName}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* Account Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Account Information</CardTitle>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSave} className="space-y-4">
                    {isBuyer ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            name="first_name"
                            defaultValue={buyerProfile?.first_name ?? ""}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            name="last_name"
                            defaultValue={buyerProfile?.last_name ?? ""}
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Store Name</Label>
                          <Input id="name" name="name" defaultValue={storeProfile?.name ?? ""} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            name="description"
                            defaultValue={storeProfile?.description ?? ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input id="address" name="address" defaultValue={storeProfile?.address ?? ""} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone_number">Phone Number</Label>
                          <Input
                            id="phone_number"
                            name="phone_number"
                            defaultValue={storeProfile?.phone_number ?? ""}
                          />
                        </div>
                      </div>
                    )}
                    {saveError && <p className="text-sm text-destructive">{saveError}</p>}
                    <div className="flex gap-2 pt-2">
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {isBuyer ? (
                      <>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="size-4" />
                            <span>First Name</span>
                          </div>
                          <p className="font-medium">{buyerProfile?.first_name ?? "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="size-4" />
                            <span>Last Name</span>
                          </div>
                          <p className="font-medium">{buyerProfile?.last_name ?? "—"}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1 sm:col-span-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Store className="size-4" />
                            <span>Store Name</span>
                          </div>
                          <p className="font-medium">{storeProfile?.name ?? "—"}</p>
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p className="font-medium">{storeProfile?.description ?? "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="font-medium">{storeProfile?.address ?? "—"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{storeProfile?.phone_number ?? "—"}</p>
                        </div>
                      </>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="size-4" />
                        <span>Email</span>
                      </div>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {isBuyer ? <ShoppingBag className="size-4" /> : <Store className="size-4" />}
                        <span>Account Type</span>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Role-specific features */}
            {isBuyer && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="size-5" />
                    Recent Orders
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/orders">
                      View All
                      <ArrowRight className="size-4 ml-1" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
                  ) : recentOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="size-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Button asChild>
                        <Link href="/">Start Shopping</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate">Order #{order.id}</p>
                              <Badge variant={orderStatusColors[order.status]} className="capitalize text-xs">
                                {order.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} {order.items.length === 1 ? "item" : "items"} • {" "}
                              {new Date(order.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold">${order.total_price.toFixed(2)}</p>
                            <Button variant="ghost" size="sm" asChild className="h-auto p-0">
                              <Link href={`/orders/${order.id}`}>View Details</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!isBuyer && (
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
                      <Link href="/seller">Go to Dashboard</Link>
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
