import { createClient } from "@supabase/supabase-js"

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Create client-side Supabase client
export const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

console.log("✅ Supabase client initialized")

// =============================================
// DATABASE TYPES (Updated to match your existing schema)
// =============================================

export interface User {
  id: string // UUID
  email: string
  password: string
  full_name: string
  phone?: string
  role: "passenger" | "driver" | "admin"
  is_verified: boolean
  is_active: boolean
  profile_image_url?: string
  date_of_birth?: string
  gender?: "male" | "female" | "other"
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  created_at: string
  updated_at: string
}

export interface DriverProfile {
  id: string // UUID
  user_id: string // UUID
  license_number?: string
  license_expiry?: string
  is_online: boolean
  status: "offline" | "online" | "busy" | "break"
  current_location_lat?: number
  current_location_lng?: number
  rating: number
  total_rides: number
  total_earnings: number
  bio?: string
  years_experience?: number
  languages?: string[]
  bank_account_number?: string
  bank_name?: string
  created_at: string
  updated_at: string
}

export interface PassengerProfile {
  id: string // UUID
  user_id: string // UUID
  preferred_payment_method: "card" | "wallet" | "cash"
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string // UUID
  driver_profile_id: string // UUID
  vehicle_type: "car" | "keke" | "bike"
  make: string
  model: string
  year: number
  color: string
  plate_number: string
  is_active: boolean
  insurance_expiry?: string
  last_maintenance?: string
  created_at: string
  updated_at: string
}

export interface Ride {
  id: string // UUID
  passenger_id: string // UUID
  driver_profile_id?: string // UUID
  vehicle_id?: string // UUID
  ride_type: "shared" | "private"
  vehicle_type: "car" | "keke" | "bike"
  pickup_address: string
  pickup_latitude?: number
  pickup_longitude?: number
  destination_address: string
  destination_latitude?: number
  destination_longitude?: number
  distance_km?: number
  estimated_duration_minutes?: number
  actual_duration_minutes?: number
  fare_amount: number
  status: "pending" | "accepted" | "driver_arrived" | "in_progress" | "completed" | "cancelled"
  scheduled_time?: string
  accepted_at?: string
  driver_arrived_at?: string
  started_at?: string
  completed_at?: string
  cancelled_at?: string
  cancellation_reason?: string
  special_instructions?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string // UUID
  ride_id?: string // UUID
  passenger_id: string // UUID
  driver_profile_id?: string // UUID
  amount: number
  driver_amount?: number
  platform_fee?: number
  payment_method: "card" | "wallet" | "cash" | "bank_transfer"
  payment_status: "pending" | "processing" | "completed" | "failed" | "refunded"
  transaction_id?: string
  gateway_response?: any
  processed_at?: string
  created_at: string
  updated_at: string
}

export interface Wallet {
  id: string // UUID
  user_id: string // UUID
  balance: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WalletTransaction {
  id: string // UUID
  wallet_id: string // UUID
  amount: number
  transaction_type: "credit" | "debit"
  description: string
  reference_id?: string
  reference_type?: string
  balance_before: number
  balance_after: number
  created_at: string
}

export interface Notification {
  id: string // UUID
  user_id: string // UUID
  title: string
  message: string
  type: "info" | "success" | "warning" | "error" | "ride_update" | "payment" | "system"
  data?: any
  is_read: boolean
  expires_at?: string
  created_at: string
}

export interface Rating {
  id: string // UUID
  ride_id: string // UUID
  rater_id: string // UUID
  rated_id: string // UUID
  rating: number
  comment?: string
  rating_type: "passenger_to_driver" | "driver_to_passenger"
  is_anonymous: boolean
  created_at: string
}

export interface Session {
  id: string // UUID
  user_id: string // UUID
  token: string
  expires_at: string
  created_at: string
}

export interface UploadedFile {
  id: string // UUID
  user_id?: string // UUID
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  upload_purpose: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HealthCheck {
  id: number
  status: string
  checked_at: string
  details?: any
}

// =============================================
// HELPER FUNCTIONS (Updated for your schema)
// =============================================

// Test database connection
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("🔍 Testing Supabase connection...")

    // Test if users table exists
    const { data, error } = await supabase.from("users").select("id").limit(1)

    if (error) {
      console.error("❌ Supabase connection test failed:", error)
      return { success: false, message: `Database error: ${error.message}` }
    }

    console.log("✅ Supabase connection successful")
    return { success: true, message: "Database connected successfully" }
  } catch (error) {
    console.error("💥 Supabase connection test exception:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("is_active", true)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return { user: null, error: "User not found" }
      }
      console.error("Get user error:", error)
      return { user: null, error: error.message }
    }

