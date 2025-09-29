import { NextResponse } from "next/server"
import { testConnection, getAllUsers, getAnalytics } from "@/lib/database"

export async function GET() {
  try {
    console.log("Testing database connection...")

    // Test basic connection
    const connectionTest = await testConnection()
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: connectionTest.error,
      })
    }

    // Test user query
    const usersResult = await getAllUsers()
    const userCount = usersResult.success ? usersResult.data?.length || 0 : 0

    // Test analytics
    const analyticsResult = await getAnalytics()
    const analytics = analyticsResult.success ? analyticsResult.data : null

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: {
        connection: connectionTest.message,
        userCount,
        analytics,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json({
      success: false,
      error: "Database test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
