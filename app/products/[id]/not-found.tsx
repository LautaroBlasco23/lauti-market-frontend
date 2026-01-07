import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PackageX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <PackageX className="size-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/">Back to Products</Link>
        </Button>
      </div>
    </div>
  )
}
