import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET() {
  try {
    console.log("👤 Get driver profile API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "driver") {
      return NextResponse.json(createErrorResponse(null, "Unauthorized"), { status: 401 })
    }

    console.log("Getting profile for driver:", user.id)

    // Get complete driver profile with all related data
    const { data: driverProfile, error } = await supabase
      .from("driver_profiles")
      .select(`
        *,
        users!driver_profiles_user_id_fkey (
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
          created_at
        ),
        vehicles (
          id,
          vehicle_type,
          make,
          model,
          year,
          color,
          plate_number,
          is_active,
          insurance_expiry,
          last_maintenance
        )
      `)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("❌ Driver profile fetch error:", error)
      return NextResponse.json(createErrorResponse(error, "Driver profile not found"), { status: 404 })
    }

    // Get driver's wallet information
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id, balance, is_active")
      .eq("user_id", user.id)
      .single()

    if (walletError) {
      console.warn("⚠️ Wallet fetch error:", walletError)
    }

    // Get today's rides and earnings
    const today = new Date().toISOString().split("T")[0]
    const { data: todayRides, error: todayRidesError } = await supabase
      .from("rides")
      .select("id, fare_amount, status, actual_duration_minutes, created_at")
      .eq("driver_profile_id", driverProfile.id)
      .gte("created_at", `${today}T00:00:00.000Z`)
      .lt("created_at", `${today}T23:59:59.999Z`)

    if (todayRidesError) {
      console.warn("⚠️ Today rides fetch error:", todayRidesError)
    }

    // Get this week's rides and earnings
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const { data: weekRides, error: weekRidesError } = await supabase
      .from("rides")
      .select("id, fare_amount, status, created_at")
      .eq("driver_profile_id", driverProfile.id)
      .gte("created_at", weekStart.toISOString())

    if (weekRidesError) {
      console.warn("⚠️ Week rides fetch error:", weekRidesError)
    }

    // Get active ride
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
        users!rides_passenger_id_fkey (
          full_name,
          phone
        )
      `)
      .eq("driver_profile_id", driverProfile.id)
      .in("status", ["accepted", "driver_arrived", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (activeRideError && activeRideError.code !== "PGRST116") {
      console.warn("⚠️ Active ride fetch error:", activeRideError)
    }

    // Get available rides (pending rides)
    const { data: availableRides, error: availableRidesError } = await supabase
      .from("rides")
      .select(`
        id,
        pickup_address,
        destination_address,
        fare_amount,
        distance_km,
        estimated_duration_minutes,
        vehicle_type,
        created_at,
        users!rides_passenger_id_fkey (
          full_name
        )
      `)
      .eq("status", "pending")
      .is("driver_profile_id", null)
      .order("created_at", { ascending: true })
      .limit(5)

    if (availableRidesError) {
      console.warn("⚠️ Available rides fetch error:", availableRidesError)
    }

    // Get recent rides
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
        users!rides_passenger_id_fkey (
          full_name
        ),
        ratings!ratings_ride_id_fkey (
          rating,
          comment
        )
      `)
      .eq("driver_profile_id", driverProfile.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (recentRidesError) {
      console.warn("⚠️ Recent rides fetch error:", recentRidesError)
    }

    // Calculate statistics
    const completedTodayRides = todayRides?.filter((ride) => ride.status === "completed") || []
    const completedWeekRides = weekRides?.filter((ride) => ride.status === "completed") || []

    const todayEarnings = completedTodayRides.reduce((sum, ride) => sum + ride.fare_amount * 0.85, 0) // 85% driver share
    const weekEarnings = completedWeekRides.reduce((sum, ride) => sum + ride.fare_amount * 0.85, 0)

    const avgDuration =
      completedTodayRides.length > 0
        ? completedTodayRides.reduce((sum, ride) => sum + (ride.actual_duration_minutes || 0), 0) /
          completedTodayRides.length
        : 0

    const profileData = {
      // User information
      user_id: driverProfile.users.id,
      email: driverProfile.users.email,
      full_name: driverProfile.users.full_name,
      phone: driverProfile.users.phone,
      profile_image_url: driverProfile.users.profile_image_url,
      date_of_birth: driverProfile.users.date_of_birth,
      gender: driverProfile.users.gender,
      address: driverProfile.users.address,
      emergency_contact_name: driverProfile.users.emergency_contact_name,
      emergency_contact_phone: driverProfile.users.emergency_contact_phone,
      is_verified: driverProfile.users.is_verified,

      // Driver profile information
      driver_profile_id: driverProfile.id,
      license_number: driverProfile.license_number,
      license_expiry: driverProfile.license_expiry,
      is_online: driverProfile.is_online,
      status: driverProfile.status,
      current_location_lat: driverProfile.current_location_lat,
      current_location_lng: driverProfile.current_location_lng,
      rating: driverProfile.rating,
      total_rides: driverProfile.total_rides,
      total_earnings: driverProfile.total_earnings,
      bio: driverProfile.bio,
      years_experience: driverProfile.years_experience,
      languages: driverProfile.languages,
      bank_account_number: driverProfile.bank_account_number,
      bank_name: driverProfile.bank_name,

      // Wallet
      wallet_balance: wallet?.balance || 0,

      // Vehicles
      vehicles: driverProfile.vehicles || [],

      // Statistics
      statistics: {
        today: {
          rides: completedTodayRides.length,
          earnings: todayEarnings,
          avg_duration: avgDuration,
        },
        week: {
          rides: completedWeekRides.length,
          earnings: weekEarnings,
        },
      },

      // Active ride
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
            passenger_name: activeRide.users?.full_name,
            passenger_phone: activeRide.users?.phone,
            created_at: activeRide.created_at,
          }
        : null,

      // Available rides
      available_rides:
        availableRides?.map((ride) => ({
          id: ride.id,
          pickup_address: ride.pickup_address,
          destination_address: ride.destination_address,
          fare_amount: ride.fare_amount,
          distance_km: ride.distance_km,
          estimated_duration_minutes: ride.estimated_duration_minutes,
          vehicle_type: ride.vehicle_type,
          passenger_name: ride.users?.full_name,
          created_at: ride.created_at,
        })) || [],

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
          passenger_name: ride.users?.full_name,
          passenger_rating: ride.ratings?.[0]?.rating,
          passenger_comment: ride.ratings?.[0]?.comment,
          created_at: ride.created_at,
          completed_at: ride.completed_at,
        })) || [],
    }

    console.log("✅ Driver profile fetched successfully")
    return NextResponse.json(createSuccessResponse(profileData, "Driver profile fetched successfully"))
  } catch (error) {
    console.error("💥 Get driver profile error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch driver profile"), { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("✏️ Update driver profile API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "driver") {
      return NextResponse.json(createErrorResponse(null, "Unauthorized"), { status: 401 })
    }

    const profileData = await request.json()
    const { user: userData, vehicles, ...driverData } = profileData

    // Start a transaction-like operation
    const updates = []

    // Update user data if provided
    if (userData) {
      const { data: updatedUser, error: userError } = await supabase
        .from("users")
        .update({
          full_name: userData.full_name,
          phone: userData.phone,
          profile_image_url: userData.profile_image_url,
          date_of_birth: userData.date_of_birth,
          gender: userData.gender,
          address: userData.address,
          emergency_contact_name: userData.emergency_contact_name,
          emergency_contact_phone: userData.emergency_contact_phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single()

      if (userError) {
        console.error("❌ User update error:", userError)
        return NextResponse.json(createErrorResponse(userError, "Failed to update user profile"), { status: 500 })
      }
      updates.push({ type: "user", data: updatedUser })
    }

    // Update driver profile data
    const { data: updatedDriverProfile, error: driverError } = await supabase
      .from("driver_profiles")
      .update({
        license_number: driverData.license_number,
        license_expiry: driverData.license_expiry,
        bio: driverData.bio,
        years_experience: driverData.years_experience,
        languages: driverData.languages,
        bank_account_number: driverData.bank_account_number,
        bank_name: driverData.bank_name,
        is_online: driverData.is_online,
        status: driverData.is_online ? "online" : "offline",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single()

    if (driverError) {
      console.error("❌ Driver profile update error:", driverError)
      return NextResponse.json(createErrorResponse(driverError, "Failed to update driver profile"), { status: 500 })
    }
    updates.push({ type: "driver_profile", data: updatedDriverProfile })

    // Update or create vehicle if provided
    if (vehicles && vehicles.length > 0) {
      const vehicle = vehicles[0] // Handle first vehicle for now

      // Check if vehicle exists
      const { data: existingVehicle } = await supabase
        .from("vehicles")
        .select("id")
        .eq("driver_profile_id", updatedDriverProfile.id)
        .single()

      if (existingVehicle) {
        // Update existing vehicle
        const { data: updatedVehicle, error: vehicleError } = await supabase
          .from("vehicles")
          .update({
            vehicle_type: vehicle.vehicle_type,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            plate_number: vehicle.plate_number,
            insurance_expiry: vehicle.insurance_expiry,
            last_maintenance: vehicle.last_maintenance,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingVehicle.id)
          .select()
          .single()

        if (vehicleError) {
          console.warn("⚠️ Vehicle update error:", vehicleError)
        } else {
          updates.push({ type: "vehicle", data: updatedVehicle })
        }
      } else {
        // Create new vehicle
        const { data: newVehicle, error: vehicleError } = await supabase
          .from("vehicles")
          .insert({
            driver_profile_id: updatedDriverProfile.id,
            vehicle_type: vehicle.vehicle_type,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            plate_number: vehicle.plate_number,
            insurance_expiry: vehicle.insurance_expiry,
            last_maintenance: vehicle.last_maintenance,
          })
          .select()
          .single()

        if (vehicleError) {
          console.warn("⚠️ Vehicle creation error:", vehicleError)
        } else {
          updates.push({ type: "vehicle", data: newVehicle })
        }
      }
    }

    return NextResponse.json(createSuccessResponse(updates, "Profile updated successfully"))
  } catch (error) {
    console.error("💥 Update driver profile error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update driver profile"), { status: 500 })
  }
}
