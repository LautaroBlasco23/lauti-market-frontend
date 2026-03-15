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

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const res = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    // Store token before fetching profile (apiFetch reads it from localStorage)
    localStorage.setItem("auth_token", res.token)

    let name: string
    if (res.account_type === "user") {
      const profile = await apiFetch<{ first_name: string; last_name: string }>(`/users/${res.account_id}`)
      name = `${profile.first_name} ${profile.last_name}`.trim()
    } else {
      const store = await apiFetch<{ name: string }>(`/stores/${res.account_id}`)
      name = store.name
    }

    const user: User = {
      id: res.account_id,
      name,
      email,
      role: res.account_type === "user" ? "buyer" : "seller",
    }
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
