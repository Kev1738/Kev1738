"use server"

import { supabase } from "./database"

export async function createRide(rideData: {
  passenger_id: string
  ride_type: "shared" | "private"
  vehicle_type: "car" | "keke" | "bike"
  pickup_address: string
  pickup_latitude: number
  pickup_longitude: number
  destination_address: string
  destination_latitude: number
  destination_longitude: number
  fare_amount: number
  scheduled_time?: string
  special_instructions?: string
}) {
  try {
    console.log("🚗 Creating ride in database:", rideData)

    const { data: ride, error } = await supabase.from("rides").insert(rideData).select().single()

    if (error) {
      console.error("❌ Database error creating ride:", error)
      throw error
    }

    console.log("✅ Ride created successfully:", ride.id)
    return { success: true, ride }
  } catch (error) {
    console.error("💥 Create ride error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create ride",
    }
  }
}

export async function getRidesByPassenger(
  passenger_id: string,
  options: {
    limit?: number
    offset?: number
    status?: string | null
  } = {},
) {
  try {
    const { limit = 20, offset = 0, status } = options

    let query = supabase
      .from("rides")
      .select(`
        *,
        driver_profile:driver_profiles!rides_driver_profile_id_fkey (
          id,
          rating,
          users!driver_profiles_user_id_fkey (
            full_name,
            phone,
            profile_image_url
          )
        ),
        vehicle:vehicles!rides_vehicle_id_fkey (
          make,
          model,
          color,
          plate_number,
          vehicle_type
        ),
        payments (
          id,
          amount,
          payment_method,
          payment_status
        )
      `)
      .eq("passenger_id", passenger_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: rides, error } = await query

    if (error) throw error

    return { success: true, rides }
  } catch (error) {
    console.error("💥 Get passenger rides error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get rides",
    }
  }
}

export async function getRidesByDriver(
  driver_user_id: string,
  options: {
    limit?: number
    offset?: number
    status?: string | null
  } = {},
) {
  try {
    const { limit = 20, offset = 0, status } = options

    // First get the driver profile ID
    const { data: driverProfile, error: driverError } = await supabase
      .from("driver_profiles")
      .select("id")
      .eq("user_id", driver_user_id)
      .single()

    if (driverError || !driverProfile) {
      throw new Error("Driver profile not found")
    }

    let query = supabase
      .from("rides")
      .select(`
        *,
        passenger:users!rides_passenger_id_fkey (
          full_name,
          phone,
          profile_image_url
        ),
        vehicle:vehicles!rides_vehicle_id_fkey (
          make,
          model,
          color,
          plate_number,
          vehicle_type
        ),
        payments (
          id,
          amount,
          driver_amount,
          payment_method,
          payment_status
        )
      `)
      .eq("driver_profile_id", driverProfile.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: rides, error } = await query

    if (error) throw error

    return { success: true, rides }
  } catch (error) {
    console.error("💥 Get driver rides error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get rides",
    }
  }
}

export async function getActiveRides(user_id: string, role: string) {
  try {
    let query

    if (role === "driver") {
      // Get driver profile ID first
      const { data: driverProfile, error: driverError } = await supabase
        .from("driver_profiles")
        .select("id")
        .eq("user_id", user_id)
        .single()

      if (driverError || !driverProfile) {
        throw new Error("Driver profile not found")
      }

      query = supabase
        .from("rides")
        .select(`
          *,
          passenger:users!rides_passenger_id_fkey (
            full_name,
            phone,
            profile_image_url
          ),
          vehicle:vehicles!rides_vehicle_id_fkey (
            make,
            model,
            color,
            plate_number,
            vehicle_type
          )
        `)
        .eq("driver_profile_id", driverProfile.id)
        .in("status", ["accepted", "driver_arrived", "in_progress"])
    } else {
      // Passenger
      query = supabase
        .from("rides")
        .select(`
          *,
          driver_profile:driver_profiles!rides_driver_profile_id_fkey (
            id,
            rating,
            users!driver_profiles_user_id_fkey (
              full_name,
              phone,
              profile_image_url
            )
          ),
          vehicle:vehicles!rides_vehicle_id_fkey (
            make,
            model,
            color,
            plate_number,
            vehicle_type
          )
        `)
        .eq("passenger_id", user_id)
        .in("status", ["pending", "accepted", "driver_arrived", "in_progress"])
    }

    const { data: rides, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, rides }
  } catch (error) {
    console.error("💥 Get active rides error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get active rides",
    }
  }
}

