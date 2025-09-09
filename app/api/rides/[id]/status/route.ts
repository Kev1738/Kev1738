import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { updateRideStatus } from "@/lib/rides"
import { createErrorResponse } from "@/lib/error-handler"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔄 Update ride status API called for ride:", params.id)

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { status, reason } = await request.json()

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 })
    }

    const validStatuses = ["accepted", "driver_arrived", "in_progress", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 })
    }

    const result = await updateRideStatus(params.id, status, user.id, reason)

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Update ride status API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update ride status"), { status: 500 })
  }
}
