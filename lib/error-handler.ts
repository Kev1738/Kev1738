export interface ApiError {
  success: false
  error: string
  code?: string
  details?: any
}

export interface ApiSuccess<T = any> {
  success: true
  data?: T
  message?: string
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError

export class AppError extends Error {
  public code: string
  public statusCode: number
  public details?: any

  constructor(message: string, code = "UNKNOWN_ERROR", statusCode = 500, details?: any) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

export function createErrorResponse(error: unknown, defaultMessage = "An error occurred"): ApiError {
  console.error("Error occurred:", error)

  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: "GENERIC_ERROR",
    }
  }

  return {
    success: false,
    error: defaultMessage,
    code: "UNKNOWN_ERROR",
  }
}

export function createSuccessResponse<T>(data?: T, message?: string): ApiSuccess<T> {
  return {
    success: true,
    data,
    message,
  }
}
