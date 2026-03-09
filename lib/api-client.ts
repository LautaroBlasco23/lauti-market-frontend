const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token")
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw { error: data.error ?? data.message ?? "Request failed", fields: data.fields ?? null }
  }

  return data as T
}
