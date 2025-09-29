import type { NextRequest } from "next/server"
import { authenticateUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse, validateRequired, validateEmail } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    validateRequired(body, ["email", "password"])

    const { email, password } = body

    // Validate email format
    validateEmail(email)

    // Authenticate user
    const result = await authenticateUser(email, password)

    if (!result.success) {
      return createErrorResponse(result.error || "Authentication failed", 401)
    }

    // Create response with user data and token
    const response = createSuccessResponse({
      user: result.user,
      token: result.token,
      message: "Login successful",
    })

    // Set token as HTTP-only cookie
    response.cookies.set("auth-token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return createErrorResponse("Login failed", 500)
  }
}
