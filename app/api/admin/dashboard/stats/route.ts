import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Get total users
    const totalUsersResult = await sql`
      SELECT COUNT(*) as count FROM users
    `
    const totalUsers = Number.parseInt(totalUsersResult[0]?.count || "0")

    // Get total and active drivers
    const driversResult = await sql`
      SELECT 
        COUNT(*) as total_drivers,
        COUNT(CASE WHEN status = 'online' THEN 1 END) as active_drivers
      FROM driver_profiles
    `
    const totalDrivers = Number.parseInt(driversResult[0]?.total_drivers || "0")
    const activeDrivers = Number.parseInt(driversResult[0]?.active_drivers || "0")

    // Get ride statistics
    const ridesResult = await sql`
      SELECT 
        COUNT(*) as total_rides,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_rides,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN fare ELSE 0 END), 0) as total_revenue
      FROM rides
    `
    const totalRides = Number.parseInt(ridesResult[0]?.total_rides || "0")
    const completedRides = Number.parseInt(ridesResult[0]?.completed_rides || "0")
    const totalRevenue = Number.parseFloat(ridesResult[0]?.total_revenue || "0")

    // Get monthly revenue
    const monthlyRevenueResult = await sql`
      SELECT COALESCE(SUM(fare), 0) as monthly_revenue
      FROM rides 
      WHERE status = 'completed' 
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `
    const monthlyRevenue = Number.parseFloat(monthlyRevenueResult[0]?.monthly_revenue || "0")

    // Calculate completion rate
    const completionRate = totalRides > 0 ? (completedRides / totalRides) * 100 : 0

    const stats = {
      totalUsers,
      totalDrivers,
      activeDrivers,
      totalRides,
      completedRides,
      totalRevenue,
      monthlyRevenue,
      completionRate,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard statistics" }, { status: 500 })
  }
}
