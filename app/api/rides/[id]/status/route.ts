import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"
import { supabase } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🔄 Update ride status API called for ride:", params.id)

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { status, reason } = await request.json()
    console.log("📝 Status update data:", { status, reason })

    // Validate status
    const validStatuses = ["pending", "accepted", "driver_arrived", "in_progress", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 })
    }

    // Get the ride first to verify permissions
    const { data: ride, error: rideError } = await supabase.from("rides").select("*").eq("id", params.id).single()

    if (rideError) {
      console.error("❌ Ride not found:", rideError)
      return NextResponse.json({ success: false, error: "Ride not found" }, { status: 404 })
    }

    // Check permissions
    let canUpdate = false
    if (user.role === "passenger" && ride.passenger_id === user.id) {
      canUpdate = true
    } else if (user.role === "driver") {
      // Get driver profile ID
      const { data: driverProfile, error: driverError } = await supabase
        .from("driver_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (!driverError && driverProfile && ride.driver_id === driverProfile.id) {
        canUpdate = true
      }
    }

    if (!canUpdate) {
      return NextResponse.json({ success: false, error: "Permission denied" }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    // Add timestamp fields based on status
    switch (status) {
      case "accepted":
        updateData.accepted_at = new Date().toISOString()
        // If driver is accepting, assign them to the ride
        if (user.role === "driver") {
          const { data: driverProfile } = await supabase
            .from("driver_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single()

          if (driverProfile) {
            updateData.driver_id = driverProfile.id
          }
        }
        break
      case "in_progress":
        updateData.started_at = new Date().toISOString()
        break
      case "completed":
        updateData.completed_at = new Date().toISOString()
        break
      case "cancelled":
        updateData.cancelled_at = new Date().toISOString()
        if (reason) {
          updateData.cancellation_reason = reason
        }
        break
    }

    // Update the ride
    const { data: updatedRide, error: updateError } = await supabase
      .from("rides")
      .update(updateData)
      .eq("id", params.id)
      .select(`
        *,
        users!rides_passenger_id_fkey (
          full_name,
          phone,
          profile_image_url
        ),
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
      .single()

    if (updateError) {
      console.error("❌ Ride update error:", updateError)
      return NextResponse.json({ success: false, error: "Failed to update ride status" }, { status: 500 })
    }

    // Update driver earnings if ride is completed
    if (status === "completed" && user.role === "driver") {
      const { error: earningsError } = await supabase
        .from("driver_profiles")
        .update({
          total_earnings: supabase.raw("total_earnings + ?", [ride.fare_amount]),
          total_rides: supabase.raw("total_rides + 1"),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (earningsError) {
        console.warn("⚠️ Failed to update driver earnings:", earningsError)
      }
    }

    console.log("✅ Ride status updated successfully")
    return NextResponse.json(createSuccessResponse(updatedRide), { status: 200 })
  } catch (error) {
    console.error("💥 Update ride status API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update ride status"), { status: 500 })
  }
}
