"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { authService } from "@/lib/auth-service"
import { productService } from "@/lib/product-service"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters"),
  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category must be at most 50 characters"),
  price: z.coerce.number({ invalid_type_error: "Price must be a number" }).positive("Price must be greater than 0"),
  stock: z.coerce
    .number({ invalid_type_error: "Stock must be a number" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
})

type FormValues = z.infer<typeof schema>

export default function NewProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    const user = authService.getCurrentUser()
    if (!user) {
      router.push("/login")
    } else if (user.role !== "seller") {
      router.push("/")
    }
  }, [router])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(file ? URL.createObjectURL(file) : null)
  }

  const clearImage = () => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const onSubmit = async (values: FormValues) => {
    const user = authService.getCurrentUser()
    if (!user) return

    try {
      await productService.createProduct(user.id, {
        name: values.name,
        description: values.description,
        category: values.category,
        price: values.price,
        stock: values.stock,
        image: imageFile ?? undefined,
      })
      router.push("/seller")
    } catch (err: unknown) {
      const e = err as { error?: string; fields?: Record<string, string> }
      if (e?.fields) {
        for (const [field, message] of Object.entries(e.fields)) {
          setError(field as keyof FormValues, { message })
        }
      } else {
        setError("root", { message: e?.error ?? "Failed to create product" })
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/seller">
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
            <CardDescription>Fill in the details to list a new product in your store</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" placeholder="e.g. Wireless Headphones" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product..."
                  rows={4}
                  {...register("description")}
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g. Electronics" {...register("category")} />
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" step="0.01" min="0.01" placeholder="0.00" {...register("price")} />
                  {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" min="0" step="1" placeholder="0" {...register("stock")} />
                  {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>
                  Product Image <span className="text-muted-foreground">(optional)</span>
                </Label>

                {imagePreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image src={imagePreview} alt="Product preview" fill className="object-contain" />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      className="absolute top-2 right-2"
                      onClick={clearImage}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 py-10 text-muted-foreground transition-colors hover:border-muted-foreground/60 hover:bg-muted/50"
                  >
                    <ImagePlus className="size-8" />
                    <span className="text-sm">Click to upload an image</span>
                    <span className="text-xs">PNG, JPG, WEBP up to 10 MB</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Creating..." : "Create Product"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/seller">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <SiteFooter />
    </div>
  )
}
