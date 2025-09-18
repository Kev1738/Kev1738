import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7d"

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case "24h":
        startDate.setHours(now.getHours() - 24)
        break
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Get total users
    const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

    // Get total drivers
    const { count: totalDrivers } = await supabase.from("driver_profiles").select("*", { count: "exact", head: true })

    // Get online drivers
    const { count: onlineDrivers } = await supabase
      .from("driver_profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_online", true)

    // Get total rides
    const { count: totalRides } = await supabase.from("rides").select("*", { count: "exact", head: true })

    // Get completed rides in period
    const { count: completedRides } = await supabase
      .from("rides")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", startDate.toISOString())

    // Get total revenue
    const { data: revenueData } = await supabase
      .from("payments")
      .select("amount")
      .eq("status", "completed")
      .gte("created_at", startDate.toISOString())

    const totalRevenue = revenueData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

    // Get rides by status
    const { data: ridesByStatus } = await supabase
      .from("rides")
      .select("status")
      .gte("created_at", startDate.toISOString())

    const statusCounts =
      ridesByStatus?.reduce((acc: any, ride) => {
        acc[ride.status] = (acc[ride.status] || 0) + 1
        return acc
      }, {}) || {}

    // Get daily ride trends
    const { data: dailyRides } = await supabase
      .from("rides")
      .select("created_at, status")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })

    // Group by day
    const dailyTrends =
      dailyRides?.reduce((acc: any, ride) => {
        const date = new Date(ride.created_at).toISOString().split("T")[0]
        if (!acc[date]) {
          acc[date] = { date, total: 0, completed: 0 }
        }
        acc[date].total++
        if (ride.status === "completed") {
          acc[date].completed++
        }
        return acc
      }, {}) || {}

    // Get top drivers
    const { data: topDrivers } = await supabase
      .from("driver_profiles")
      .select(`
        id,
        total_rides,
        total_earnings,
        rating,
        users (full_name)
      `)
      .order("total_rides", { ascending: false })
      .limit(5)

    // Get vehicle type distribution
    const { data: vehicleTypes } = await supabase
      .from("rides")
      .select("vehicle_type")
      .gte("created_at", startDate.toISOString())

    const vehicleDistribution =
      vehicleTypes?.reduce((acc: any, ride) => {
        acc[ride.vehicle_type] = (acc[ride.vehicle_type] || 0) + 1
        return acc
      }, {}) || {}

    return NextResponse.json({
      overview: {
        totalUsers: totalUsers || 0,
        totalDrivers: totalDrivers || 0,
        onlineDrivers: onlineDrivers || 0,
        totalRides: totalRides || 0,
        completedRides: completedRides || 0,
        totalRevenue: totalRevenue,
        completionRate: totalRides ? (((completedRides || 0) / totalRides) * 100).toFixed(1) : "0",
      },
      ridesByStatus: statusCounts,
      dailyTrends: Object.values(dailyTrends),
      topDrivers: topDrivers || [],
      vehicleDistribution,
      period,
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
