import { apiFetch } from "./api-client"

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
}

export const userService = {
  getUser: (id: string): Promise<UserProfile> =>
    apiFetch<UserProfile>(`/users/${id}`),

  updateUser: (id: string, data: { first_name?: string; last_name?: string }): Promise<UserProfile> =>
    apiFetch<UserProfile>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteUser: (id: string): Promise<void> =>
    apiFetch<void>(`/users/${id}`, { method: "DELETE" }),
}
