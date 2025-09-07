"use server"

import { supabase } from "./database"

export async function checkDatabaseHealth() {
  try {
    console.log("🔍 Checking database health...")

    // Test basic connection with a simple query that should always work
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("❌ Database connection failed:", error)
      return {
        healthy: false,
        error: error.message,
        code: error.code,
        details: error.details,
      }
    }

    console.log("✅ Database connection successful")

    // Check if key tables exist
    const tables = ["users", "driver_profiles", "vehicles", "rides", "wallets"]
    const tableStatus: Record<string, boolean> = {}

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select("*").limit(1)

        tableStatus[table] = !tableError

        if (tableError) {
          console.warn(`⚠️ Table ${table} issue:`, tableError.message)
        }
      } catch (err) {
        console.warn(`⚠️ Table ${table} not accessible:`, err)
        tableStatus[table] = false
      }
    }

    return {
      healthy: true,
      tables: tableStatus,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("❌ Database health check failed:", error)
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

export async function validateEnvironment() {
  const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missing.length > 0) {
    console.error("❌ Missing environment variables:", missing)
    return {
      valid: false,
      missing,
      error: `Missing required environment variables: ${missing.join(", ")}`,
    }
  }

  console.log("✅ Environment variables validated")
  return { valid: true }
}
