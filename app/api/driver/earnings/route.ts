import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getDriverEarnings } from "@/lib/driver"
import { createErrorResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("💰 Driver earnings API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "driver") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "week" // day, week, month, year
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    const result = await getDriverEarnings(user.id, { period, startDate, endDate })

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Driver earnings API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch driver earnings"), { status: 500 })
  }
}
