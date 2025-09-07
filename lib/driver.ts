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
          profile_image_url
        ),
        vehicles (
          id,
          vehicle_type,
          make,
          model,
          year,
          color,
          plate_number,
          is_active
        )
      `)
      .eq("user_id", user_id)
      .single()

    if (error) throw error

    return { success: true, profile }
  } catch (error) {
    console.error("Get driver profile error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get driver profile",
    }
  }
}

export async function updateDriverProfile(user_id: string, profileData: any) {
  try {
    const { data: profile, error } = await supabase
      .from("driver_profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .select()
      .single()

    if (error) throw error

    return { success: true, profile }
  } catch (error) {
    console.error("Update driver profile error:", error)
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
    latitude?: number
    longitude?: number
  },
) {
  try {
    const updateData: any = {
      is_online: statusData.is_online,
      updated_at: new Date().toISOString(),
    }

    if (statusData.latitude !== undefined) {
      updateData.current_latitude = statusData.latitude
    }
    if (statusData.longitude !== undefined) {
      updateData.current_longitude = statusData.longitude
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
    console.error("Update driver status error:", error)
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

    // Get completed rides for earnings calculation
    let query = supabase
      .from("rides")
      .select("fare_amount, created_at, completed_at")
      .eq("driver_id", driverProfile.id)
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
    const totalEarnings = rides.reduce((sum, ride) => sum + (ride.fare_amount || 0), 0)
    const totalRides = rides.length

    // Group by date for chart data
    const dailyEarnings: Record<string, { date: string; earnings: number; rides: number }> = {}

    rides.forEach((ride) => {
      const date = ride.completed_at?.split("T")[0] || ride.created_at.split("T")[0]
      if (!dailyEarnings[date]) {
        dailyEarnings[date] = { date, earnings: 0, rides: 0 }
      }
      dailyEarnings[date].earnings += ride.fare_amount || 0
      dailyEarnings[date].rides += 1
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
    console.error("Get driver earnings error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get driver earnings",
    }
  }
}
