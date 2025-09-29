import { type NextRequest, NextResponse } from "next/server"
import { googleMapsServerService } from "@/lib/google-maps-server"

export async function POST(request: NextRequest) {
  try {
    const { origin, destination } = await request.json()

    if (
      !origin ||
      !destination ||
      typeof origin.lat !== "number" ||
      typeof origin.lng !== "number" ||
      typeof destination.lat !== "number" ||
      typeof destination.lng !== "number"
    ) {
      return NextResponse.json(
        { success: false, error: "Valid origin and destination coordinates are required" },
        { status: 400 },
      )
    }

    const route = await googleMapsServerService.calculateRoute(origin, destination)

    if (!route) {
      return NextResponse.json({ success: false, error: "Route not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      route,
    })
  } catch (error) {
    console.error("Route calculation API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
