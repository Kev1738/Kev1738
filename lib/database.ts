import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: "passenger" | "driver" | "admin"
  profile_image_url?: string
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DriverProfile {
  id: string
  user_id: string
  license_number: string
  license_expiry: string
  is_online: boolean
  current_latitude?: number
  current_longitude?: number
  rating: number
  total_rides: number
  total_earnings: number
  bank_account_number?: string
  bank_name?: string
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  driver_id: string
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
  pickup_latitude: number
  pickup_longitude: number
  destination_address: string
  destination_latitude: number
  destination_longitude: number
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
  ride_id: string
  passenger_id: string
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
