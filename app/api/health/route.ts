import { NextResponse } from "next/server"
import { testConnection, checkEnvironmentVariables } from "@/lib/database"
import { createSuccessResponse, createErrorResponse } from "@/lib/error-handler"

export async function GET() {
  try {
    console.log("🏥 Health check endpoint called")

    // Check environment variables
    const envCheck = checkEnvironmentVariables()

    // Test database connection
    const dbHealthy = await testConnection()

    const healthData = {
      status: dbHealthy && envCheck.valid ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? "operational" : "down",
        api: "operational",
        environment: envCheck.valid ? "configured" : "missing_vars",
      },
      environment: {
        variables_configured: envCheck.valid,
        missing_variables: envCheck.missing,
      },
    }

    console.log("🏥 Health check result:", healthData)

    if (healthData.status === "healthy") {
      return NextResponse.json(createSuccessResponse(healthData, "System is healthy"), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } else {
      return NextResponse.json(createErrorResponse(new Error("System is degraded"), "System health check failed"), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("💥 Health check error:", error)

    return NextResponse.json(createErrorResponse(error, "Health check failed"), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
