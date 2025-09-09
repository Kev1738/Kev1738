import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("👋 Logout API endpoint called")

    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value

    // Attempt logout (even if no token)
    const result = await AuthService.logout(token || "")

    console.log("✅ Logout processed")

    // Create response and clear cookie
    const response = NextResponse.json(result, { status: 200 })
    response.cookies.delete("auth-token")

    return response
  } catch (error) {
    console.error("💥 Logout API error:", error)

    // Still clear cookie even on error
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out (with errors)",
      },
      { status: 200 },
    )
    response.cookies.delete("auth-token")

    return response
  }
}

export async function GET() {
  return NextResponse.json({ message: "Logout endpoint. Use POST method." }, { status: 405 })
}
