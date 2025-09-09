import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Environment variables check")

    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + "..."
          : "Not set",
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        value: process.env.SUPABASE_SERVICE_ROLE_KEY
          ? "sk-" + process.env.SUPABASE_SERVICE_ROLE_KEY.substring(3, 10) + "..."
          : "Not set",
      },
      SUPABASE_ANON_KEY: {
        exists: !!process.env.SUPABASE_ANON_KEY,
        value: process.env.SUPABASE_ANON_KEY
          ? "eyJ" + process.env.SUPABASE_ANON_KEY.substring(3, 10) + "..."
          : "Not set",
      },
      NODE_ENV: {
        exists: !!process.env.NODE_ENV,
        value: process.env.NODE_ENV || "Not set",
      },
    }

    const allRequired = envVars.NEXT_PUBLIC_SUPABASE_URL.exists && envVars.SUPABASE_SERVICE_ROLE_KEY.exists

    console.log("Environment check results:", {
      allRequired,
      supabaseUrl: envVars.NEXT_PUBLIC_SUPABASE_URL.exists,
      serviceKey: envVars.SUPABASE_SERVICE_ROLE_KEY.exists,
    })

    return NextResponse.json({
      success: allRequired,
      message: allRequired ? "All required environment variables are set" : "Missing required environment variables",
      variables: envVars,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("💥 Environment check error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error checking environment variables",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
