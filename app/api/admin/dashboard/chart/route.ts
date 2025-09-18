import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const chartData = []

    // Get data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      // Get rides for this date
      const { count: rides } = await supabase
        .from("rides")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${dateStr}T00:00:00`)
        .lt("created_at", `${dateStr}T23:59:59`)

      // Get revenue for this date
      const { data: revenueData } = await supabase
        .from("rides")
        .select("fare")
        .eq("status", "completed")
        .gte("created_at", `${dateStr}T00:00:00`)
        .lt("created_at", `${dateStr}T23:59:59`)

      const revenue = revenueData?.reduce((sum, ride) => sum + (ride.fare || 0), 0) || 0

      chartData.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        rides: rides || 0,
        revenue: Math.round(revenue),
      })
    }

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Chart data error:", error)
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 })
  }
}
