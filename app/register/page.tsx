"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { authService } from "@/lib/auth-service"
import { useAuth } from "@/contexts/auth-context"
import { getErrorMessage } from "@/lib/error-utils"

// ── Buyer schema ──────────────────────────────────────────────────────────────
const buyerSchema = z.object({
  first_name: z.string().min(2, "Min 2 chars").max(50, "Max 50 chars"),
  last_name: z.string().min(2, "Min 2 chars").max(50, "Max 50 chars"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 chars").max(72, "Max 72 chars"),
})
type BuyerValues = z.infer<typeof buyerSchema>

// ── Seller schema ─────────────────────────────────────────────────────────────
const sellerSchema = z.object({
  name: z.string().min(2, "Min 2 chars").max(100, "Max 100 chars"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 chars").max(72, "Max 72 chars"),
  description: z.string().min(10, "Min 10 chars").max(500, "Max 500 chars"),
  address: z.string().min(5, "Min 5 chars").max(200, "Max 200 chars"),
  phone_number: z.string().min(8, "Min 8 chars").max(20, "Max 20 chars"),
})
type SellerValues = z.infer<typeof sellerSchema>

// ── Buyer form ────────────────────────────────────────────────────────────────
function BuyerForm({ onSuccess }: { onSuccess: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BuyerValues>({ resolver: zodResolver(buyerSchema) })

  const onSubmit = async (values: BuyerValues) => {
    setServerError(null)
    try {
      await authService.registerUser(values)
      onSuccess()
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Registration failed")
      setServerError(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="first_name">First name</Label>
          <Input id="first_name" {...register("first_name")} />
          {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="last_name">Last name</Label>
          <Input id="last_name" {...register("last_name")} />
          {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="buyer_email">Email</Label>
        <Input id="buyer_email" type="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="buyer_password">Password</Label>
        <Input id="buyer_password" type="password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create buyer account"}
      </Button>
    </form>
  )
}

// ── Seller form ───────────────────────────────────────────────────────────────
function SellerForm({ onSuccess }: { onSuccess: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SellerValues>({ resolver: zodResolver(sellerSchema) })

  const onSubmit = async (values: SellerValues) => {
    setServerError(null)
    try {
      await authService.registerStore(values)
      onSuccess()
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Registration failed")
      setServerError(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="store_name">Store name</Label>
        <Input id="store_name" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="seller_email">Email</Label>
        <Input id="seller_email" type="email" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="seller_password">Password</Label>
        <Input id="seller_password" type="password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} />
        {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="phone_number">Phone number</Label>
        <Input id="phone_number" {...register("phone_number")} />
        {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number.message}</p>}
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating store..." : "Create seller account"}
      </Button>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()

  const handleBuyerSuccess = async () => {
    await refreshUser()
    router.push("/")
  }

  const handleSellerSuccess = async () => {
    await refreshUser()
    router.push("/seller")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Package className="size-8" />
          <h1 className="text-3xl font-bold">Marketplace</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Choose your account type to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buyer">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="buyer" className="flex-1">Buyer</TabsTrigger>
                <TabsTrigger value="seller" className="flex-1">Seller</TabsTrigger>
              </TabsList>
              <TabsContent value="buyer">
                <BuyerForm onSuccess={handleBuyerSuccess} />
              </TabsContent>
              <TabsContent value="seller">
                <SellerForm onSuccess={handleSellerSuccess} />
              </TabsContent>
            </Tabs>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4 hover:text-foreground">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
