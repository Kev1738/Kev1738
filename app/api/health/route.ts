import { NextResponse } from "next/server"
import { checkDatabaseHealth } from "@/lib/database"

export async function GET() {
  try {
    const dbHealth = await checkDatabaseHealth()

    const health = {
      status: dbHealth.status === "healthy" ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      database: dbHealth,
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      services: {
        database: dbHealth.status === "healthy",
        auth: dbHealth.auth || false,
        api: true,
      },
      config: {
        supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        jwtConfigured: !!process.env.JWT_SECRET,
        googleMapsConfigured: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    }

    const statusCode = health.status === "healthy" ? 200 : 503

    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    console.error("💥 Health check error:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        database: { success: false, message: "Database connection failed" },
        environment: process.env.NODE_ENV || "development",
        version: "1.0.0",
        services: {
          database: false,
          auth: false,
          api: false,
        },
      },
      { status: 500 },
    )
  }
}
