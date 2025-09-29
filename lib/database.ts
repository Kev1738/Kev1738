import { createClient } from "@supabase/supabase-js"

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch (error) {
  throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL format: ${supabaseUrl}`)
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database operation helpers
export async function executeQuery<T = any>(
  query: string,
  params: any[] = [],
): Promise<{ data: T[] | null; error: any }> {
  try {
    console.log("Executing query:", query, "with params:", params)

    // For now, we'll use the RPC method for custom queries
    const { data, error } = await supabase.rpc("execute_query", {
      query_text: query,
      query_params: params,
    })

    if (error) {
      console.error("Database query error:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Database operation failed:", error)
    return { data: null, error }
  }
}

export async function testConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.from("users").select("count(*)").limit(1)

    if (error) {
      console.error("Connection test failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Connection test error:", error)
    return { success: false, error: String(error) }
  }
}

export async function getTableNames(): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc("get_table_names")

    if (error) {
      console.error("Failed to get table names:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error getting table names:", error)
    return []
  }
}

export async function getDatabaseStats(): Promise<any> {
  try {
    const { data, error } = await supabase.rpc("get_database_stats")

    if (error) {
      console.error("Failed to get database stats:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error getting database stats:", error)
    return null
  }
}

// User operations
export async function createUser(userData: {
  email: string
  password_hash: string
  full_name: string
  phone: string
  role: "passenger" | "driver" | "admin"
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase.from("users").insert([userData]).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function getUserByEmail(email: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function updateUser(id: string, updates: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("users").delete().eq("id", id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// Driver operations
export async function createDriver(driverData: {
  user_id: string
  license_number: string
  vehicle_type: string
  vehicle_plate: string
  is_available: boolean
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase.from("drivers").insert([driverData]).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function getAvailableDrivers(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("drivers")
      .select(`
        *,
        users (
          id,
          full_name,
          phone,
          email
        )
      `)
      .eq("is_available", true)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// Ride operations
export async function createRide(rideData: {
  passenger_id: string
  pickup_location: string
  destination: string
  pickup_coordinates: [number, number]
  destination_coordinates: [number, number]
  vehicle_type: string
  estimated_fare: number
  status: string
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data, error } = await supabase.from("rides").insert([rideData]).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function updateRideStatus(
  rideId: string,
  status: string,
  driverId?: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const updates: any = { status }
    if (driverId) {
      updates.driver_id = driverId
    }

    const { data, error } = await supabase.from("rides").update(updates).eq("id", rideId).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export async function getRideHistory(
  userId: string,
  role: "passenger" | "driver",
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const column = role === "passenger" ? "passenger_id" : "driver_id"

    const { data, error } = await supabase
      .from("rides")
      .select(`
        *,
        passenger:users!rides_passenger_id_fkey (
          id,
          full_name,
          phone
        ),
        driver:users!rides_driver_id_fkey (
          id,
          full_name,
          phone
        )
      `)
      .eq(column, userId)
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

export default supabase
