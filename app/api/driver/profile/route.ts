import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getDriverProfile, updateDriverProfile } from "@/lib/driver"
import { createErrorResponse } from "@/lib/error-handler"

export async function GET() {
  try {
    console.log("👤 Get driver profile API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "driver") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const result = await getDriverProfile(user.id)

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Get driver profile API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch driver profile"), { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("✏️ Update driver profile API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "driver") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const profileData = await request.json()
    const result = await updateDriverProfile(user.id, profileData)

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Update driver profile API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update driver profile"), { status: 500 })
  }
}
