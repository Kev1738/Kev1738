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

    // Get user profile with driver profile if applicable
    const query = supabase
      .from("users")
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        profile_image_url,
        date_of_birth,
        gender,
        address,
        emergency_contact_name,
        emergency_contact_phone,
        is_verified,
        created_at
      `)
      .eq("id", user.id)
      .single()

    const { data: profile, error } = await query

    if (error) {
      console.error("❌ Profile fetch error:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 })
    }

    // If user is a driver, get driver profile too
    let driverProfile = null
    if (profile.role === "driver") {
      const { data: driverData, error: driverError } = await supabase
        .from("driver_profiles")
        .select(`
          license_number,
          license_expiry,
          bio,
          years_experience,
          languages,
          vehicle_description,
          rating,
          total_rides,
          total_earnings,
          bank_account_number,
          bank_name
        `)
        .eq("user_id", user.id)
        .single()

      if (!driverError) {
        driverProfile = driverData
      }
    }

    const responseData = {
      ...profile,
      driver_profile: driverProfile,
    }

    return NextResponse.json(createSuccessResponse(responseData, "Profile fetched successfully"))
  } catch (error) {
    console.error("💥 Get profile error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch profile"), { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("✏️ Update user profile API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const profileData = await request.json()
    const { driver_profile, ...userProfile } = profileData

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

    // Update driver profile if provided and user is a driver
    let updatedDriverProfile = null
    if (driver_profile && user.role === "driver") {
      const { data: driverData, error: driverError } = await supabase
        .from("driver_profiles")
        .update({
          ...driver_profile,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single()

      if (driverError) {
        console.error("❌ Driver profile update error:", driverError)
        // Don't fail the whole operation, just log the error
      } else {
        updatedDriverProfile = driverData
      }
    }

    const responseData = {
      ...updatedUser,
      driver_profile: updatedDriverProfile,
    }

    return NextResponse.json(createSuccessResponse(responseData, "Profile updated successfully"))
  } catch (error) {
    console.error("💥 Update profile error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update profile"), { status: 500 })
  }
}
