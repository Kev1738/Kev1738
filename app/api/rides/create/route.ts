import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    console.log("🚗 Create ride API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "passenger") {
      return NextResponse.json(createErrorResponse(null, "Unauthorized. Only passengers can create rides."), {
        status: 401,
      })
    }

    const rideData = await request.json()
    const {
      pickup_address,
      pickup_latitude,
      pickup_longitude,
      destination_address,
      destination_latitude,
      destination_longitude,
      vehicle_type = "car",
      ride_type = "private",
      special_instructions,
      scheduled_time,
    } = rideData

    // Validate required fields
    if (!pickup_address || !destination_address) {
      return NextResponse.json(createErrorResponse(null, "Pickup and destination addresses are required"), {
        status: 400,
      })
    }

    // Calculate estimated fare (simple calculation for demo)
    const baseFare = vehicle_type === "bike" ? 500 : vehicle_type === "keke" ? 800 : 1200
    const distance = calculateDistance(pickup_latitude, pickup_longitude, destination_latitude, destination_longitude)
    const estimatedFare = Math.max(baseFare, baseFare + distance * 100)

    // Create ride
    const { data: newRide, error: rideError } = await supabase
      .from("rides")
      .insert({
        passenger_id: user.id,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
        destination_address,
        destination_latitude,
        destination_longitude,
        vehicle_type,
        ride_type,
        fare_amount: estimatedFare,
        distance_km: distance,
        estimated_duration_minutes: Math.ceil(distance * 2), // Rough estimate
        special_instructions,
        scheduled_time: scheduled_time ? new Date(scheduled_time).toISOString() : null,
        status: "pending",
      })
      .select()
      .single()

    if (rideError) {
      console.error("❌ Ride creation error:", rideError)
      return NextResponse.json(createErrorResponse(rideError, "Failed to create ride"), { status: 500 })
    }

    // Create notification for nearby drivers (simplified for demo)
    const { data: onlineDrivers } = await supabase
      .from("driver_profiles")
      .select("user_id")
      .eq("is_online", true)
      .eq("status", "online")
      .limit(10)

    if (onlineDrivers && onlineDrivers.length > 0) {
      const notifications = onlineDrivers.map((driver) => ({
        user_id: driver.user_id,
        title: "New Ride Request",
        message: `New ${vehicle_type} ride from ${pickup_address} to ${destination_address}`,
        type: "ride_update",
        data: {
          ride_id: newRide.id,
          pickup_address,
          destination_address,
          fare_amount: estimatedFare,
          vehicle_type,
        },
      }))

      await supabase
        .from("notifications")
        .insert(notifications)
        .catch((error) => {
          console.warn("⚠️ Notification creation error:", error)
        })
    }

    console.log("✅ Ride created successfully:", newRide.id)

    return NextResponse.json(
      createSuccessResponse(
        {
          ride: newRide,
          estimated_fare: estimatedFare,
          distance_km: distance,
        },
        "Ride created successfully",
      ),
    )
  } catch (error) {
    console.error("💥 Create ride error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to create ride"), { status: 500 })
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1?: number, lon1?: number, lat2?: number, lon2?: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return 5 // Default distance if coordinates not provided
  }

  const R = 6371 // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in kilometers
  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}