    return { user: data, error: null }
  } catch (error) {
    console.error("Get user exception:", error)
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get driver profile by user ID
export async function getDriverProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("driver_profiles")
      .select(`
        *,
        vehicles (*)
      `)
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return { driver: null, error: "Driver profile not found" }
      }
      console.error("Get driver profile error:", error)
      return { driver: null, error: error.message }
    }

    return { driver: data, error: null }
  } catch (error) {
    console.error("Get driver profile exception:", error)
    return {
      driver: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get passenger profile by user ID
export async function getPassengerProfile(userId: string) {
  try {
    const { data, error } = await supabase.from("passenger_profiles").select("*").eq("user_id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        return { passenger: null, error: "Passenger profile not found" }
      }
      console.error("Get passenger profile error:", error)
      return { passenger: null, error: error.message }
    }

    return { passenger: data, error: null }
  } catch (error) {
    console.error("Get passenger profile exception:", error)
    return {
      passenger: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Create new user
export async function createUser(userData: {
  email: string
  password: string
  full_name: string
  phone?: string
  role: "passenger" | "driver"
}) {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert({
        email: userData.email.toLowerCase().trim(),
        password: userData.password, // In production, hash this
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role,
        is_active: true,
        is_verified: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Create user error:", error)
      return { user: null, error: error.message }
    }

    return { user: data, error: null }
  } catch (error) {
    console.error("Create user exception:", error)
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Create driver profile
export async function createDriverProfile(
  userId: string,
  driverData: {
    license_number?: string
    license_expiry?: string
    bio?: string
    years_experience?: number
    languages?: string[]
    bank_account_number?: string
    bank_name?: string
  },
) {
  try {
    const { data, error } = await supabase
      .from("driver_profiles")
      .insert({
        user_id: userId,
        license_number: driverData.license_number,
        license_expiry: driverData.license_expiry,
        is_online: false,
        status: "offline",
        rating: 5.0,
        total_rides: 0,
        total_earnings: 0,
        bio: driverData.bio,
        years_experience: driverData.years_experience || 0,
        languages: driverData.languages,
        bank_account_number: driverData.bank_account_number,
        bank_name: driverData.bank_name,
      })
      .select()
      .single()

    if (error) {
      console.error("Create driver profile error:", error)
      return { driver: null, error: error.message }
    }

    return { driver: data, error: null }
  } catch (error) {
    console.error("Create driver profile exception:", error)
    return {
      driver: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Create passenger profile
export async function createPassengerProfile(
  userId: string,
  passengerData: {
    preferred_payment_method?: "card" | "wallet" | "cash"
  },
) {
  try {
    const { data, error } = await supabase
      .from("passenger_profiles")
      .insert({
        user_id: userId,
        preferred_payment_method: passengerData.preferred_payment_method || "card",
      })
      .select()
      .single()

    if (error) {
      console.error("Create passenger profile error:", error)
      return { passenger: null, error: error.message }
    }

    return { passenger: data, error: null }
  } catch (error) {
    console.error("Create passenger profile exception:", error)
    return {
      passenger: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Create wallet for user
export async function createWallet(userId: string) {
  try {
    const { data, error } = await supabase
      .from("wallets")
      .insert({
        user_id: userId,
        balance: 0,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Create wallet error:", error)
      return { wallet: null, error: error.message }
    }

    return { wallet: data, error: null }
  } catch (error) {
    console.error("Create wallet exception:", error)
    return {
      wallet: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Check if all required tables exist
export async function checkTablesExist() {
  try {
    const tables = [
      "users",
      "driver_profiles",
      "passenger_profiles",
      "vehicles",
      "rides",
      "payments",
      "wallets",
      "wallet_transactions",
      "notifications",
      "ratings",
      "sessions",
      "uploaded_files",
      "health_check",
    ]
    const results = []

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("id").limit(1)
        results.push({ table, exists: !error })
      } catch (err) {
        results.push({ table, exists: false })
      }
    }

    return { success: true, tables: results }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get user with all related data
export async function getUserWithRelations(userId: string) {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select(`
        *,
        driver_profiles (*,
          vehicles (*)
        ),
        passenger_profiles (*),
        wallets (*)
      `)
      .eq("id", userId)
      .single()

    if (error) throw error
    return { success: true, user }
  } catch (error) {
    console.error("Get user with relations error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to get user" }
  }
}

// Get driver with full profile
export async function getDriverWithProfile(userId: string) {
  try {
    const { data: driver, error } = await supabase
      .from("driver_profiles")
      .select(`
        *,
        users (*),
        vehicles (*)
      `)
      .eq("user_id", userId)
      .single()

    if (error) throw error
    return { success: true, driver }
  } catch (error) {
    console.error("Get driver with profile error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to get driver" }
  }
}

// Get ride with all related data
export async function getRideWithDetails(rideId: string) {
  try {
    const { data: ride, error } = await supabase
      .from("rides")
      .select(`
        *,
        passenger:users!rides_passenger_id_fkey (*),
        driver_profile:driver_profiles!rides_driver_profile_id_fkey (*,
          users (*)
        ),
        vehicle:vehicles!rides_vehicle_id_fkey (*),
        payments (*),
        ratings (*)
      `)
      .eq("id", rideId)
      .single()

    if (error) throw error
    return { success: true, ride }
  } catch (error) {
    console.error("Get ride with details error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to get ride" }
  }
}
