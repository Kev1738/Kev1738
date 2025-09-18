"use server"

import { supabase } from "./database"

export async function getDriverProfile(user_id: string) {
  try {
    const { data: profile, error } = await supabase
      .from("driver_profiles")
      .select(`
        *,
        users!driver_profiles_user_id_fkey (
          full_name,
          email,
          phone,
          profile_image_url,
          date_of_birth,
          gender,
          address,
          emergency_contact_name,
          emergency_contact_phone
        ),
        vehicles!vehicles_driver_profile_id_fkey (
          id,
          vehicle_type,
          make,
          model,
          year,
          color,
          plate_number,
          is_active,
          insurance_expiry,
          last_maintenance
        )
      `)
      .eq("user_id", user_id)
      .single()

    if (error) throw error

    return { success: true, profile }
  } catch (error) {
    console.error("💥 Get driver profile error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get driver profile",
    }
  }
}

export async function updateDriverProfile(user_id: string, profileData: any) {
  try {
    const { user_data, driver_data, vehicle_data } = profileData

    // Update user data if provided
    if (user_data) {
      const { error: userError } = await supabase
        .from("users")
        .update({
          ...user_data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user_id)

      if (userError) throw userError
    }

    // Update driver profile data if provided
    if (driver_data) {
      const { data: profile, error: driverError } = await supabase
        .from("driver_profiles")
        .update({
          ...driver_data,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .select()
        .single()

      if (driverError) throw driverError

      // Update vehicle data if provided
      if (vehicle_data && profile) {
        const { error: vehicleError } = await supabase
          .from("vehicles")
          .update({
            ...vehicle_data,
            updated_at: new Date().toISOString(),
          })
          .eq("driver_profile_id", profile.id)

        if (vehicleError) {
          console.error("Vehicle update error:", vehicleError)
        }
      }

      return { success: true, profile }
    }

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("💥 Update driver profile error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update driver profile",
    }
  }
}

export async function updateDriverStatus(
  user_id: string,
  statusData: {
    is_online: boolean
    status?: "offline" | "online" | "busy" | "break"
    current_location_lat?: number
    current_location_lng?: number
  },
) {
  try {
    const updateData: any = {
      is_online: statusData.is_online,
      status: statusData.status || (statusData.is_online ? "online" : "offline"),
      updated_at: new Date().toISOString(),
    }

    if (statusData.current_location_lat !== undefined) {
      updateData.current_location_lat = statusData.current_location_lat
    }
    if (statusData.current_location_lng !== undefined) {
      updateData.current_location_lng = statusData.current_location_lng
    }

    const { data: profile, error } = await supabase
      .from("driver_profiles")
      .update(updateData)
      .eq("user_id", user_id)
      .select()
      .single()

    if (error) throw error

    return { success: true, profile }
  } catch (error) {
    console.error("💥 Update driver status error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update driver status",
    }
  }
}

export async function getDriverEarnings(
  user_id: string,
  options: {
    period?: string
    startDate?: string | null
    endDate?: string | null
  },
) {
  try {
    const { period = "week", startDate, endDate } = options

    // Get driver profile ID
    const { data: driverProfile, error: driverError } = await supabase
      .from("driver_profiles")
      .select("id")
      .eq("user_id", user_id)
      .single()

    if (driverError || !driverProfile) {
      throw new Error("Driver profile not found")
    }

    // Calculate date range based on period
    let dateFilter = ""
    const now = new Date()

    if (startDate && endDate) {
      dateFilter = `created_at.gte.${startDate}T00:00:00Z,created_at.lte.${endDate}T23:59:59Z`
    } else {
      switch (period) {
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
    }

    // Get completed rides with payments for earnings calculation
    let query = supabase
      .from("rides")
      .select(`
        id,
        fare_amount,
        created_at,
        completed_at,
        payments!payments_ride_id_fkey (
          driver_amount,
          payment_status
        )
      `)
      .eq("driver_profile_id", driverProfile.id)
      .eq("status", "completed")

    if (dateFilter) {
      const [field, operator, value] = dateFilter.split(".")
      if (operator === "gte") {
        query = query.gte(field, value)
      } else if (operator === "lte") {
        query = query.lte(field, value)
      }
    }

    const { data: rides, error } = await query.order("completed_at", { ascending: false })

    if (error) throw error

    // Calculate earnings summary
    const totalEarnings =
      rides?.reduce((sum, ride) => {
        const payment = ride.payments?.[0]
        return sum + (payment?.payment_status === "completed" ? payment.driver_amount || 0 : 0)
      }, 0) || 0

    const totalRides = rides?.length || 0

    // Group by date for chart data
    const dailyEarnings: Record<string, { date: string; earnings: number; rides: number }> = {}

    rides?.forEach((ride) => {
      const date = ride.completed_at?.split("T")[0] || ride.created_at.split("T")[0]
      if (!dailyEarnings[date]) {
        dailyEarnings[date] = { date, earnings: 0, rides: 0 }
      }
      const payment = ride.payments?.[0]
      if (payment?.payment_status === "completed") {
        dailyEarnings[date].earnings += payment.driver_amount || 0
        dailyEarnings[date].rides += 1
      }
    })

    const chartData = Object.values(dailyEarnings).sort((a, b) => a.date.localeCompare(b.date))

    return {
      success: true,
      earnings: {
        total: totalEarnings,
        totalRides,
        period,
        chartData,
        rides,
      },
    }
  } catch (error) {
    console.error("💥 Get driver earnings error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get driver earnings",
    }
  }
}

export async function getDriverStats(user_id: string) {
  try {
    // Get driver profile
    const { data: driverProfile, error: driverError } = await supabase
      .from("driver_profiles")
      .select(`
        *,
        users (full_name, email, phone)
      `)
      .eq("user_id", user_id)
      .single()

    if (driverError || !driverProfile) {
      throw new Error("Driver profile not found")
    }

    // Get ride statistics
    const { data: rides, error: ridesError } = await supabase
      .from("rides")
      .select(`
        id,
        status,
        fare_amount,
        created_at,
        payments (driver_amount, payment_status)
      `)
      .eq("driver_profile_id", driverProfile.id)

    if (ridesError) throw ridesError

    // Get ratings
    const { data: ratings, error: ratingsError } = await supabase
      .from("ratings")
      .select("rating")
      .eq("rated_id", user_id)
      .eq("rating_type", "passenger_to_driver")

    if (ratingsError) throw ratingsError

    const stats = {
      profile: driverProfile,
      totalRides: rides?.length || 0,
      completedRides: rides?.filter((r) => r.status === "completed").length || 0,
      totalEarnings:
        rides?.reduce((sum, ride) => {
          const payment = ride.payments?.[0]
          return sum + (payment?.payment_status === "completed" ? payment.driver_amount || 0 : 0)
        }, 0) || 0,
      averageRating: ratings?.length
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
        : "5.0",
      totalRatings: ratings?.length || 0,
    }

    return { success: true, stats }
  } catch (error) {
    console.error("💥 Get driver stats error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get driver stats",
    }
  }
}

export async function createDriverVehicle(
  driver_user_id: string,
  vehicleData: {
    vehicle_type: "car" | "keke" | "bike"
    make: string
    model: string
    year: number
    color: string
    plate_number: string
    insurance_expiry?: string
  },
) {
  try {
    // Get driver profile ID
    const { data: driverProfile, error: driverError } = await supabase
      .from("driver_profiles")
      .select("id")
      .eq("user_id", driver_user_id)
      .single()

    if (driverError || !driverProfile) {
      throw new Error("Driver profile not found")
    }

    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .insert({
        driver_profile_id: driverProfile.id,
        ...vehicleData,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, vehicle }
  } catch (error) {
    console.error("💥 Create driver vehicle error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create vehicle",
    }
  }
}
