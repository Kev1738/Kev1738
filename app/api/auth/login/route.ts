import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { testDatabaseConnection } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login API endpoint called")

    // Test database connection first
    const dbConnected = await testDatabaseConnection()
    if (!dbConnected) {
      console.error("❌ Database connection failed")
      return NextResponse.json(
        {
          success: false,
          message: "Database connection failed. Please try again later.",
        },
        { status: 500 },
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("❌ Invalid JSON in request body:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request format",
        },
        { status: 400 },
      )
    }

    const { email, password } = body

    // Validate input
    if (!email || !password) {
      console.log("❌ Missing email or password")
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Attempt login
    const result = await AuthService.login({ email, password })

    if (result.success && result.token) {
      console.log("✅ Login successful, setting cookie")

      // Create response with cookie
      const response = NextResponse.json(result, { status: 200 })

      // Set secure HTTP-only cookie
      response.cookies.set("auth-token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      })

      return response
    } else {
      console.log("❌ Login failed:", result.message)
      return NextResponse.json(result, { status: 401 })
    }
  } catch (error) {
    console.error("💥 Login API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Login endpoint. Use POST method." }, { status: 405 })
}
