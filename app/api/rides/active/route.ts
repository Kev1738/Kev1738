import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"
import { supabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("🚗 Active rides API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 Fetching active rides for user:", user.id, "role:", user.role)

    let activeRides = []

    if (user.role === "driver") {
      // Get driver profile ID first
      const { data: driverProfile, error: driverError } = await supabase
        .from("driver_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (driverError) {
        console.error("❌ Driver profile not found:", driverError)
        return NextResponse.json({ success: false, error: "Driver profile not found" }, { status: 404 })
      }

      // Get active rides for driver
      const { data: rides, error: ridesError } = await supabase
        .from("rides")
        .select(`
          *,
          users!rides_passenger_id_fkey (
            full_name,
            phone,
            profile_image_url
          ),
          vehicles (
            make,
            model,
            color,
            plate_number,
            vehicle_type
          )
        `)
        .eq("driver_id", driverProfile.id)
        .in("status", ["accepted", "driver_arrived", "in_progress"])
        .order("created_at", { ascending: false })

      if (ridesError) {
        console.error("❌ Driver rides fetch error:", ridesError)
        throw ridesError
      }

      activeRides = rides || []
    } else if (user.role === "passenger") {
      // Get active rides for passenger
      const { data: rides, error: ridesError } = await supabase
        .from("rides")
        .select(`
          *,
          driver_profiles!rides_driver_id_fkey (
            rating,
            users!driver_profiles_user_id_fkey (
              full_name,
              phone,
              profile_image_url
            )
          ),
          vehicles (
            make,
            model,
            color,
            plate_number,
            vehicle_type
          )
        `)
        .eq("passenger_id", user.id)
        .in("status", ["pending", "accepted", "driver_arrived", "in_progress"])
        .order("created_at", { ascending: false })

      if (ridesError) {
        console.error("❌ Passenger rides fetch error:", ridesError)
        throw ridesError
      }

      activeRides = rides || []
    }

    console.log("✅ Active rides fetched successfully:", activeRides.length)
    return NextResponse.json(createSuccessResponse(activeRides), { status: 200 })
  } catch (error) {
    console.error("💥 Active rides API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch active rides"), { status: 500 })
  }
}
