import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("🚗 Admin get rides API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const vehicle_type = searchParams.get("vehicle_type") || ""
    const date_from = searchParams.get("date_from") || ""
    const date_to = searchParams.get("date_to") || ""

    const offset = (page - 1) * limit

    // Build query for rides with all related data
    let query = supabase.from("rides").select(
      `
        id,
        passenger_id,
        driver_profile_id,
        vehicle_id,
        ride_type,
        vehicle_type,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
        destination_address,
        destination_latitude,
        destination_longitude,
        distance_km,
        estimated_duration_minutes,
        actual_duration_minutes,
        fare_amount,
        status,
        scheduled_time,
        accepted_at,
        driver_arrived_at,
        started_at,
        completed_at,
        cancelled_at,
        cancellation_reason,
        special_instructions,
        created_at,
        updated_at,
        passenger:users!rides_passenger_id_fkey (
          id,
          full_name,
          email,
          phone,
          profile_image_url
        ),
        driver_profile:driver_profiles!rides_driver_profile_id_fkey (
          id,
          rating,
          users!driver_profiles_user_id_fkey (
            id,
            full_name,
            email,
            phone,
            profile_image_url
          )
        ),
        vehicle:vehicles!rides_vehicle_id_fkey (
          id,
          vehicle_type,
          make,
          model,
          year,
          color,
          plate_number
        ),
        payments (
          id,
          amount,
          payment_method,
          payment_status,
          processed_at
        ),
        ratings (
          id,
          rating,
          comment,
          rating_type
        )
      `,
      { count: "exact" },
    )

    // Apply filters
    if (search) {
      query = query.or(
        `pickup_address.ilike.%${search}%,destination_address.ilike.%${search}%,passenger.full_name.ilike.%${search}%`,
      )
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (vehicle_type) {
      query = query.eq("vehicle_type", vehicle_type)
    }

    if (date_from) {
      query = query.gte("created_at", date_from)
    }

    if (date_to) {
      query = query.lte("created_at", date_to)
    }

    // Apply pagination and ordering
    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    const { data: rides, error, count } = await query

    if (error) {
      console.error("❌ Rides fetch error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch rides" }, { status: 500 })
    }

    // Transform data to include computed fields
    const transformedRides =
      rides?.map((ride) => ({
        ...ride,
        driver_name: ride.driver_profile?.users?.full_name || "Unassigned",
        passenger_name: ride.passenger?.full_name || "Unknown",
        payment_info: ride.payments?.[0] || null,
        rating_info: ride.ratings?.[0] || null,
        duration_display: ride.actual_duration_minutes
          ? `${ride.actual_duration_minutes} min`
          : ride.estimated_duration_minutes
            ? `~${ride.estimated_duration_minutes} min`
            : "N/A",
      })) || []

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json(
      createSuccessResponse(
        {
          rides: transformedRides,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
        "Rides fetched successfully",
      ),
    )
  } catch (error) {
    console.error("💥 Admin get rides error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch rides"), { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("✏️ Admin update ride API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 })
    }

    const updateData = await request.json()
    const { id, action, ...rideData } = updateData

    if (!id || !action) {
      return NextResponse.json({ success: false, error: "Ride ID and action are required" }, { status: 400 })
    }

    let result = null
    let message = ""

    switch (action) {
      case "update_status":
        // Update ride status
        const statusUpdates: any = {
          status: rideData.status,
          updated_at: new Date().toISOString(),
        }

        // Add timestamp based on status
        const now = new Date().toISOString()
        switch (rideData.status) {
          case "accepted":
            statusUpdates.accepted_at = now
            break
          case "driver_arrived":
            statusUpdates.driver_arrived_at = now
            break
          case "in_progress":
            statusUpdates.started_at = now
            break
          case "completed":
            statusUpdates.completed_at = now
            if (rideData.actual_duration_minutes) {
              statusUpdates.actual_duration_minutes = rideData.actual_duration_minutes
            }
            break
          case "cancelled":
            statusUpdates.cancelled_at = now
            if (rideData.cancellation_reason) {
              statusUpdates.cancellation_reason = rideData.cancellation_reason
            }
            break
        }

        const { data: updatedRide, error: statusError } = await supabase
          .from("rides")
          .update(statusUpdates)
          .eq("id", id)
          .select()
          .single()

        if (statusError) {
          console.error("❌ Ride status update error:", statusError)
          return NextResponse.json({ success: false, error: "Failed to update ride status" }, { status: 500 })
        }

        result = updatedRide
        message = `Ride status updated to ${rideData.status}`
        break

      case "assign_driver":
        // Assign driver to ride
        if (!rideData.driver_profile_id || !rideData.vehicle_id) {
          return NextResponse.json(
            {
              success: false,
              error: "Driver profile ID and vehicle ID are required",
            },
            { status: 400 },
          )
        }

        const { data: assignedRide, error: assignError } = await supabase
          .from("rides")
          .update({
            driver_profile_id: rideData.driver_profile_id,
            vehicle_id: rideData.vehicle_id,
            status: "accepted",
            accepted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single()

        if (assignError) {
          console.error("❌ Driver assignment error:", assignError)
          return NextResponse.json({ success: false, error: "Failed to assign driver" }, { status: 500 })
        }

        result = assignedRide
        message = "Driver assigned successfully"
        break

      case "cancel_ride":
        // Cancel ride
        const { data: cancelledRide, error: cancelError } = await supabase
          .from("rides")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            cancellation_reason: rideData.cancellation_reason || "Cancelled by admin",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single()

        if (cancelError) {
          console.error("❌ Ride cancellation error:", cancelError)
          return NextResponse.json({ success: false, error: "Failed to cancel ride" }, { status: 500 })
        }

        result = cancelledRide
        message = "Ride cancelled successfully"
        break

      case "update_details":
        // Update ride details
        const { data: updatedDetails, error: updateError } = await supabase
          .from("rides")
          .update({
            ...rideData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single()

        if (updateError) {
          console.error("❌ Ride details update error:", updateError)
          return NextResponse.json({ success: false, error: "Failed to update ride details" }, { status: 500 })
        }

        result = updatedDetails
        message = "Ride details updated successfully"
        break

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json(createSuccessResponse(result, message))
  } catch (error) {
    console.error("💥 Admin update ride error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update ride"), { status: 500 })
  }
}
