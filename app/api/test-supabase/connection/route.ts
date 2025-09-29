import { NextResponse } from "next/server"
import { supabase, testConnection } from "@/lib/database"

export async function GET() {
  try {
    const startTime = Date.now()

    // Test basic connection
    const connectionResult = await testConnection()
    const duration = Date.now() - startTime

    if (!connectionResult.success) {
      return NextResponse.json({
        success: false,
        error: connectionResult.error,
        duration,
        details: {
          supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing",
          supabase_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "configured" : "missing",
        },
      })
    }

    // Get additional connection info
    const { data: authUser } = await supabase.auth.getUser()

    return NextResponse.json({
      success: true,
      message: `Connection successful (${duration}ms)`,
      duration,
      data: {
        connection_status: "connected",
        auth_status: authUser ? "authenticated" : "anonymous",
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + "...",
        response_time: duration,
      },
    })
  } catch (error) {
    console.error("Connection test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Connection failed: ${error}`,
        details: {
          error_type: error instanceof Error ? error.constructor.name : "Unknown",
          error_message: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 },
    )
  }
}
