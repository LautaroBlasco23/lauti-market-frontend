// Mock data for the marketplace

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  sellerId: string
  sellerName: string
  stock: number
}

export interface User {
  id: string
  name: string
  email: string
  role: "buyer" | "seller"
}

export interface Order {
  id: string
  productId: string
  productName: string
  buyerName: string
  quantity: number
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  date: string
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    description: "Premium noise-canceling wireless headphones with 30-hour battery life",
    price: 299.99,
    image: "/wireless-headphones.png",
    category: "Electronics",
    sellerId: "s1",
    sellerName: "TechGear Store",
    stock: 15,
  },
  {
    id: "2",
    name: "Minimalist Backpack",
    description: "Sleek water-resistant backpack with laptop compartment",
    price: 79.99,
    image: "/minimalist-backpack.png",
    category: "Fashion",
    sellerId: "s2",
    sellerName: "Urban Essentials",
    stock: 24,
  },
  {
    id: "3",
    name: "Smart Watch",
    description: "Fitness tracking smartwatch with heart rate monitor",
    price: 249.99,
    image: "/smartwatch-lifestyle.png",
    category: "Electronics",
    sellerId: "s1",
    sellerName: "TechGear Store",
    stock: 8,
  },
  {
    id: "4",
    name: "Organic Coffee Beans",
    description: "Premium single-origin organic coffee beans, medium roast",
    price: 24.99,
    image: "/pile-of-coffee-beans.png",
    category: "Food",
    sellerId: "s3",
    sellerName: "Artisan Coffee Co.",
    stock: 50,
  },
  {
    id: "5",
    name: "Yoga Mat",
    description: "Eco-friendly non-slip yoga mat with carrying strap",
    price: 45.0,
    image: "/rolled-yoga-mat.png",
    category: "Sports",
    sellerId: "s4",
    sellerName: "Wellness Studio",
    stock: 32,
  },
  {
    id: "6",
    name: "Desk Lamp",
    description: "LED desk lamp with adjustable brightness and color temperature",
    price: 59.99,
    image: "/modern-desk-lamp.png",
    category: "Home",
    sellerId: "s2",
    sellerName: "Urban Essentials",
    stock: 18,
  },
]

export const mockUser: User = {
  id: "u1",
  name: "John Doe",
  email: "john@example.com",
  role: "buyer",
}

export const mockSellerUser: User = {
  id: "s1",
  name: "TechGear Store",
  email: "seller@techgear.com",
  role: "seller",
}

export const mockOrders: Order[] = [
  {
    id: "o1",
    productId: "1",
    productName: "Wireless Headphones",
    buyerName: "Alice Johnson",
    quantity: 2,
    total: 599.98,
    status: "processing",
    date: "2026-01-05",
  },
  {
    id: "o2",
    productId: "3",
    productName: "Smart Watch",
    buyerName: "Bob Smith",
    quantity: 1,
    total: 249.99,
    status: "shipped",
    date: "2026-01-04",
  },
  {
    id: "o3",
    productId: "1",
    productName: "Wireless Headphones",
    buyerName: "Carol White",
    quantity: 1,
    total: 299.99,
    status: "delivered",
    date: "2026-01-02",
  },
  {
    id: "o4",
    productId: "3",
    productName: "Smart Watch",
    buyerName: "David Brown",
    quantity: 3,
    total: 749.97,
    status: "pending",
    date: "2026-01-06",
  },
]

export const mockCategories = ["All", "Electronics", "Fashion", "Food", "Sports", "Home"]
