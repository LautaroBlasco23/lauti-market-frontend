"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Store, ShoppingBag } from "lucide-react"
import { authService } from "@/lib/auth-service"
import { userService, type UserProfile } from "@/lib/user-service"
import { storeService, type StoreProfile } from "@/lib/store-service"

export default function ProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser())
  const [profile, setProfile] = useState<UserProfile | StoreProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }
    setCurrentUser(user)

    if (user.role === "buyer") {
      userService.getUser(user.id).then(setProfile).catch(() => null)
    } else {
      storeService.getStore(user.id).then(setProfile).catch(() => null)
    }
  }, [router])

  if (!currentUser) {
    return null
  }

  const isBuyer = currentUser.role === "buyer"
  const buyerProfile = isBuyer ? (profile as UserProfile | null) : null
  const storeProfile = !isBuyer ? (profile as StoreProfile | null) : null

  const displayName = isBuyer
    ? buyerProfile
      ? `${buyerProfile.first_name} ${buyerProfile.last_name}`.trim()
      : currentUser.name
    : storeProfile?.name ?? currentUser.name

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError(null)

    const form = e.currentTarget
    try {
      if (isBuyer) {
        const updated = await userService.updateUser(currentUser.id, {
          first_name: (form.elements.namedItem("first_name") as HTMLInputElement).value,
          last_name: (form.elements.namedItem("last_name") as HTMLInputElement).value,
        })
        setProfile(updated)
        // Refresh name in localStorage
        const refreshed = { ...currentUser, name: `${updated.first_name} ${updated.last_name}`.trim() }
        localStorage.setItem("auth_user", JSON.stringify(refreshed))
        setCurrentUser(refreshed)
      } else {
        const updated = await storeService.updateStore(currentUser.id, {
          name: (form.elements.namedItem("name") as HTMLInputElement).value,
          description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
          address: (form.elements.namedItem("address") as HTMLInputElement).value,
          phone_number: (form.elements.namedItem("phone_number") as HTMLInputElement).value,
        })
        setProfile(updated)
        const refreshed = { ...currentUser, name: updated.name }
        localStorage.setItem("auth_user", JSON.stringify(refreshed))
        setCurrentUser(refreshed)
      }
      setIsEditing(false)
    } catch (err: unknown) {
      setSaveError((err as { error?: string })?.error ?? "Failed to save changes.")
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
                <p className="text-muted-foreground">{currentUser.email}</p>
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
                      <p className="font-medium">{currentUser.email}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {isBuyer ? <ShoppingBag className="size-4" /> : <Store className="size-4" />}
                        <span>Account Type</span>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {currentUser.role}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Role-specific features */}
            {isBuyer && (
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
