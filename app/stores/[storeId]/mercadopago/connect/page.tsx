"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, ArrowLeft, ExternalLink } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { apiFetch } from "@/lib/api-client"
import { useRequireAuth } from "@/contexts/auth-context"

interface ConnectResponse {
  auth_url: string
}

export default function MercadoPagoConnectPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.storeId as string
  const { user, isLoading: authLoading } = useRequireAuth(["seller"])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authUrl, setAuthUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!storeId || !user) return

    // Verify the user is connecting their own store
    if (user.id !== storeId) {
      setError("You can only connect MercadoPago to your own store.")
      return
    }

    // Fetch the MercadoPago OAuth URL from the backend
    const fetchAuthUrl = async () => {
      setLoading(true)
      try {
        const response = await apiFetch<ConnectResponse>(`/stores/${storeId}/mercadopago/connect`)
        setAuthUrl(response.auth_url)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get MercadoPago connection URL")
      } finally {
        setLoading(false)
      }
    }

    fetchAuthUrl()
  }, [storeId, user])

  const handleConnect = () => {
    if (authUrl) {
      window.location.href = authUrl
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/seller")}
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="size-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Connect MercadoPago</CardTitle>
            <CardDescription>
              Connect your MercadoPago account to start receiving payments from customers.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                By connecting your MercadoPago account, you&apos;ll be able to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Receive payments directly to your MercadoPago account</li>
                <li>Create and sell products on the marketplace</li>
                <li>Track your sales and payments in one place</li>
              </ul>
            </div>

            <Button
              onClick={handleConnect}
              disabled={loading || !authUrl}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="size-4 mr-2" />
                  Connect with MercadoPago
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You&apos;ll be redirected to MercadoPago to authorize the connection.
            </p>
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  )
}
