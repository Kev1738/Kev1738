import { NextResponse } from "next/server"

export interface ApiError {
  code: string
  message: string
  details?: any
  statusCode: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
  timestamp: string
}

// Create error response
export function createErrorResponse(
  message: string,
  statusCode = 500,
  code?: string,
  details?: any,
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: {
      code: code || getErrorCode(statusCode),
      message,
      details,
      statusCode,
    },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response, { status: statusCode })
}

// Create success response
export function createSuccessResponse<T>(data?: T, message?: string, statusCode = 200): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(response, { status: statusCode })
}

// Get error code based on status code
function getErrorCode(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "BAD_REQUEST"
    case 401:
      return "UNAUTHORIZED"
    case 403:
      return "FORBIDDEN"
    case 404:
      return "NOT_FOUND"
    case 409:
      return "CONFLICT"
    case 422:
      return "VALIDATION_ERROR"
    case 429:
      return "RATE_LIMIT_EXCEEDED"
    case 500:
      return "INTERNAL_SERVER_ERROR"
    case 502:
      return "BAD_GATEWAY"
    case 503:
      return "SERVICE_UNAVAILABLE"
    default:
      return "UNKNOWN_ERROR"
  }
}

// Common error handlers
export const ErrorHandlers = {
  // Authentication errors
  unauthorized: (message = "Authentication required") => createErrorResponse(message, 401, "UNAUTHORIZED"),

  forbidden: (message = "Access denied") => createErrorResponse(message, 403, "FORBIDDEN"),

  invalidCredentials: (message = "Invalid email or password") =>
    createErrorResponse(message, 401, "INVALID_CREDENTIALS"),

  // Validation errors
  validationError: (message = "Validation failed", details?: any) =>
    createErrorResponse(message, 422, "VALIDATION_ERROR", details),

  missingFields: (fields: string[]) =>
    createErrorResponse(`Missing required fields: ${fields.join(", ")}`, 422, "MISSING_FIELDS", {
      missingFields: fields,
    }),

  invalidFormat: (field: string, expectedFormat?: string) =>
    createErrorResponse(
      `Invalid format for field: ${field}${expectedFormat ? `. Expected: ${expectedFormat}` : ""}`,
      422,
      "INVALID_FORMAT",
      { field, expectedFormat },
    ),

  // Resource errors
  notFound: (resource = "Resource") => createErrorResponse(`${resource} not found`, 404, "NOT_FOUND"),

  alreadyExists: (resource = "Resource") => createErrorResponse(`${resource} already exists`, 409, "ALREADY_EXISTS"),

  // Database errors
  databaseError: (message = "Database operation failed") => createErrorResponse(message, 500, "DATABASE_ERROR"),

  connectionError: (message = "Database connection failed") => createErrorResponse(message, 503, "CONNECTION_ERROR"),

  // Rate limiting
  rateLimitExceeded: (message = "Rate limit exceeded") => createErrorResponse(message, 429, "RATE_LIMIT_EXCEEDED"),

  // Server errors
  internalError: (message = "Internal server error") => createErrorResponse(message, 500, "INTERNAL_SERVER_ERROR"),

  serviceUnavailable: (message = "Service temporarily unavailable") =>
    createErrorResponse(message, 503, "SERVICE_UNAVAILABLE"),

  // Business logic errors
  insufficientFunds: (message = "Insufficient funds") => createErrorResponse(message, 422, "INSUFFICIENT_FUNDS"),

  rideNotAvailable: (message = "No drivers available") => createErrorResponse(message, 404, "RIDE_NOT_AVAILABLE"),

  invalidRideStatus: (currentStatus: string, requiredStatus: string) =>
    createErrorResponse(
      `Invalid ride status. Current: ${currentStatus}, Required: ${requiredStatus}`,
      422,
      "INVALID_RIDE_STATUS",
      { currentStatus, requiredStatus },
    ),
}

// Success response helpers
export const SuccessResponses = {
  created: (data: any, message = "Resource created successfully") => createSuccessResponse(data, message, 201),

  updated: (data: any, message = "Resource updated successfully") => createSuccessResponse(data, message, 200),

  deleted: (message = "Resource deleted successfully") => createSuccessResponse(null, message, 200),

  ok: (data: any, message?: string) => createSuccessResponse(data, message, 200),

  accepted: (data: any, message = "Request accepted") => createSuccessResponse(data, message, 202),
}

// Error logging
export function logError(error: Error | any, context?: string) {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    context,
    message: error.message || "Unknown error",
    stack: error.stack,
    ...(error.code && { code: error.code }),
    ...(error.statusCode && { statusCode: error.statusCode }),
  }

  console.error("API Error:", JSON.stringify(errorInfo, null, 2))
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await fn(req, ...args)
    } catch (error) {
      logError(error, fn.name)

      if (error instanceof Error) {
        return createErrorResponse(error.message)
      }

      return createErrorResponse("An unexpected error occurred")
    }
  }
}

// Validation helpers
export function validateRequired(data: any, fields: string[]): string[] {
  const missing: string[] = []

  for (const field of fields) {
    if (!data[field] || (typeof data[field] === "string" && data[field].trim() === "")) {
      missing.push(field)
    }
  }

  return missing
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Sierra Leone phone number format: +232XXXXXXXX or 232XXXXXXXX or 0XXXXXXXX
  const phoneRegex = /^(\+232|232|0)[0-9]{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" }
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" }
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" }
  }

  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" }
  }

  return { valid: true }
}

export default {
  createErrorResponse,
  createSuccessResponse,
  ErrorHandlers,
  SuccessResponses,
  logError,
  asyncHandler,
  validateRequired,
  validateEmail,
  validatePhone,
  validatePassword,
}
