export function createSuccessResponse(data: any, message = "Success") {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }
}

export function createErrorResponse(error: any, message = "An error occurred") {
  const errorMessage = error instanceof Error ? error.message : typeof error === "string" ? error : message

  return {
    success: false,
    error: errorMessage,
    message,
    timestamp: new Date().toISOString(),
  }
}

export function handleApiError(error: any, context = "API") {
  console.error(`${context} Error:`, error)

  if (error instanceof Error) {
    return createErrorResponse(error, `${context} failed`)
  }

  return createErrorResponse(null, `${context} failed with unknown error`)
}
