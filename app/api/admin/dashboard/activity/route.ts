import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("📋 Admin dashboard activity API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json(createErrorResponse(new Error("Unauthorized"), "Access denied"), { status: 403 })
    }

    // Get recent activities from multiple sources
    const activities = []

    // Recent rides
    const { data: recentRides } = await supabase
      .from("rides")
      .select(`
        id,
        status,
        created_at,
        passenger:users!rides_passenger_id_fkey (full_name),
        driver_profile:driver_profiles!rides_driver_profile_id_fkey (
          users!driver_profiles_user_id_fkey (full_name)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    if (recentRides) {
      recentRides.forEach((ride) => {
        let message = ""
        let status = "info"

        switch (ride.status) {
          case "completed":
            message = `Ride completed by ${ride.driver_profile?.users?.full_name || "Unknown driver"} for ${ride.passenger?.full_name || "Unknown passenger"}`
            status = "success"
            break
          case "cancelled":
            message = `Ride cancelled for ${ride.passenger?.full_name || "Unknown passenger"}`
            status = "error"
            break
          case "pending":
            message = `New ride request from ${ride.passenger?.full_name || "Unknown passenger"}`
            status = "info"
            break
          case "accepted":
            message = `Ride accepted by ${ride.driver_profile?.users?.full_name || "Unknown driver"}`
            status = "success"
            break
          default:
            message = `Ride ${ride.status} for ${ride.passenger?.full_name || "Unknown passenger"}`
            status = "info"
        }

        activities.push({
          id: `ride-${ride.id}`,
          type: "ride",
          message,
          timestamp: ride.created_at,
          status,
        })
      })
    }

    // Recent user registrations
    const { data: recentUsers } = await supabase
      .from("users")
      .select("id, full_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentUsers) {
      recentUsers.forEach((user) => {
        activities.push({
          id: `user-${user.id}`,
          type: "user",
          message: `New ${user.role} registered: ${user.full_name}`,
          timestamp: user.created_at,
          status: "success",
        })
      })
    }

    // Recent payments
    const { data: recentPayments } = await supabase
      .from("payments")
      .select(`
        id,
        amount,
        payment_status,
        created_at,
        passenger:users!payments_passenger_id_fkey (full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentPayments) {
      recentPayments.forEach((payment) => {
        let status = "info"
        switch (payment.payment_status) {
          case "completed":
            status = "success"
            break
          case "failed":
            status = "error"
            break
          case "pending":
            status = "warning"
            break
        }

        activities.push({
          id: `payment-${payment.id}`,
          type: "payment",
          message: `Payment ${payment.payment_status}: ₦${payment.amount?.toLocaleString()} from ${payment.passenger?.full_name || "Unknown user"}`,
          timestamp: payment.created_at,
          status,
        })
      })
    }

    // Recent driver status changes
    const { data: recentDriverUpdates } = await supabase
      .from("driver_profiles")
      .select(`
        id,
        is_online,
        updated_at,
        users!driver_profiles_user_id_fkey (full_name)
      `)
      .order("updated_at", { ascending: false })
      .limit(5)

    if (recentDriverUpdates) {
      recentDriverUpdates.forEach((driver) => {
        activities.push({
          id: `driver-${driver.id}`,
          type: "driver",
          message: `Driver ${driver.users?.full_name || "Unknown"} went ${driver.is_online ? "online" : "offline"}`,
          timestamp: driver.updated_at,
          status: driver.is_online ? "success" : "warning",
        })
      })
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Return top 20 activities
    const recentActivity = activities.slice(0, 20)

    console.log(`✅ Dashboard activity fetched: ${recentActivity.length} activities`)

    return NextResponse.json(createSuccessResponse(recentActivity, "Dashboard activity fetched successfully"))
  } catch (error) {
    console.error("💥 Admin dashboard activity error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch dashboard activity"), { status: 500 })
  }
}
