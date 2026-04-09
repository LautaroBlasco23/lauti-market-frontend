"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"
import { useRouter, usePathname } from "next/navigation"
import { apiFetch, ApiError } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"

export type UserRole = "buyer" | "seller"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface MeResponse {
  auth_id: string
  account_id: string
  account_type: string
}

// List of protected routes that require authentication
const PROTECTED_ROUTES = [
  "/checkout",
  "/orders",
  "/cart",
  "/profile",
  "/seller",
]

// Routes that are exclusively for buyers
const BUYER_ROUTES = ["/checkout", "/orders", "/cart"]

// Routes that are exclusively for sellers
const SELLER_ROUTES = ["/seller"]

function isProtectedRoute(path: string): boolean {
  return PROTECTED_ROUTES.some((route) => path.startsWith(route))
}

function getRedirectPathForRole(role: UserRole): string {
  return role === "seller" ? "/seller" : "/"
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const logout = (showToast = true) => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    setUser(null)
    if (showToast) {
      toast({
        title: "Session expired",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
      })
    }
    // Only redirect if on a protected route
    if (isProtectedRoute(pathname)) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }

  const fetchUserProfile = async (accountId: string, accountType: string): Promise<User | null> => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return null

      if (accountType === "user") {
        const profile = await apiFetch<{ first_name: string; last_name: string; email?: string }>(
          `/users/${accountId}`
        )
        const storedUser = localStorage.getItem("auth_user")
        const parsedStored = storedUser ? JSON.parse(storedUser) : null
        return {
          id: accountId,
          name: `${profile.first_name} ${profile.last_name}`.trim(),
          email: profile.email || parsedStored?.email || "",
          role: "buyer",
        }
      } else {
        const store = await apiFetch<{ name: string; email?: string }>(`/stores/${accountId}`)
        const storedUser = localStorage.getItem("auth_user")
        const parsedStored = storedUser ? JSON.parse(storedUser) : null
        return {
          id: accountId,
          name: store.name,
          email: store.email || parsedStored?.email || "",
          role: "seller",
        }
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      return null
    }
  }

  const validateAuth = async () => {
    const token = localStorage.getItem("auth_token")
    
    if (!token) {
      setIsLoading(false)
      if (isProtectedRoute(pathname)) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      }
      return
    }

    try {
      // Validate token with backend
      const me = await apiFetch<MeResponse>("/auth/me")
      
      // Token is valid, now fetch the full profile to get name/email
      const profile = await fetchUserProfile(me.account_id, me.account_type)
      
      if (profile) {
        setUser(profile)
        localStorage.setItem("auth_user", JSON.stringify(profile))
      } else {
        // Profile fetch failed, user might have been deleted
        logout(true)
      }
    } catch (error: any) {
      // Token is invalid or expired
      if (error instanceof ApiError && error.status === 401) {
        logout(true)
      } else {
        // Other error, try to use cached user data
        const storedUser = localStorage.getItem("auth_user")
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser))
          } catch {
            logout(false)
          }
        } else {
          logout(false)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    await validateAuth()
  }

  // Validate auth on initial load and when pathname changes
  useEffect(() => {
    validateAuth()
  }, [pathname])

  // Check role-based access restrictions
  useEffect(() => {
    if (isLoading) return
    
    if (!user && isProtectedRoute(pathname)) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    if (user) {
      // Check buyer-only routes
      if (user.role === "seller" && BUYER_ROUTES.some((route) => pathname.startsWith(route))) {
        router.push("/seller")
        return
      }
      
      // Check seller-only routes
      if (user.role === "buyer" && SELLER_ROUTES.some((route) => pathname.startsWith(route))) {
        router.push("/")
        return
      }
    }
  }, [user, isLoading, pathname])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: () => logout(true),
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Hook for protected routes that need to wait for auth validation
export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push(getRedirectPathForRole(user.role))
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, pathname, router])

  return { user, isLoading, isAuthenticated }
}
