import type { Product as ApiProduct } from "./product-service"

const CART_STORAGE_KEY = 'market_cart'

function getStoredCart(): Array<{ product: ApiProduct; quantity: number }> {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function setStoredCart(items: Array<{ product: ApiProduct; quantity: number }>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

export const cartService = {
  addToCart: (product: ApiProduct, quantity = 1) => {
    const items = getStoredCart()
    const existingItem = items.find((item) => item.product.id === product.id)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.push({ product, quantity })
    }
    setStoredCart(items)
  },

  removeFromCart: (productId: string) => {
    const items = getStoredCart().filter((item) => item.product.id !== productId)
    setStoredCart(items)
  },

  getCart: () => getStoredCart(),

  clearCart: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(CART_STORAGE_KEY)
  },

  getTotal: () => {
    return getStoredCart().reduce((total, item) => total + item.product.price * item.quantity, 0)
  },
}
