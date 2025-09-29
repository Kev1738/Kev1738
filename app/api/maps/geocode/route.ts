import { type NextRequest, NextResponse } from "next/server"
import { googleMapsServerService } from "@/lib/google-maps-server"

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ success: false, error: "Address is required" }, { status: 400 })
    }

    const location = await googleMapsServerService.geocode(address)

    if (!location) {
      return NextResponse.json({ success: false, error: "Location not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      location,
    })
  } catch (error) {
    console.error("Geocoding API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
