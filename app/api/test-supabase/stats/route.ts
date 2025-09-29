import { NextResponse } from "next/server"
import { supabase, getTableNames, getDatabaseStats } from "@/lib/database"

export async function GET() {
  try {
    const startTime = Date.now()

    // Get basic counts
    const [usersResult, driversResult, ridesResult] = await Promise.all([
      supabase.from("users").select("count(*)", { count: "exact", head: true }),
      supabase.from("drivers").select("count(*)", { count: "exact", head: true }),
      supabase.from("rides").select("count(*)", { count: "exact", head: true }),
    ])

    // Get table names
    const tables = await getTableNames()

    // Get additional database stats if available
    const dbStats = await getDatabaseStats()

    const duration = Date.now() - startTime

    const stats = {
      users_count: usersResult.count || 0,
      drivers_count: driversResult.count || 0,
      rides_count: ridesResult.count || 0,
      tables: tables,
      connection_info: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + "..." || "Not configured",
        status: "connected",
        auth_status: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "configured" : "missing",
      },
      additional_stats: dbStats,
      response_time: duration,
    }

    return NextResponse.json({
      success: true,
      message: `Database statistics retrieved successfully (${duration}ms)`,
      duration,
      data: stats,
    })
  } catch (error) {
    console.error("Database stats error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to retrieve database statistics: ${error}`,
        details: {
          error_type: error instanceof Error ? error.constructor.name : "Unknown",
          error_message: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 },
    )
  }
}
