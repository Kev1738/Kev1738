import type { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return createErrorResponse("Authentication required", 401)
    }

    const user = await getCurrentUser(token)

    if (!user) {
      return createErrorResponse("Invalid or expired token", 401)
    }

    return createSuccessResponse({
      user,
      message: "User data retrieved successfully",
    })
  } catch (error) {
    console.error("Get user error:", error)
    return createErrorResponse("Failed to get user data", 500)
  }
}
