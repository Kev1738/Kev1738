import { supabase } from "./database"

export interface DatabaseHealth {
  healthy: boolean
  message: string
  timestamp: string
  details?: any
}

export interface EnvironmentCheck {
  valid: boolean
  error?: string
  details?: any
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    console.log("🏥 Checking database health...")

    // Test basic connection
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("❌ Database health check failed:", error)
      return {
        healthy: false,
        message: `Database connection failed: ${error.message}`,
        timestamp: new Date().toISOString(),
        details: error,
      }
    }

    console.log("✅ Database health check passed")
    return {
      healthy: true,
      message: "Database is healthy",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("💥 Database health check error:", error)
    return {
      healthy: false,
      message: `Database health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp: new Date().toISOString(),
      details: error,
    }
  }
}

export async function validateEnvironment(): Promise<EnvironmentCheck> {
  try {
    console.log("🌍 Validating environment variables...")

    const requiredVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    const missing = Object.entries(requiredVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missing.length > 0) {
      const error = `Missing required environment variables: ${missing.join(", ")}`
      console.error("❌", error)
      return {
        valid: false,
        error,
        details: {
          missing,
          provided: Object.keys(requiredVars).filter((key) => requiredVars[key as keyof typeof requiredVars]),
        },
      }
    }

    console.log("✅ Environment validation passed")
    return {
      valid: true,
    }
  } catch (error) {
    console.error("💥 Environment validation error:", error)
    return {
      valid: false,
      error: `Environment validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: error,
    }
  }
}

export async function getSystemStatus() {
  const [dbHealth, envCheck] = await Promise.all([checkDatabaseHealth(), validateEnvironment()])

  return {
    database: dbHealth,
    environment: envCheck,
    overall: dbHealth.healthy && envCheck.valid ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
  }
}
