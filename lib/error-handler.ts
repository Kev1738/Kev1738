export class AppError extends Error {
  public statusCode: number
  public code: string
  public details?: any

  constructor(message: string, code = "UNKNOWN_ERROR", statusCode = 500, details?: any) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: string
  timestamp: string
}

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  }
}

export function createErrorResponse(error: any, message?: string): ApiResponse {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorCode = error instanceof AppError ? error.code : "UNKNOWN_ERROR"

  return {
    success: false,
    error: errorMessage,
    message: message || errorMessage,
    code: errorCode,
    timestamp: new Date().toISOString(),
  }
}

export function handleApiError(error: any): { statusCode: number; response: ApiResponse } {
  console.error("🔥 API Error:", error)

  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      response: createErrorResponse(error, error.message),
    }
  }

  // Default to 500 for unknown errors
  return {
    statusCode: 500,
    response: createErrorResponse(error, "Internal server error"),
  }
}

export function validateRequired(data: Record<string, any>, requiredFields: string[]): void {
  const missing = requiredFields.filter((field) => !data[field])
  if (missing.length > 0) {
    throw new AppError(`Missing required fields: ${missing.join(", ")}`, "VALIDATION_ERROR", 400)
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password) {
    return { valid: false, message: "Password is required" }
  }
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long" }
  }
  return { valid: true }
}
