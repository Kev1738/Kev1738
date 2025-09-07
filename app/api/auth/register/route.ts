import { type NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"
import { createErrorResponse } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Registration API endpoint called")

    let userData
    try {
      userData = await request.json()
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json(createErrorResponse(parseError, "Invalid request format"), { status: 400 })
    }

    console.log("📋 Registration data received:", {
      ...userData,
      password: userData.password ? "[HIDDEN]" : "missing",
    })

    const result = await registerUser(userData)

    console.log("📊 Registration result:", {
      success: result.success,
      error: result.success ? null : (result as any).error,
    })

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      const errorResult = result as any
      const statusCode =
        errorResult.code === "USER_EXISTS"
          ? 409
          : errorResult.code === "VALIDATION_ERROR"
            ? 400
            : errorResult.code === "DB_UNAVAILABLE"
              ? 503
              : 500

      return NextResponse.json(result, { status: statusCode })
    }
  } catch (error) {
    console.error("💥 Registration API critical error:", error)
    return NextResponse.json(createErrorResponse(error, "Registration service unavailable"), { status: 500 })
  }
}
