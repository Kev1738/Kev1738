import { NextResponse } from "next/server"
import { testConnection } from "@/lib/database"

export async function GET() {
  try {
    const dbTest = await testConnection()

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: dbTest,
      environment: process.env.NODE_ENV || "development",
    }

    return NextResponse.json(health)
  } catch (error) {
    console.error("💥 Health check error:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        database: { success: false, message: "Database connection failed" },
      },
      { status: 500 },
    )
  }
}
