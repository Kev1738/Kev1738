import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getRidesByPassenger, getRidesByDriver } from "@/lib/rides"
import { createErrorResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("📚 Ride history API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status") // completed, cancelled, etc.

    let result
    if (user.role === "driver") {
      result = await getRidesByDriver(user.id, { limit, offset, status })
    } else {
      result = await getRidesByPassenger(user.id, { limit, offset, status })
    }

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Ride history API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch ride history"), { status: 500 })
  }
}
