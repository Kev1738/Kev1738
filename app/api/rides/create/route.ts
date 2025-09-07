import { type NextRequest, NextResponse } from "next/server"
import { createRide } from "@/lib/rides"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Create ride API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const rideData = await request.json()
    rideData.passenger_id = user.id

    console.log("Creating ride with data:", rideData)

    const result = await createRide(rideData)
    console.log("Create ride result:", result)

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Create ride API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
