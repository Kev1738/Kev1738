import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const activities = []

    // Get recent user registrations
    const { data: recentUsers } = await supabase
      .from("users")
      .select("email, created_at, role")
      .order("created_at", { ascending: false })
      .limit(5)

    recentUsers?.forEach((user) => {
      activities.push({
        id: `user-${user.email}`,
        type: "User Registration",
        message: `New ${user.role} registered: ${user.email}`,
        timestamp: new Date(user.created_at).toLocaleString(),
        status: "success",
      })
    })

    // Get recent rides
    const { data: recentRides } = await supabase
      .from("rides")
      .select("id, status, created_at, fare")
      .order("created_at", { ascending: false })
      .limit(5)

    recentRides?.forEach((ride) => {
      activities.push({
        id: `ride-${ride.id}`,
        type: "Ride Update",
        message: `Ride #${ride.id} ${ride.status} - $${ride.fare || 0}`,
        timestamp: new Date(ride.created_at).toLocaleString(),
        status: ride.status === "completed" ? "success" : ride.status === "cancelled" ? "error" : "warning",
      })
    })

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json(activities.slice(0, 10))
  } catch (error) {
    console.error("Activity data error:", error)
    return NextResponse.json({ error: "Failed to fetch activity data" }, { status: 500 })
  }
}
