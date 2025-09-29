import { type NextRequest, NextResponse } from "next/server"
import { googleMapsServerService } from "@/lib/google-maps-server"

export async function POST(request: NextRequest) {
  try {
    const { query, location } = await request.json()

    if (!query) {
      return NextResponse.json({ success: false, error: "Search query is required" }, { status: 400 })
    }

    const places = await googleMapsServerService.searchPlaces(query, location)

    return NextResponse.json({
      success: true,
      places,
    })
  } catch (error) {
    console.error("Places search API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
