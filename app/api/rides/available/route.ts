import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"
import { supabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Available rides API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "driver") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Check if driver is online
    const { data: driverProfile, error: driverError } = await supabase
      .from("driver_profiles")
      .select("id, status, is_online")
      .eq("user_id", user.id)
      .single()

    if (driverError || !driverProfile) {
      console.error("❌ Driver profile not found:", driverError)
      return NextResponse.json({ success: false, error: "Driver profile not found" }, { status: 404 })
    }

    if (driverProfile.status !== "online" && !driverProfile.is_online) {
      console.log("ℹ️ Driver is offline, no available rides")
      return NextResponse.json(createSuccessResponse([]), { status: 200 })
    }

    // Get pending rides that don't have a driver assigned
    const { data: availableRides, error: ridesError } = await supabase
      .from("rides")
      .select(`
        *,
        users!rides_passenger_id_fkey (
          full_name,
          phone,
          profile_image_url
        )
      `)
      .eq("status", "pending")
      .is("driver_id", null)
      .order("created_at", { ascending: true })
      .limit(10)

    if (ridesError) {
      console.error("❌ Available rides fetch error:", ridesError)
      throw ridesError
    }

    console.log("✅ Available rides fetched successfully:", availableRides?.length || 0)
    return NextResponse.json(createSuccessResponse(availableRides || []), { status: 200 })
  } catch (error) {
    console.error("💥 Available rides API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch available rides"), { status: 500 })
  }
}
