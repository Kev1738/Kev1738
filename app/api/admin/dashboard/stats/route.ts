import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Get total users
    const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true })

    // Get active drivers (online status)
    const { count: activeDrivers } = await supabase
      .from("driver_profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_online", true)

    // Get total revenue from completed rides
    const { data: revenueData } = await supabase.from("rides").select("fare").eq("status", "completed")

    const totalRevenue = revenueData?.reduce((sum, ride) => sum + (ride.fare || 0), 0) || 0

    // Get completion rate
    const { count: totalRides } = await supabase.from("rides").select("*", { count: "exact", head: true })

    const { count: completedRides } = await supabase
      .from("rides")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")

    const completionRate = totalRides ? Math.round((completedRides! / totalRides) * 100) : 0

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeDrivers: activeDrivers || 0,
      totalRevenue: Math.round(totalRevenue),
      completionRate,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
