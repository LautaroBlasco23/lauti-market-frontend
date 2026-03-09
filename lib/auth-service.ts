import { apiFetch } from "./api-client"

export type UserRole = "buyer" | "seller"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface LoginResponse {
  token: string
  account_id: string
  account_type: string
}

interface RegisterUserData {
  first_name: string
  last_name: string
  email: string
  password: string
}

interface RegisterStoreData {
  name: string
  email: string
  password: string
  description: string
  address: string
  phone_number: string
}

function toUser(res: LoginResponse, email: string): User {
  const localPart = email.split("@")[0]
  return {
    id: res.account_id,
    name: localPart,
    email,
    role: res.account_type === "user" ? "buyer" : "seller",
  }
}

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const res = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    const user = toUser(res, email)
    localStorage.setItem("auth_token", res.token)
    localStorage.setItem("auth_user", JSON.stringify(user))
    return user
  },

  logout: () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem("auth_user")
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch {
      return null
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("auth_token") !== null
  },

  registerUser: async (data: RegisterUserData): Promise<void> => {
    await apiFetch("/auth/register/user", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  registerStore: async (data: RegisterStoreData): Promise<void> => {
    await apiFetch("/auth/register/store", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
}
