import type { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return createErrorResponse("No token provided", 401)
    }

    const user = await getCurrentUser(token)

    if (!user) {
      return createErrorResponse("Invalid or expired token", 401)
    }

    return createSuccessResponse({
      user,
      message: "Token is valid",
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return createErrorResponse("Token verification failed", 500)
  }
}
