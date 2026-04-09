"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, User, LogIn, LogOut, Store, ShoppingBag } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cartService } from "@/lib/mock-services"
import { useAuth } from "@/contexts/auth-context"

export function SiteHeader() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)

  useEffect(() => {
    setMounted(true)

    // Update cart count
    const updateCartCount = () => {
      const cart = cartService.getCart()
      const count = cart.reduce((sum, item) => sum + item.quantity, 0)
      setCartItemCount(count)
    }

    updateCartCount()

    // Poll for cart updates only (not auth state - AuthContext handles that)
    const interval = setInterval(() => {
      updateCartCount()
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
    router.refresh()
  }

  // Consistent SSR/initial render state to avoid hydration mismatch
  if (!mounted || isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Package className="size-6" />
            <span className="font-bold text-xl">Marketplace</span>
          </Link>

          {/* Placeholder for navigation to maintain layout */}
          <div className="hidden md:flex items-center gap-1" />

          {/* Actions placeholder */}
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/login">
                <LogIn className="size-4 mr-2" />
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={user?.role === "seller" ? "/seller" : "/"} className="flex items-center gap-2 shrink-0">
          <Package className="size-6" />
          <span className="font-bold text-xl">Marketplace</span>
        </Link>

        {/* Navigation Links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {user.role === "buyer" && (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/">
                    <ShoppingBag className="size-4 mr-2" />
                    Products
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/orders">My Orders</Link>
                </Button>
              </>
            )}
            {user.role === "seller" && (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/seller">
                    <Store className="size-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/">Browse Products</Link>
                </Button>
              </>
            )}
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Cart - only for buyers */}
          {user?.role === "buyer" && (
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="size-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>
          )}

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="size-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {user.role === "buyer" ? "Buyer" : "Seller"}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                {user.role === "buyer" && (
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                )}
                {user.role === "seller" && (
                  <DropdownMenuItem asChild>
                    <Link href="/seller">
                      <Store className="size-4 mr-2" />
                      Seller Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">
                <LogIn className="size-4 mr-2" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
