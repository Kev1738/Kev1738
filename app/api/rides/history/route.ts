import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/database"
import { getCurrentUser } from "@/lib/auth"
import { createSuccessResponse, createErrorResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("🚗 Rides history API called")

    // Get current user from session
    const user = await getCurrentUser()
    if (!user) {
      console.log("❌ No authenticated user found")
      return NextResponse.json(createErrorResponse("Authentication required"), { status: 401 })
    }

    console.log("👤 Getting rides for user:", user.id, "Role:", user.role)

    let ridesQuery = supabase
      .from("rides")
      .select(`
        id,
        pickup_address,
        destination_address,
        fare_amount,
        status,
        ride_type,
        vehicle_type,
        distance_km,
        created_at,
        completed_at,
        cancelled_at
      `)
      .order("created_at", { ascending: false })
      .limit(50)

    // Filter based on user role
    if (user.role === "passenger") {
      ridesQuery = ridesQuery.eq("passenger_id", user.id)
    } else if (user.role === "driver") {
      // Get driver profile first
      const { data: driverProfile, error: driverError } = await supabase
        .from("driver_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (driverError || !driverProfile) {
        console.log("❌ Driver profile not found")
        return NextResponse.json(createSuccessResponse([]))
      }

      ridesQuery = ridesQuery.eq("driver_profile_id", driverProfile.id)
    } else if (user.role === "admin") {
      // Admin can see all rides - no filter needed
    }

    const { data: rides, error: ridesError } = await ridesQuery

    if (ridesError) {
      console.error("❌ Rides query error:", ridesError)
      return NextResponse.json(createErrorResponse("Failed to fetch rides"), { status: 500 })
    }

    console.log("✅ Found", rides?.length || 0, "rides for user")

    return NextResponse.json(
      createSuccessResponse({
        rides: rides || [],
        userRole: user.role,
        total: rides?.length || 0,
      }),
    )
  } catch (error) {
    console.error("💥 Rides history error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to load ride history"), { status: 500 })
  }
}
