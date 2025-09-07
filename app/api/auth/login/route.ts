import { type NextRequest, NextResponse } from "next/server"
import { loginUser } from "@/lib/auth"
import { createErrorResponse } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login API endpoint called")

    let requestData
    try {
      requestData = await request.json()
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json(createErrorResponse(parseError, "Invalid request format"), { status: 400 })
    }

    const { email, password } = requestData
    console.log("📋 Login attempt for:", email)

    const result = await loginUser(email, password)

    console.log("📊 Login result:", {
      success: result.success,
      error: result.success ? null : (result as any).error,
    })

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      const errorResult = result as any
      const statusCode =
        errorResult.code === "INVALID_CREDENTIALS"
          ? 401
          : errorResult.code === "ACCOUNT_DEACTIVATED"
            ? 403
            : errorResult.code === "DB_UNAVAILABLE"
              ? 503
              : 500

      return NextResponse.json(result, { status: statusCode })
    }
  } catch (error) {
    console.error("💥 Login API critical error:", error)
    return NextResponse.json(createErrorResponse(error, "Login service unavailable"), { status: 500 })
  }
}
