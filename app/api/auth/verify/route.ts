import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("🔐 Auth verify API called")

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(createErrorResponse(new Error("Not authenticated"), "User not authenticated"), {
        status: 401,
      })
    }

    console.log("✅ User verified:", user.email, user.role)

    return NextResponse.json(
      createSuccessResponse(
        {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            is_verified: user.is_verified,
            is_active: user.is_active,
            profile_image_url: user.profile_image_url,
          },
        },
        "User verified successfully",
      ),
    )
  } catch (error) {
    console.error("💥 Auth verify error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to verify user"), { status: 500 })
  }
}
