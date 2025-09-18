import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/database"
import { createSession } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Registration API called")

    const body = await request.json()
    const {
      email,
      password,
      full_name,
      phone,
      role,
      date_of_birth,
      gender,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      // Driver specific fields
      license_number,
      license_expiry,
      bio,
      years_experience,
      languages,
      bank_account_number,
      bank_name,
      // Vehicle fields for drivers
      vehicle_type,
      make,
      model,
      year,
      color,
      plate_number,
      insurance_expiry,
      // Passenger specific fields
      preferred_payment_method,
    } = body

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(createErrorResponse(null, "Missing required fields: email, password, full_name, role"), {
        status: 400,
      })
    }

    // Validate role
    if (!["passenger", "driver"].includes(role)) {
      return NextResponse.json(createErrorResponse(null, "Invalid role. Must be 'passenger' or 'driver'"), {
        status: 400,
      })
    }

    // Prevent admin registration through this endpoint
    if (role === "admin") {
      return NextResponse.json(createErrorResponse(null, "Admin accounts cannot be created through registration"), {
        status: 403,
      })
    }

    console.log("Attempting registration for:", email, "Role:", role)

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json(createErrorResponse(null, "User with this email already exists"), { status: 409 })
    }

    // Create user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email: email.toLowerCase().trim(),
        password, // In production, hash this with bcrypt
        full_name,
        phone,
        role,
        date_of_birth,
        gender,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        is_verified: false,
        is_active: true,
      })
      .select()
      .single()

    if (userError || !user) {
      console.error("❌ User creation failed:", userError)
      return NextResponse.json(createErrorResponse(userError, "Failed to create user account"), { status: 500 })
    }

    console.log("✅ User created:", user.id)

    // Create wallet for user
    const { error: walletError } = await supabase.from("wallets").insert({
      user_id: user.id,
      balance: 0.0,
      is_active: true,
    })

    if (walletError) {
      console.error("❌ Wallet creation failed:", walletError)
      // Continue anyway, wallet can be created later
    } else {
      console.log("✅ Wallet created for user:", user.id)
    }

    // Create role-specific profile
    if (role === "driver") {
      // Create driver profile
      const { data: driverProfile, error: driverError } = await supabase
        .from("driver_profiles")
        .insert({
          user_id: user.id,
          license_number,
          license_expiry,
          bio,
          years_experience: years_experience || 0,
          languages: languages ? (Array.isArray(languages) ? languages : [languages]) : ["English"],
          bank_account_number,
          bank_name,
          is_online: false,
          status: "offline",
          rating: 5.0,
          total_rides: 0,
          total_earnings: 0.0,
        })
        .select()
        .single()

      if (driverError) {
        console.error("❌ Driver profile creation failed:", driverError)
        return NextResponse.json(createErrorResponse(driverError, "Failed to create driver profile"), { status: 500 })
      }

      console.log("✅ Driver profile created:", driverProfile.id)

      // Create vehicle if provided
      if (vehicle_type && make && model && year && color && plate_number) {
        const { error: vehicleError } = await supabase.from("vehicles").insert({
          driver_profile_id: driverProfile.id,
          vehicle_type,
          make,
          model,
          year: Number.parseInt(year),
          color,
          plate_number,
          insurance_expiry,
          is_active: true,
        })

        if (vehicleError) {
          console.error("❌ Vehicle creation failed:", vehicleError)
        } else {
          console.log("✅ Vehicle created for driver")
        }
      }
    } else if (role === "passenger") {
      // Create passenger profile
      const { error: passengerError } = await supabase.from("passenger_profiles").insert({
        user_id: user.id,
        preferred_payment_method: preferred_payment_method || "card",
      })

      if (passengerError) {
        console.error("❌ Passenger profile creation failed:", passengerError)
        return NextResponse.json(createErrorResponse(passengerError, "Failed to create passenger profile"), {
          status: 500,
        })
      }

      console.log("✅ Passenger profile created for user:", user.id)
    }

    // Create session
    const authUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role as "passenger" | "driver" | "admin",
      phone: user.phone,
      profile_image_url: user.profile_image_url,
      is_verified: user.is_verified,
    }

    const sessionResult = await createSession(authUser)
    if (!sessionResult.success) {
      console.error("❌ Session creation failed:", sessionResult.error)
      return NextResponse.json(createErrorResponse(sessionResult.error, "Registration successful but login failed"), {
        status: 500,
      })
    }

    console.log("✅ Registration completed successfully")

    return NextResponse.json(
      createSuccessResponse(
        {
          user: authUser,
          token: sessionResult.token,
        },
        "Registration successful",
      ),
    )
  } catch (error) {
    console.error("💥 Registration error:", error)
    return NextResponse.json(createErrorResponse(error, "Registration failed"), { status: 500 })
  }
}
