import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Admin dashboard stats API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json(createErrorResponse(new Error("Unauthorized"), "Access denied"), { status: 403 })
    }

    // Get current date for today's stats
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

    // Fetch all stats in parallel
    const [
      usersResult,
      driversResult,
      onlineDriversResult,
      ridesResult,
      completedRidesResult,
      pendingRidesResult,
      activeRidesResult,
      cancelledRidesResult,
      paymentsResult,
      todayPaymentsResult,
    ] = await Promise.all([
      // Total users
      supabase
        .from("users")
        .select("id", { count: "exact", head: true }),

      // Total drivers
      supabase
        .from("driver_profiles")
        .select("id", { count: "exact", head: true }),

      // Online drivers
      supabase
        .from("driver_profiles")
        .select("id", { count: "exact", head: true })
        .eq("is_online", true),

      // Total rides
      supabase
        .from("rides")
        .select("id", { count: "exact", head: true }),

      // Completed rides
      supabase
        .from("rides")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),

      // Pending rides
      supabase
        .from("rides")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),

      // Active rides (accepted, driver_arrived, in_progress)
      supabase
        .from("rides")
        .select("id", { count: "exact", head: true })
        .in("status", ["accepted", "driver_arrived", "in_progress"]),

      // Cancelled rides
      supabase
        .from("rides")
        .select("id", { count: "exact", head: true })
        .eq("status", "cancelled"),

      // Total revenue from completed payments
      supabase
        .from("payments")
        .select("amount")
        .eq("payment_status", "completed"),

      // Today's revenue
      supabase
        .from("payments")
        .select("amount")
        .eq("payment_status", "completed")
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),
    ])

    // Calculate total revenue
    const totalRevenue = paymentsResult.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
    const todayRevenue = todayPaymentsResult.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

    const stats = {
      totalUsers: usersResult.count || 0,
      totalDrivers: driversResult.count || 0,
      onlineDrivers: onlineDriversResult.count || 0,
      totalRides: ridesResult.count || 0,
      completedRides: completedRidesResult.count || 0,
      pendingRides: pendingRidesResult.count || 0,
      activeRides: activeRidesResult.count || 0,
      cancelledRides: cancelledRidesResult.count || 0,
      totalRevenue,
      todayRevenue,
    }

    console.log("✅ Dashboard stats fetched:", stats)

    return NextResponse.json(createSuccessResponse(stats, "Dashboard stats fetched successfully"))
  } catch (error) {
    console.error("💥 Admin dashboard stats error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch dashboard stats"), { status: 500 })
  }
}
