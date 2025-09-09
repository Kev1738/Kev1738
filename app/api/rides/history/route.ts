import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"
import { supabase } from "@/lib/database"

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
    const status = searchParams.get("status")

    console.log("📊 History query params:", { limit, offset, status, userRole: user.role })

    let rides = []
    let totalCount = 0

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

      // Build query for driver rides
      let query = supabase
        .from("rides")
        .select(
          `
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
        `,
          { count: "exact" },
        )
        .eq("driver_id", driverProfile.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (status) {
        query = query.eq("status", status)
      }

      const { data: rideData, error: ridesError, count } = await query

      if (ridesError) {
        console.error("❌ Driver rides fetch error:", ridesError)
        throw ridesError
      }

      rides = rideData || []
      totalCount = count || 0
    } else if (user.role === "passenger") {
      // Build query for passenger rides
      let query = supabase
        .from("rides")
        .select(
          `
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
        `,
          { count: "exact" },
        )
        .eq("passenger_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (status) {
        query = query.eq("status", status)
      }

      const { data: rideData, error: ridesError, count } = await query

      if (ridesError) {
        console.error("❌ Passenger rides fetch error:", ridesError)
        throw ridesError
      }

      rides = rideData || []
      totalCount = count || 0
    }

    const responseData = {
      rides,
      total: totalCount,
      limit,
      offset,
      hasMore: offset + limit < totalCount,
    }

    console.log("✅ Ride history fetched successfully:", rides.length, "of", totalCount)
    return NextResponse.json(createSuccessResponse(responseData), { status: 200 })
  } catch (error) {
    console.error("💥 Ride history API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch ride history"), { status: 500 })
  }
}
