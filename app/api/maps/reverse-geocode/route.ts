import { type NextRequest, NextResponse } from "next/server"
import { googleMapsServerService } from "@/lib/google-maps-server"

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json()

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ success: false, error: "Valid latitude and longitude are required" }, { status: 400 })
    }

    const address = await googleMapsServerService.reverseGeocode(lat, lng)

    if (!address) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      address,
    })
  } catch (error) {
    console.error("Reverse geocoding API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
