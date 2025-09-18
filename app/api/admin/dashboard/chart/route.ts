import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Get data for the last 7 days
    const chartData = await sql`
      SELECT 
        TO_CHAR(date_series, 'Mon DD') as name,
        COALESCE(ride_count, 0) as rides,
        COALESCE(daily_revenue, 0) as revenue
      FROM (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        ) as date_series
      ) dates
      LEFT JOIN (
        SELECT 
          DATE(created_at) as ride_date,
          COUNT(*) as ride_count,
          SUM(CASE WHEN status = 'completed' THEN fare ELSE 0 END) as daily_revenue
        FROM rides
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(created_at)
      ) ride_stats ON DATE(date_series) = ride_stats.ride_date
      ORDER BY date_series
    `

    return NextResponse.json(chartData)
  } catch (error) {
    console.error("Chart data error:", error)
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 })
  }
}
