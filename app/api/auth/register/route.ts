import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Register API endpoint called")

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json(createErrorResponse(parseError, "Invalid JSON in request body"), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { email, password, full_name, phone, role } = body

    // Validate input
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        createErrorResponse(new Error("Missing required fields"), "Email, password, full name, and role are required"),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    if (!["passenger", "driver", "admin"].includes(role)) {
      return NextResponse.json(
        createErrorResponse(new Error("Invalid role"), "Role must be passenger, driver, or admin"),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("📧 Registration attempt for email:", email)

    // Attempt registration
    const user = await registerUser({
      email,
      password,
      full_name,
      phone,
      role,
    })

    console.log("✅ Registration successful for user:", user.id)

    // Create response
    const response = createSuccessResponse(
      {
        user,
        token: JSON.stringify(user), // Simple token for demo (use JWT in production)
      },
      "Registration successful",
    )

    return NextResponse.json(response, {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("💥 Registration API error:", error)

    const { statusCode, response } = handleApiError(error)

    return NextResponse.json(response, {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function GET() {
  return NextResponse.json(
    createErrorResponse(new Error("Method not allowed"), "GET method not supported for registration"),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    },
  )
}
