import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getActiveRides } from "@/lib/rides"
import { createErrorResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("🚗 Active rides API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const result = await getActiveRides(user.id, user.role)

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Active rides API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch active rides"), { status: 500 })
  }
}
