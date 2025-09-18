import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Get recent activities from various tables
    const activities = await sql`
      (
        SELECT 
          'user-' || id::text as id,
          'User Registration' as type,
          'New user ' || name || ' registered' as description,
          created_at as timestamp,
          'success' as status
        FROM users 
        WHERE created_at >= NOW() - INTERVAL '24 hours'
        ORDER BY created_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 
          'ride-' || id::text as id,
          'Ride Completed' as type,
          'Ride completed - $' || fare::text as description,
          updated_at as timestamp,
          'success' as status
        FROM rides 
        WHERE status = 'completed' 
          AND updated_at >= NOW() - INTERVAL '24 hours'
        ORDER BY updated_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 
          'driver-' || user_id::text as id,
          'Driver Status' as type,
          'Driver went ' || status as description,
          updated_at as timestamp,
          CASE 
            WHEN status = 'online' THEN 'success'
            WHEN status = 'offline' THEN 'warning'
            ELSE 'secondary'
          END as status
        FROM driver_profiles 
        WHERE updated_at >= NOW() - INTERVAL '24 hours'
        ORDER BY updated_at DESC
        LIMIT 5
      )
      ORDER BY timestamp DESC
      LIMIT 10
    `

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Activity data error:", error)
    return NextResponse.json({ error: "Failed to fetch activity data" }, { status: 500 })
  }
}
