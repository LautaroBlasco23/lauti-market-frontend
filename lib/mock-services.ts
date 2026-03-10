// Mock services for the marketplace

import { type Product, mockProducts, type Order, mockOrders } from "./mock-data"
import type { Product as ApiProduct } from "./product-service"

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockProducts
  },

  getProductById: async (id: string): Promise<Product | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockProducts.find((p) => p.id === id) || null
  },

  getProductsByCategory: async (category: string): Promise<Product[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    if (category === "All") return mockProducts
    return mockProducts.filter((p) => p.category === category)
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const lowerQuery = query.toLowerCase()
    return mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery),
    )
  },
}

export const cartService = {
  items: [] as Array<{ product: ApiProduct; quantity: number }>,

  addToCart: (product: ApiProduct, quantity = 1) => {
    const existingItem = cartService.items.find((item) => item.product.id === product.id)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cartService.items.push({ product, quantity })
    }
  },

  removeFromCart: (productId: string) => {
    cartService.items = cartService.items.filter((item) => item.product.id !== productId)
  },

  getCart: () => cartService.items,

  clearCart: () => {
    cartService.items = []
  },

  getTotal: () => {
    return cartService.items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  },
}

export const sellerService = {
  getSellerProducts: async (sellerId: string): Promise<Product[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockProducts.filter((p) => p.sellerId === sellerId)
  },

  getSellerOrders: async (sellerId: string): Promise<Order[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const sellerProducts = mockProducts.filter((p) => p.sellerId === sellerId)
    const sellerProductIds = sellerProducts.map((p) => p.id)
    return mockOrders.filter((o) => sellerProductIds.includes(o.productId))
  },

  updateOrderStatus: async (orderId: string, status: Order["status"]): Promise<Order | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const order = mockOrders.find((o) => o.id === orderId)
    if (order) {
      order.status = status
      return order
    }
    return null
  },

  addProduct: async (product: Omit<Product, "id">): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const newProduct: Product = {
      ...product,
      id: String(mockProducts.length + 1),
    }
    mockProducts.push(newProduct)
    return newProduct
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const product = mockProducts.find((p) => p.id === id)
    if (product) {
      Object.assign(product, updates)
      return product
    }
    return null
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const index = mockProducts.findIndex((p) => p.id === id)
    if (index !== -1) {
      mockProducts.splice(index, 1)
      return true
    }
    return false
  },
}

export type { UserRole, User } from "./auth-service"
export { authService } from "./auth-service"
