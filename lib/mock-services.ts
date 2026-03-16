import type { Product as ApiProduct } from "./product-service"

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
