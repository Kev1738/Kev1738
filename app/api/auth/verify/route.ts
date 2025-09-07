import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET() {
  try {
    console.log("🔍 Session verification requested")

    const user = await getCurrentUser()

    if (!user) {
      console.log("❌ No valid session found")
      return NextResponse.json(createErrorResponse(new Error("No valid session"), "Session not found"), { status: 401 })
    }

    console.log("✅ Session verified for:", user.email)

    return NextResponse.json(createSuccessResponse(user, "Session verified"), {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("💥 Session verification error:", error)
    return NextResponse.json(createErrorResponse(error, "Session verification failed"), { status: 500 })
  }
}
