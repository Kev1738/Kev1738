import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, supabase } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const userResult = await getCurrentUser()
    if (!userResult.success) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const user = userResult.user
    if (user.role !== "driver") {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 })
    }

    // Get driver profile
    const { data: profile, error } = await supabase.from("driver_profiles").select("*").eq("user_id", user.id).single()

    if (error) {
      console.error("Driver profile fetch error:", error)

      // If profile doesn't exist, create one
      if (error.code === "PGRST116") {
        const { data: newProfile, error: createError } = await supabase
          .from("driver_profiles")
          .insert([
            {
              user_id: user.id,
              status: "offline",
              rating: 5.0,
              total_rides: 0,
              total_earnings: 0.0,
            },
          ])
          .select()
          .single()

        if (createError) {
          console.error("Driver profile creation error:", createError)
          return NextResponse.json({ success: false, message: "Failed to create driver profile" }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          profile: newProfile,
        })
      }

      return NextResponse.json({ success: false, message: "Failed to fetch driver profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error("Driver profile API error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify user is authenticated
    const userResult = await getCurrentUser()
    if (!userResult.success) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const user = userResult.user
    if (user.role !== "driver") {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { license_number, license_expiry, vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_plate } =
      body

    // Update driver profile
    const { data: profile, error } = await supabase
      .from("driver_profiles")
      .update({
        license_number,
        license_expiry,
        vehicle_make,
        vehicle_model,
        vehicle_year,
        vehicle_color,
        vehicle_plate,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Driver profile update error:", error)
      return NextResponse.json({ success: false, message: "Failed to update driver profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error("Driver profile update API error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
