import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET() {
  try {
    console.log("👤 Get user profile API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile with role-specific data
    if (user.role === "passenger") {
      // Get passenger profile with related data
      const { data: profile, error } = await supabase
        .from("users")
        .select(`
          id,
          email,
          full_name,
          phone,
          profile_image_url,
          date_of_birth,
          gender,
          address,
          emergency_contact_name,
          emergency_contact_phone,
          is_verified,
          is_active,
          created_at,
          updated_at,
          passenger_profiles (
            id,
            preferred_payment_method
          ),
          wallets (
            id,
            balance,
            is_active
          )
        `)
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("❌ Profile fetch error:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 })
      }

      // Get ride statistics
      const { data: rideStats, error: rideStatsError } = await supabase
        .from("rides")
        .select("id, status, fare_amount, created_at")
        .eq("passenger_id", user.id)

      if (rideStatsError) {
        console.warn("⚠️ Ride stats fetch error:", rideStatsError)
      }

      // Get recent rides (last 10)
      const { data: recentRides, error: recentRidesError } = await supabase
        .from("rides")
        .select(`
          id,
          pickup_address,
          destination_address,
          fare_amount,
          status,
          distance_km,
          actual_duration_minutes,
          created_at,
          completed_at,
          driver_profiles (
            rating,
            users (
              full_name
            )
          ),
          vehicles (
            make,
            model,
            color,
            plate_number
          ),
          ratings!ratings_ride_id_fkey (
            rating,
            comment
          )
        `)
        .eq("passenger_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (recentRidesError) {
        console.warn("⚠️ Recent rides fetch error:", recentRidesError)
      }

      // Get active ride if any
      const { data: activeRide, error: activeRideError } = await supabase
        .from("rides")
        .select(`
          id,
          pickup_address,
          destination_address,
          fare_amount,
          status,
          distance_km,
          estimated_duration_minutes,
          special_instructions,
          created_at,
          driver_profiles (
            rating,
            users (
              full_name,
              phone
            )
          ),
          vehicles (
            make,
            model,
            color,
            plate_number
          )
        `)
        .eq("passenger_id", user.id)
        .in("status", ["accepted", "driver_arrived", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (activeRideError && activeRideError.code !== "PGRST116") {
        console.warn("⚠️ Active ride fetch error:", activeRideError)
      }

      // Calculate statistics
      const completedRides = rideStats?.filter((ride) => ride.status === "completed") || []
      const cancelledRides = rideStats?.filter((ride) => ride.status === "cancelled") || []
      const totalSpent = completedRides.reduce((sum, ride) => sum + ride.fare_amount, 0)
      const avgFare = completedRides.length > 0 ? totalSpent / completedRides.length : 0

      const responseData = {
        // User information
        user_id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        profile_image_url: profile.profile_image_url,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        address: profile.address,
        emergency_contact_name: profile.emergency_contact_name,
        emergency_contact_phone: profile.emergency_contact_phone,
        is_verified: profile.is_verified,
        is_active: profile.is_active,
        created_at: profile.created_at,
        updated_at: profile.updated_at,

        // Passenger profile information
        passenger_profile_id: profile.passenger_profiles?.[0]?.id,
        preferred_payment_method: profile.passenger_profiles?.[0]?.preferred_payment_method,
        wallet_balance: profile.wallets?.[0]?.balance || 0,

        // Ride statistics
        statistics: {
          total_rides: rideStats?.length || 0,
          completed_rides: completedRides.length,
          cancelled_rides: cancelledRides.length,
          total_spent: totalSpent,
          avg_fare: avgFare,
        },

        // Current ride activity
        active_ride: activeRide
          ? {
              id: activeRide.id,
              pickup_address: activeRide.pickup_address,
              destination_address: activeRide.destination_address,
              fare_amount: activeRide.fare_amount,
              status: activeRide.status,
              distance_km: activeRide.distance_km,
              estimated_duration_minutes: activeRide.estimated_duration_minutes,
              special_instructions: activeRide.special_instructions,
              driver_name: activeRide.driver_profiles?.users?.full_name,
              driver_phone: activeRide.driver_profiles?.users?.phone,
              driver_rating: activeRide.driver_profiles?.rating,
              vehicle: {
                make: activeRide.vehicles?.make,
                model: activeRide.vehicles?.model,
                color: activeRide.vehicles?.color,
                plate_number: activeRide.vehicles?.plate_number,
              },
              created_at: activeRide.created_at,
            }
          : null,

        // Recent rides
        recent_rides:
          recentRides?.map((ride) => ({
            id: ride.id,
            pickup_address: ride.pickup_address,
            destination_address: ride.destination_address,
            fare_amount: ride.fare_amount,
            status: ride.status,
            distance_km: ride.distance_km,
            actual_duration_minutes: ride.actual_duration_minutes,
            driver_name: ride.driver_profiles?.users?.full_name,
            driver_rating: ride.driver_profiles?.rating,
            vehicle: {
              make: ride.vehicles?.make,
              model: ride.vehicles?.model,
              color: ride.vehicles?.color,
              plate_number: ride.vehicles?.plate_number,
            },
            my_rating: ride.ratings?.[0]?.rating,
            my_comment: ride.ratings?.[0]?.comment,
            created_at: ride.created_at,
            completed_at: ride.completed_at,
          })) || [],
      }

      return NextResponse.json(createSuccessResponse(responseData, "Profile fetched successfully"))
    } else if (user.role === "driver") {
      // Redirect to driver profile endpoint
      return NextResponse.json(
        {
          error: "Use /api/driver/profile for driver profiles",
        },
        { status: 400 },
      )
    } else {
      // Admin or other roles - basic profile
      const { data: profile, error } = await supabase
        .from("users")
        .select(`
          id,
          email,
          full_name,
          phone,
          profile_image_url,
          role,
          created_at
        `)
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("❌ Profile fetch error:", error)
        return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 })
      }

      return NextResponse.json(createSuccessResponse(profile, "Profile fetched successfully"))
    }
  } catch (error) {
    console.error("💥 User profile fetch error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch user profile"), { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("✏️ Update user profile API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { passenger_profile, ...userProfile } = body

    // Update user profile
    const { data: updatedUser, error: userError } = await supabase
      .from("users")
      .update({
        ...userProfile,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (userError) {
      console.error("❌ User update error:", userError)
      return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 })
    }

    let updatedRoleProfile = null

    // Update passenger-specific profile if provided
    if (passenger_profile && user.role === "passenger") {
      const { data: passengerData, error: passengerError } = await supabase
        .from("passenger_profiles")
        .update({
          ...passenger_profile,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single()

      if (passengerError) {
        console.error("❌ Passenger profile update error:", passengerError)
      } else {
        updatedRoleProfile = { passenger_profile: passengerData }
      }
    }

    const responseData = {
      ...updatedUser,
      ...updatedRoleProfile,
    }

    return NextResponse.json(createSuccessResponse(responseData, "Profile updated successfully"))
  } catch (error) {
    console.error("💥 Update profile error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update profile"), { status: 500 })
  }
}
