import { apiFetch } from "./api-client"

export interface StoreProfile {
  id: string
  name: string
  description: string
  address: string
  phone_number: string
}

export const storeService = {
  getAllStores: (): Promise<StoreProfile[]> =>
    apiFetch<StoreProfile[]>("/stores"),

  getStore: (id: string): Promise<StoreProfile> =>
    apiFetch<StoreProfile>(`/stores/${id}`),

  updateStore: (id: string, data: Partial<Omit<StoreProfile, "id">>): Promise<StoreProfile> =>
    apiFetch<StoreProfile>(`/stores/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteStore: (id: string): Promise<void> =>
    apiFetch<void>(`/stores/${id}`, { method: "DELETE" }),
}
