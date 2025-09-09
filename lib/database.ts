import { createClient } from "@supabase/supabase-js"

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types matching your existing schema
export interface User {
  id: string
  email: string
  password: string
  full_name: string
  phone?: string
  role: "passenger" | "driver" | "admin"
  is_verified: boolean
  is_active: boolean
  profile_image_url?: string
  date_of_birth?: string
  gender?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
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
  bio?: string
  years_experience?: number
  languages?: string[]
  vehicle_description?: string
  bank_account_number?: string
  bank_name?: string
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

export interface Vehicle {
  id: string
  driver_id?: string
  vehicle_type: "car" | "keke" | "bike"
  make: string
  model: string
  year: number
  color: string
  plate_number: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Ride {
  id: string
  passenger_id: string
  driver_id?: string
  vehicle_id?: string
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
  fare_amount: number
  status: "pending" | "accepted" | "driver_arrived" | "in_progress" | "completed" | "cancelled"
  scheduled_time?: string
  accepted_at?: string
  started_at?: string
  completed_at?: string
  cancelled_at?: string
  cancellation_reason?: string
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  ride_id?: string
  passenger_id?: string
  amount: number
  payment_method: "card" | "wallet" | "cash"
  payment_status: "pending" | "completed" | "failed" | "refunded"
  transaction_id?: string
  processed_at?: string
  created_at: string
}

export interface Wallet {
  id: string
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

export interface WalletTransaction {
  id: string
  wallet_id?: string
  amount: number
  transaction_type: "credit" | "debit"
  description: string
  reference_id?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  data?: any
  read: boolean
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

export interface Rating {
  id: string
  ride_id?: string
  rater_id?: string
  rated_id?: string
  rating: number
  comment?: string
  created_at: string
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    console.log("🔍 Testing database connection...")

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing Supabase environment variables")
      return false
    }

    const { data, error } = await supabase.from("users").select("count(*)").limit(1)

    if (error) {
      console.error("❌ Database connection test failed:", error)
      return false
    }

    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("💥 Database connection test exception:", error)
    return false
  }
}

// Helper function to check if environment variables are configured
export function checkEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
  const missing = required.filter((key) => !process.env[key])

  return {
    valid: missing.length === 0,
    missing,
  }
}
