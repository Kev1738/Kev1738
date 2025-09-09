import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"
import { supabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("💰 Get driver earnings API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "driver") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "week"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    console.log("📊 Earnings query params:", { period, startDate, endDate })

    // Get driver profile ID
    const { data: driverProfile, error: driverError } = await supabase
      .from("driver_profiles")
      .select("id, total_earnings")
      .eq("user_id", user.id)
      .single()

    if (driverError) {
      console.error("❌ Driver profile not found:", driverError)
      return NextResponse.json({ success: false, error: "Driver profile not found" }, { status: 404 })
    }

    // Calculate date range
    let dateFilter = {}
    const now = new Date()

    if (startDate && endDate) {
      dateFilter = {
        completed_at: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
      }
    } else {
      switch (period) {
        case "today":
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          dateFilter = {
            completed_at: {
              gte: today.toISOString(),
            },
          }
          break
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          dateFilter = {
            completed_at: {
              gte: weekAgo.toISOString(),
            },
          }
          break
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          dateFilter = {
            completed_at: {
              gte: monthAgo.toISOString(),
            },
          }
          break
        case "year":
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          dateFilter = {
            completed_at: {
              gte: yearAgo.toISOString(),
            },
          }
          break
      }
    }

    // Get completed rides for earnings calculation
    let query = supabase
      .from("rides")
      .select("fare_amount, created_at, completed_at")
      .eq("driver_id", driverProfile.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })

    // Apply date filter
    if (dateFilter.completed_at?.gte) {
      query = query.gte("completed_at", dateFilter.completed_at.gte)
    }
    if (dateFilter.completed_at?.lte) {
      query = query.lte("completed_at", dateFilter.completed_at.lte)
    }

    const { data: rides, error: ridesError } = await query

    if (ridesError) {
      console.error("❌ Rides fetch error:", ridesError)
      throw ridesError
    }

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

    // Calculate today's earnings
    const today = new Date().toISOString().split("T")[0]
    const todayEarnings = dailyEarnings[today]?.earnings || 0

    const earningsData = {
      totalEarnings: driverProfile.total_earnings || 0,
      periodEarnings: totalEarnings,
      todayEarnings,
      totalRides,
      period,
      chartData,
      rides: rides.slice(0, 10), // Return last 10 rides
    }

    console.log("✅ Earnings data calculated successfully")
    return NextResponse.json(createSuccessResponse(earningsData), { status: 200 })
  } catch (error) {
    console.error("💥 Get driver earnings API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch driver earnings"), { status: 500 })
  }
}
