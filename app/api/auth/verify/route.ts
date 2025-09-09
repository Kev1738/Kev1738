import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Verify API endpoint called")

    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      console.log("❌ No auth token found")
      return NextResponse.json(
        {
          success: false,
          message: "No authentication token found",
        },
        { status: 401 },
      )
    }

    // Verify token
    const result = await AuthService.verifyToken(token)

    if (result.success) {
      console.log("✅ Token verification successful")
      return NextResponse.json(result, { status: 200 })
    } else {
      console.log("❌ Token verification failed:", result.message)

      // Clear invalid cookie
      const response = NextResponse.json(result, { status: 401 })
      response.cookies.delete("auth-token")

      return response
    }
  } catch (error) {
    console.error("💥 Verify API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during verification",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  return NextResponse.json({ message: "Verify endpoint. Use GET method." }, { status: 405 })
}
