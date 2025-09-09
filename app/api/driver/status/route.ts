import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { updateDriverStatus } from "@/lib/driver"
import { createErrorResponse } from "@/lib/error-handler"

export async function PUT(request: NextRequest) {
  try {
    console.log("🔄 Update driver status API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "driver") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { is_online, latitude, longitude } = await request.json()

    if (typeof is_online !== "boolean") {
      return NextResponse.json({ success: false, error: "is_online must be a boolean" }, { status: 400 })
    }

    const result = await updateDriverStatus(user.id, { is_online, latitude, longitude })

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Update driver status API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update driver status"), { status: 500 })
  }
}
