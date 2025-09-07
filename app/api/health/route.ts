import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🏥 Health check requested")

    // Basic environment check
    const envCheck = {
      valid: true,
      missing: [] as string[],
    }

    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])

    if (missing.length > 0) {
      envCheck.valid = false
      envCheck.missing = missing
    }

    // Basic database connectivity check
    const dbHealth = {
      healthy: true,
      error: null as string | null,
    }

    try {
      // Simple test - try to import the database module
      const { supabase } = await import("@/lib/database")

      // Test basic connection with a simple query
      const { error } = await supabase.from("users").select("count").limit(1)

      if (error) {
        dbHealth.healthy = false
        dbHealth.error = error.message
      }
    } catch (error) {
      console.warn("Database health check failed:", error)
      dbHealth.healthy = false
      dbHealth.error = error instanceof Error ? error.message : "Database connection failed"
    }

    const health = {
      status: envCheck.valid && dbHealth.healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbHealth,
      version: "1.0.0",
      services: {
        api: "operational",
        auth: "operational",
        database: dbHealth.healthy ? "operational" : "degraded",
      },
    }

    console.log("📊 Health check result:", health.status)

    // Return 200 even for degraded status - the service is still functional
    return NextResponse.json(health, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("💥 Health check failed:", error)

    // Return a basic health response even if checks fail
    return NextResponse.json(
      {
        status: "degraded",
        error: error instanceof Error ? error.message : "Health check failed",
        timestamp: new Date().toISOString(),
        services: {
          api: "operational",
          auth: "unknown",
          database: "unknown",
        },
      },
      {
        status: 200, // Still return 200 so the app doesn't break
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  }
}
