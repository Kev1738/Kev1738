import type { NextRequest } from "next/server"
import { createUserAccount } from "@/lib/auth"
import {
  createErrorResponse,
  createSuccessResponse,
  validateRequired,
  validateEmail,
  validateRole,
} from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    validateRequired(body, ["email", "password", "full_name", "phone", "role"])

    const { email, password, full_name, phone, role } = body

    // Validate email format
    validateEmail(email)

    // Validate role
    validateRole(role)

    // Create user account
    const result = await createUserAccount({
      email,
      password,
      full_name,
      phone,
      role,
    })

    if (!result.success) {
      return createErrorResponse(result.error || "Registration failed", 400)
    }

    // Create response with user data and token
    const response = createSuccessResponse({
      user: result.user,
      token: result.token,
      message: "Registration successful",
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
    console.error("Registration error:", error)
    return createErrorResponse("Registration failed", 500)
  }
}
