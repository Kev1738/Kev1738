import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables:", {
    url: !!supabaseUrl,
    key: !!supabaseServiceKey,
  })
  throw new Error("Missing Supabase environment variables")
}

console.log("🔗 Connecting to Supabase:", supabaseUrl.substring(0, 30) + "...")

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
})

// Test database connection
export async function testDatabaseConnection() {
  try {
    console.log("🔍 Testing database connection...")
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("❌ Database connection failed:", error)
      return false
    }

    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("💥 Database connection error:", error)
    return false
  }
}

// Export the query function for compatibility
export async function query(text: string, params: any[] = []) {
  try {
    console.log("🔍 Executing query:", text.substring(0, 100) + "...")
    console.log("📊 Query params:", params)

    // For simple queries, we'll use Supabase client methods
    const { data, error } = await supabase.rpc("execute_sql", {
      query_text: text,
      query_params: params || [],
    })

    if (error) {
      console.error("❌ Database query error:", error)
      throw error
    }

    console.log("✅ Query executed successfully")
    return { rows: data || [] }
  } catch (error) {
    console.error("💥 Database connection error:", error)
    throw error
  }
}

export interface User {
  id: string
  email: string
  password: string
  full_name?: string
  phone?: string
  role: "passenger" | "driver" | "admin"
  is_verified: boolean
  is_active: boolean
  profile_image_url?: string
  created_at: string
  updated_at: string
}

export interface DriverProfile {
  id: string
  user_id: string
  license_number?: string
  license_expiry?: string
  vehicle_make?: string
  vehicle_model?: string
  vehicle_year?: number
  vehicle_color?: string
  vehicle_plate?: string
  is_online: boolean
  status: "offline" | "online" | "busy" | "break"
  current_location_lat?: number
  current_location_lng?: number
  rating: number
  total_rides: number
  total_earnings: number
  created_at: string
  updated_at: string
}

export interface PassengerProfile {
  id: string
  user_id: string
  preferred_payment_method: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

// Database helper functions
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    console.log("🔍 Getting user by email:", email)
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error) {
      if (error.code === "PGRST116") {
        console.log("ℹ️ User not found:", email)
        return null
      }
      console.error("❌ Get user by email error:", error)
      return null
    }

    console.log("✅ User found:", data.email)
    return data
  } catch (error) {
    console.error("💥 Get user by email error:", error)
    return null
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    console.log("🔍 Getting user by ID:", userId)
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("❌ Get user by ID error:", error)
      return null
    }

    console.log("✅ User found by ID:", data.email)
    return data
  } catch (error) {
    console.error("💥 Get user by ID error:", error)
    return null
  }
}

export async function createUser(userData: {
  email: string
  password: string
  full_name: string
  phone?: string
  role: string
}): Promise<User | null> {
  try {
    console.log("👤 Creating user:", userData.email)
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role,
          is_verified: false,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Create user error:", error)
      return null
    }

    console.log("✅ User created:", data.email)
    return data
  } catch (error) {
    console.error("💥 Create user error:", error)
    return null
  }
}

export async function createSession(userId: string, token: string, expiresAt: Date): Promise<Session | null> {
  try {
    console.log("🎫 Creating session for user:", userId)
    const { data, error } = await supabase
      .from("sessions")
      .insert([
        {
          user_id: userId,
          token,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Create session error:", error)
      return null
    }

    console.log("✅ Session created")
    return data
  } catch (error) {
    console.error("💥 Create session error:", error)
    return null
  }
}

export async function getSessionByToken(token: string): Promise<Session | null> {
  try {
    console.log("🔍 Getting session by token")
    const { data, error } = await supabase.from("sessions").select("*").eq("token", token).single()

    if (error) {
      if (error.code === "PGRST116") {
        console.log("ℹ️ Session not found")
        return null
      }
      console.error("❌ Get session by token error:", error)
      return null
    }

    console.log("✅ Session found")
    return data
  } catch (error) {
    console.error("💥 Get session by token error:", error)
    return null
  }
}

export async function deleteSession(token: string): Promise<boolean> {
  try {
    console.log("🗑️ Deleting session")
    const { error } = await supabase.from("sessions").delete().eq("token", token)

    if (error) {
      console.error("❌ Delete session error:", error)
      return false
    }

    console.log("✅ Session deleted")
    return true
  } catch (error) {
    console.error("💥 Delete session error:", error)
    return false
  }
}

export async function createDriverProfile(userId: string): Promise<DriverProfile | null> {
  try {
    console.log("🚗 Creating driver profile for user:", userId)
    const { data, error } = await supabase
      .from("driver_profiles")
      .insert([
        {
          user_id: userId,
          status: "offline",
          is_online: false,
          rating: 5.0,
          total_rides: 0,
          total_earnings: 0.0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Create driver profile error:", error)
      return null
    }

    console.log("✅ Driver profile created")
    return data
  } catch (error) {
    console.error("💥 Create driver profile error:", error)
    return null
  }
}

export async function createPassengerProfile(userId: string): Promise<PassengerProfile | null> {
  try {
    console.log("👤 Creating passenger profile for user:", userId)
    const { data, error } = await supabase
      .from("passenger_profiles")
      .insert([
        {
          user_id: userId,
          preferred_payment_method: "card",
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Create passenger profile error:", error)
      return null
    }

    console.log("✅ Passenger profile created")
    return data
  } catch (error) {
    console.error("💥 Create passenger profile error:", error)
    return null
  }
}

export async function createWallet(userId: string): Promise<Wallet | null> {
  try {
    console.log("💰 Creating wallet for user:", userId)
    const { data, error } = await supabase
      .from("wallets")
      .insert([
        {
          user_id: userId,
          balance: 0.0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Create wallet error:", error)
      return null
    }

    console.log("✅ Wallet created")
    return data
  } catch (error) {
    console.error("💥 Create wallet error:", error)
    return null
  }
}

export async function getDriverProfile(userId: string): Promise<DriverProfile | null> {
  try {
    const { data, error } = await supabase.from("driver_profiles").select("*").eq("user_id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Get driver profile error:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Get driver profile error:", error)
    return null
  }
}

export async function getPassengerProfile(userId: string): Promise<PassengerProfile | null> {
  try {
    const { data, error } = await supabase.from("passenger_profiles").select("*").eq("user_id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Get passenger profile error:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Get passenger profile error:", error)
    return null
  }
}

export async function getUserWallet(userId: string): Promise<Wallet | null> {
  try {
    const { data, error } = await supabase.from("wallets").select("*").eq("user_id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        return null
      }
      console.error("Get wallet error:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Get wallet error:", error)
    return null
  }
}
