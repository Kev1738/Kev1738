import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { testDatabaseConnection } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Register API endpoint called")

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

    const { email, password, fullName, phone, role } = body

    // Validate input
    if (!email || !password || !fullName || !role) {
      console.log("❌ Missing required fields")
      return NextResponse.json(
        {
          success: false,
          message: "Email, password, full name, and role are required",
        },
        { status: 400 },
      )
    }

    // Validate role
    if (!["passenger", "driver", "admin"].includes(role)) {
      console.log("❌ Invalid role:", role)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role. Must be passenger, driver, or admin",
        },
        { status: 400 },
      )
    }

    // Attempt registration
    const result = await AuthService.register({
      email,
      password,
      fullName,
      phone,
      role,
    })

    if (result.success && result.token) {
      console.log("✅ Registration successful, setting cookie")

      // Create response with cookie
      const response = NextResponse.json(result, { status: 201 })

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
      console.log("❌ Registration failed:", result.message)
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("💥 Registration API error:", error)
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
  return NextResponse.json({ message: "Register endpoint. Use POST method." }, { status: 405 })
}
