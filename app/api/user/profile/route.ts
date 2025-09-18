import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET() {
  try {
    console.log("👤 Get user profile API called")

    const user = await getCurrentUser()
    if (!user) {
      console.log("❌ No authenticated user found")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("✅ Authenticated user:", user.email, "Role:", user.role)

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

      // Calculate statistics
      const completedRides = rideStats?.filter((ride) => ride.status === "completed") || []
      const cancelledRides = rideStats?.filter((ride) => ride.status === "cancelled") || []
      const totalSpent = completedRides.reduce((sum, ride) => sum + ride.fare_amount, 0)
      const avgFare = completedRides.length > 0 ? totalSpent / completedRides.length : 0

      const responseData = {
        // User information
        id: profile.id,
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
        role: user.role,

        // Passenger profile information
        passenger_profile_id: profile.passenger_profiles?.[0]?.id,
        preferred_payment_method: profile.passenger_profiles?.[0]?.preferred_payment_method || "card",
        wallet_balance: profile.wallets?.[0]?.balance || 0,

        // Ride statistics
        total_rides: rideStats?.length || 0,
        completed_rides: completedRides.length,
        cancelled_rides: cancelledRides.length,
        total_spent: totalSpent,
        avg_fare: avgFare,
        rating: 4.8, // Default rating for now
      }

      console.log("✅ Profile data prepared successfully")
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
    console.log("📝 Update data:", body)

    // Update user profile
    const { data: updatedUser, error: userError } = await supabase
      .from("users")
      .update({
        full_name: body.full_name,
        phone: body.phone,
        profile_image_url: body.profile_image_url,
        address: body.home_address,
        emergency_contact_name: body.emergency_contact,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (userError) {
      console.error("❌ User update error:", userError)
      return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 })
    }

    // Update passenger-specific profile if provided
    if (user.role === "passenger" && body.preferred_payment_method) {
      const { error: passengerError } = await supabase.from("passenger_profiles").upsert({
        user_id: user.id,
        preferred_payment_method: body.preferred_payment_method,
        updated_at: new Date().toISOString(),
      })

      if (passengerError) {
        console.error("❌ Passenger profile update error:", passengerError)
      }
    }

    const responseData = {
      ...updatedUser,
      role: user.role,
      preferred_payment_method: body.preferred_payment_method,
    }

    return NextResponse.json(createSuccessResponse(responseData, "Profile updated successfully"))
  } catch (error) {
    console.error("💥 Update profile error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update profile"), { status: 500 })
  }
}
