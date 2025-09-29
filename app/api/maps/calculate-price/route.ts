import { type NextRequest, NextResponse } from "next/server"
import { googleMapsServerService } from "@/lib/google-maps-server"

export async function POST(request: NextRequest) {
  try {
    const { distance, vehicleType } = await request.json()

    if (typeof distance !== "number" || !vehicleType) {
      return NextResponse.json({ success: false, error: "Distance and vehicle type are required" }, { status: 400 })
    }

    const price = googleMapsServerService.calculatePrice(distance, vehicleType)

    return NextResponse.json({
      success: true,
      price,
      currency: "SLL",
      formatted: `Le ${price.toLocaleString()}`,
    })
  } catch (error) {
    console.error("Price calculation API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
