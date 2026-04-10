const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// Custom error class that includes status code
export class ApiError extends Error {
  status: number
  fields: Record<string, string> | null
  rawResponse: unknown

  constructor(message: string, status: number, fields: Record<string, string> | null = null, rawResponse: unknown = null) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fields = fields
    this.rawResponse = rawResponse
  }
}

/**
 * Extracts error message from various response formats.
 * Tries common error field names in order of priority.
 */
function extractErrorMessage(data: unknown, status: number): string {
  // If data is a string, return it directly
  if (typeof data === "string" && data.trim()) {
    return data
  }

  // If data is an object, try common error field names
  if (typeof data === "object" && data !== null) {
    const errorObj = data as Record<string, unknown>
    
    // Try common error field names in priority order
    const errorFields = ["error", "message", "detail", "msg", "description", "reason"]
    for (const field of errorFields) {
      const value = errorObj[field]
      if (typeof value === "string" && value.trim()) {
        return value
      }
      // Handle nested error objects (e.g., { error: { message: "..." } })
      if (typeof value === "object" && value !== null) {
        const nested = value as Record<string, unknown>
        if (typeof nested.message === "string" && nested.message.trim()) {
          return nested.message
        }
        if (typeof nested.error === "string" && nested.error.trim()) {
          return nested.error
        }
      }
    }

    // If no standard fields found, try to stringify the whole object
    // but only if it's not empty
    const keys = Object.keys(errorObj)
    if (keys.length > 0) {
      // Try to get any string value from the object
      for (const key of keys) {
        const value = errorObj[key]
        if (typeof value === "string" && value.trim()) {
          return value
        }
      }
    }
  }

  // Fallback to HTTP status messages
  const statusMessages: Record<number, string> = {
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    422: "Validation failed",
    500: "Server error",
    502: "Bad gateway",
    503: "Service unavailable",
  }
  
  return statusMessages[status] ?? `Request failed (status ${status})`
}

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

  // Clone the response so we can try different parsing methods
  const resClone = res.clone()
  
  let data: unknown = {}
  
  // Try to parse as JSON first
  try {
    data = await res.json()
  } catch {
    // If JSON parsing fails, try text
    try {
      const text = await resClone.text()
      if (text.trim()) {
        data = text
      }
    } catch {
      // If all parsing fails, use empty object
      data = {}
    }
  }

  if (!res.ok) {
    const errorMessage = extractErrorMessage(data, res.status)
    const fields = (typeof data === "object" && data !== null) 
      ? (data as Record<string, unknown>).fields as Record<string, string> ?? null
      : null
    throw new ApiError(errorMessage, res.status, fields, data)
  }

  return data as T
}
