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
}) {
  try {
    console.log("Creating ride in database:", rideData)

    const { data: ride, error } = await supabase.from("rides").insert(rideData).select().single()

    if (error) {
      console.error("Database error creating ride:", error)
      throw error
    }

    console.log("Ride created successfully:", ride.id)
    return { success: true, ride }
  } catch (error) {
    console.error("Create ride error:", error)
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
        driver_profiles!rides_driver_id_fkey (
          user_id,
          rating,
          users!driver_profiles_user_id_fkey (
            full_name,
            phone
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
    console.error("Get passenger rides error:", error)
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
        users!rides_passenger_id_fkey (
          full_name,
          phone
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
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: rides, error } = await query

    if (error) throw error

    return { success: true, rides }
  } catch (error) {
    console.error("Get driver rides error:", error)
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
          users!rides_passenger_id_fkey (
            full_name,
            phone
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
    } else {
      // Passenger
      query = supabase
        .from("rides")
        .select(`
          *,
          driver_profiles!rides_driver_id_fkey (
            user_id,
            rating,
            users!driver_profiles_user_id_fkey (
              full_name,
              phone
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
        .eq("passenger_id", user_id)
        .in("status", ["pending", "accepted", "driver_arrived", "in_progress"])
    }

    const { data: rides, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, rides }
  } catch (error) {
    console.error("Get active rides error:", error)
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
    } else if (status === "cancelled") {
      updateData.cancelled_at = new Date().toISOString()
      if (reason) {
        updateData.cancellation_reason = reason
      }
    } else if (status === "accepted") {
      updateData.accepted_at = new Date().toISOString()
    }

    const { data: ride, error } = await supabase.from("rides").update(updateData).eq("id", ride_id).select().single()

    if (error) throw error

    return { success: true, ride }
  } catch (error) {
    console.error("Update ride status error:", error)
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
          phone
        ),
        vehicles!vehicles_driver_id_fkey (
          id,
          vehicle_type,
          make,
          model,
          color,
          plate_number
        )
      `)
      .eq("is_online", true)
      .eq("vehicles.vehicle_type", vehicle_type)
      .eq("vehicles.is_active", true)

    if (error) throw error

    return { success: true, drivers }
  } catch (error) {
    console.error("Get available drivers error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get available drivers",
    }
  }
}

export async function acceptRide(ride_id: string, driver_id: string) {
  try {
    const { data: ride, error } = await supabase
      .from("rides")
      .update({
        driver_id,
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", ride_id)
      .select()
      .single()

    if (error) throw error

    return { success: true, ride }
  } catch (error) {
    console.error("Accept ride error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept ride",
    }
  }
}