export async function updateRideStatus(ride_id: string, status: string, user_id: string, reason?: string) {
  try {
    const updateData: any = { status }

    if (status === "in_progress") {
      updateData.started_at = new Date().toISOString()
    } else if (status === "completed") {
      updateData.completed_at = new Date().toISOString()
      updateData.actual_duration_minutes = Math.floor(Math.random() * 30) + 10 // Simulate actual duration
    } else if (status === "cancelled") {
      updateData.cancelled_at = new Date().toISOString()
      if (reason) {
        updateData.cancellation_reason = reason
      }
    } else if (status === "accepted") {
      updateData.accepted_at = new Date().toISOString()
    } else if (status === "driver_arrived") {
      updateData.driver_arrived_at = new Date().toISOString()
    }

    const { data: ride, error } = await supabase.from("rides").update(updateData).eq("id", ride_id).select().single()

    if (error) throw error

    return { success: true, ride }
  } catch (error) {
    console.error("💥 Update ride status error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update ride status",
    }
  }
}

export async function getAvailableDrivers(vehicle_type: string, pickup_latitude: number, pickup_longitude: number) {
  try {
    const { data: drivers, error } = await supabase
      .from("driver_profiles")
      .select(`
        *,
        users!driver_profiles_user_id_fkey (
          full_name,
          phone,
          profile_image_url
        ),
        vehicles!vehicles_driver_profile_id_fkey (
          id,
          vehicle_type,
          make,
          model,
          color,
          plate_number,
          is_active
        )
      `)
      .eq("is_online", true)
      .eq("status", "online")

    if (error) throw error

    // Filter drivers by vehicle type
    const filteredDrivers =
      drivers?.filter((driver) =>
        driver.vehicles?.some((vehicle) => vehicle.vehicle_type === vehicle_type && vehicle.is_active),
      ) || []

    return { success: true, drivers: filteredDrivers }
  } catch (error) {
    console.error("💥 Get available drivers error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get available drivers",
    }
  }
}

export async function acceptRide(ride_id: string, driver_user_id: string) {
  try {
    // Get driver profile ID
    const { data: driverProfile, error: driverError } = await supabase
      .from("driver_profiles")
      .select("id, vehicles(*)")
      .eq("user_id", driver_user_id)
      .single()

    if (driverError || !driverProfile) {
      throw new Error("Driver profile not found")
    }

    // Get the ride to check vehicle type
    const { data: ride, error: rideError } = await supabase
      .from("rides")
      .select("vehicle_type")
      .eq("id", ride_id)
      .single()

    if (rideError || !ride) {
      throw new Error("Ride not found")
    }

    // Find matching vehicle
    const matchingVehicle = driverProfile.vehicles?.find(
      (vehicle) => vehicle.vehicle_type === ride.vehicle_type && vehicle.is_active,
    )

    if (!matchingVehicle) {
      throw new Error("No matching vehicle found")
    }

    const { data: updatedRide, error } = await supabase
      .from("rides")
      .update({
        driver_profile_id: driverProfile.id,
        vehicle_id: matchingVehicle.id,
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", ride_id)
      .select()
      .single()

    if (error) throw error

    return { success: true, ride: updatedRide }
  } catch (error) {
    console.error("💥 Accept ride error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept ride",
    }
  }
}

export async function getRideAnalytics(timeframe: "day" | "week" | "month" | "year" = "week") {
  try {
    let dateFilter = ""
    const now = new Date()

    switch (timeframe) {
      case "day":
        const today = now.toISOString().split("T")[0]
        dateFilter = `created_at.gte.${today}T00:00:00Z,created_at.lte.${today}T23:59:59Z`
        break
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFilter = `created_at.gte.${weekAgo.toISOString()}`
        break
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        dateFilter = `created_at.gte.${monthAgo.toISOString()}`
        break
      case "year":
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        dateFilter = `created_at.gte.${yearAgo.toISOString()}`
        break
    }

    const { data: rides, error } = await supabase
      .from("rides")
      .select(`
        *,
        payments (amount, payment_status)
      `)
      .gte("created_at", dateFilter.split(".")[2] || now.toISOString())

    if (error) throw error

    const analytics = {
      totalRides: rides?.length || 0,
      completedRides: rides?.filter((r) => r.status === "completed").length || 0,
      cancelledRides: rides?.filter((r) => r.status === "cancelled").length || 0,
      totalRevenue:
        rides?.reduce((sum, ride) => {
          const payment = ride.payments?.[0]
          return sum + (payment?.payment_status === "completed" ? payment.amount : 0)
        }, 0) || 0,
      averageFare: 0,
      vehicleTypeBreakdown: {
        car: rides?.filter((r) => r.vehicle_type === "car").length || 0,
        keke: rides?.filter((r) => r.vehicle_type === "keke").length || 0,
        bike: rides?.filter((r) => r.vehicle_type === "bike").length || 0,
      },
    }

    analytics.averageFare = analytics.completedRides > 0 ? analytics.totalRevenue / analytics.completedRides : 0

    return { success: true, analytics }
  } catch (error) {
    console.error("💥 Get ride analytics error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get ride analytics",
    }
  }
}
