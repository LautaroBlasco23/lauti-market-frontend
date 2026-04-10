import { ApiError } from "./api-client"

/**
 * Extracts a user-friendly error message from various error types.
 * 
 * Priority:
 * 1. ApiError.message (extracted from backend response)
 * 2. Plain object error.error or error.message
 * 3. Error.message
 * 4. Fallback message
 */
export function getErrorMessage(err: unknown, fallback = "An unexpected error occurred"): string {
  // Handle ApiError instances (our custom error class)
  if (err instanceof ApiError) {
    // Return the message if it's meaningful (not just a generic fallback)
    if (err.message && err.message !== "Request failed") {
      return err.message
    }
    // Try to extract from raw response if available
    if (err.rawResponse) {
      const fromRaw = extractFromRawResponse(err.rawResponse)
      if (fromRaw) return fromRaw
    }
    return fallback
  }

  // Handle plain objects with error properties
  if (typeof err === "object" && err !== null) {
    const errorObj = err as Record<string, unknown>
    
    // Check for common error fields
    const errorFields = ["error", "message", "detail", "msg", "description", "reason"]
    for (const field of errorFields) {
      const value = errorObj[field]
      if (typeof value === "string" && value.trim()) {
        return value
      }
      // Handle nested objects
      if (typeof value === "object" && value !== null) {
        const nestedMsg = extractFromRawResponse(value)
        if (nestedMsg) return nestedMsg
      }
    }
  }

  // Handle standard Error instances
  if (err instanceof Error) {
    if (err.message && err.message !== "Request failed") {
      return err.message
    }
  }

  // Handle string errors
  if (typeof err === "string" && err.trim()) {
    return err
  }

  return fallback
}

/**
 * Helper to extract message from raw response object
 */
function extractFromRawResponse(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) {
    return data
  }
  
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>
    const errorFields = ["error", "message", "detail", "msg", "description", "reason"]
    for (const field of errorFields) {
      const value = obj[field]
      if (typeof value === "string" && value.trim()) {
        return value
      }
      // Handle nested error objects
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
  }
  
  return null
}

/**
 * Checks if an error is an API error with field-level validation errors.
 */
export function hasFieldErrors(err: unknown): err is ApiError {
  return err instanceof ApiError && err.fields !== null && Object.keys(err.fields).length > 0
}

/**
 * Gets field-level errors from an ApiError.
 * Returns null if not an ApiError or no field errors.
 */
export function getFieldErrors(err: unknown): Record<string, string> | null {
  if (err instanceof ApiError) {
    return err.fields
  }
  return null
}

/**
 * Gets the HTTP status code from an error.
 * Returns null if not an ApiError.
 */
export function getErrorStatus(err: unknown): number | null {
  if (err instanceof ApiError) {
    return err.status
  }
  return null
}

/**
 * Checks if an error is a specific HTTP status.
 */
export function isErrorStatus(err: unknown, status: number): boolean {
  return getErrorStatus(err) === status
}

/**
 * Common error type checkers.
 */
export const errorCheckers = {
  isUnauthorized: (err: unknown) => isErrorStatus(err, 401),
  isForbidden: (err: unknown) => isErrorStatus(err, 403),
  isNotFound: (err: unknown) => isErrorStatus(err, 404),
  isBadRequest: (err: unknown) => isErrorStatus(err, 400),
  isValidationError: (err: unknown) => isErrorStatus(err, 422),
  isServerError: (err: unknown) => {
    const status = getErrorStatus(err)
    return status !== null && status >= 500
  },
}
