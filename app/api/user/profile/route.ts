import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"
import { supabase } from "@/lib/database"

export async function GET() {
  try {
    console.log("👤 Get user profile API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 Fetching profile for user:", user.id)

    // Use Supabase query instead of raw SQL
    const { data: profileData, error } = await supabase.from("user_profiles").select("*").eq("id", user.id).single()

    if (error) {
      console.error("❌ Profile fetch error:", error)
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 })
    }

    console.log("✅ Profile fetched successfully")

    // Format the response
    const responseData = {
      id: profileData.id,
      email: profileData.email,
      full_name: profileData.full_name,
      phone: profileData.phone,
      role: profileData.role,
      date_of_birth: profileData.date_of_birth,
      gender: profileData.gender,
      address: profileData.address,
      emergency_contact_name: profileData.emergency_contact_name,
      emergency_contact_phone: profileData.emergency_contact_phone,
      profile_image_url: profileData.profile_image_url,
      is_verified: profileData.is_verified,
      is_active: profileData.is_active,
      created_at: profileData.created_at,
      updated_at: profileData.updated_at,
    }

    // Add role-specific data
    if (profileData.role_profile) {
      if (profileData.role === "driver") {
        responseData.driver_profile = profileData.role_profile
      } else if (profileData.role === "passenger") {
        responseData.passenger_profile = profileData.role_profile
      }
    }

    return NextResponse.json(createSuccessResponse(responseData), { status: 200 })
  } catch (error) {
    console.error("💥 Get user profile API error:", error)
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
    console.log("📝 Profile data received:", profileData)

    // Update user table
    const { error: userError } = await supabase
      .from("users")
      .update({
        full_name: profileData.full_name,
        phone: profileData.phone,
        date_of_birth: profileData.date_of_birth,
        gender: profileData.gender,
        address: profileData.address,
        emergency_contact_name: profileData.emergency_contact_name,
        emergency_contact_phone: profileData.emergency_contact_phone,
        profile_image_url: profileData.profile_image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (userError) {
      console.error("❌ User update error:", userError)
      throw userError
    }

    // Update role-specific profile
    if (user.role === "driver" && profileData.driver_profile) {
      const driverProfile = profileData.driver_profile

      // Upsert driver profile
      const { error: driverError } = await supabase.from("driver_profiles").upsert({
        user_id: user.id,
        bio: driverProfile.bio,
        years_experience: driverProfile.years_experience,
        languages: driverProfile.languages,
        vehicle_description: driverProfile.vehicle_description,
        bank_account_number: driverProfile.bank_account_number,
        bank_name: driverProfile.bank_name,
        updated_at: new Date().toISOString(),
      })

      if (driverError) {
        console.error("❌ Driver profile update error:", driverError)
        throw driverError
      }
    } else if (user.role === "passenger" && profileData.passenger_profile) {
      const passengerProfile = profileData.passenger_profile

      // Upsert passenger profile
      const { error: passengerError } = await supabase.from("passenger_profiles").upsert({
        user_id: user.id,
        preferred_payment_method: passengerProfile.preferred_payment_method,
        emergency_contact_name: passengerProfile.emergency_contact_name,
        emergency_contact_phone: passengerProfile.emergency_contact_phone,
        updated_at: new Date().toISOString(),
      })

      if (passengerError) {
        console.error("❌ Passenger profile update error:", passengerError)
        throw passengerError
      }
    }

    // Fetch updated profile
    const { data: updatedProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (fetchError) {
      console.error("❌ Updated profile fetch error:", fetchError)
      throw fetchError
    }

    console.log("✅ Profile updated successfully")

    // Format response
    const responseData = {
      id: updatedProfile.id,
      email: updatedProfile.email,
      full_name: updatedProfile.full_name,
      phone: updatedProfile.phone,
      role: updatedProfile.role,
      date_of_birth: updatedProfile.date_of_birth,
      gender: updatedProfile.gender,
      address: updatedProfile.address,
      emergency_contact_name: updatedProfile.emergency_contact_name,
      emergency_contact_phone: updatedProfile.emergency_contact_phone,
      profile_image_url: updatedProfile.profile_image_url,
      is_verified: updatedProfile.is_verified,
      is_active: updatedProfile.is_active,
      created_at: updatedProfile.created_at,
      updated_at: updatedProfile.updated_at,
    }

    // Add role-specific data
    if (updatedProfile.role_profile) {
      if (updatedProfile.role === "driver") {
        responseData.driver_profile = updatedProfile.role_profile
      } else if (updatedProfile.role === "passenger") {
        responseData.passenger_profile = updatedProfile.role_profile
      }
    }

    return NextResponse.json(createSuccessResponse(responseData, "Profile updated successfully"), { status: 200 })
  } catch (error) {
    console.error("💥 Update user profile API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update profile"), { status: 500 })
  }
}
