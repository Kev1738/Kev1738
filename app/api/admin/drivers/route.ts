import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    console.log("🚗 Admin get drivers API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json(createErrorResponse(new Error("Unauthorized"), "Access denied"), { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const vehicle_type = searchParams.get("vehicle_type") || ""

    const offset = (page - 1) * limit

    // Build query for driver profiles with all related data
    let query = supabase.from("driver_profiles").select(
      `
        id,
        user_id,
        license_number,
        license_expiry,
        is_online,
        status,
        current_location_lat,
        current_location_lng,
        rating,
        total_rides,
        total_earnings,
        bio,
        years_experience,
        languages,
        bank_account_number,
        bank_name,
        created_at,
        updated_at,
        users!driver_profiles_user_id_fkey (
          id,
          email,
          full_name,
          phone,
          is_verified,
          is_active,
          profile_image_url,
          date_of_birth,
          gender,
          address,
          emergency_contact_name,
          emergency_contact_phone,
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
      `,
      { count: "exact" },
    )

    // Apply filters
    if (search) {
      // Note: We need to handle the OR filter differently for related tables
      query = query.or(
        `license_number.ilike.%${search}%,users.full_name.ilike.%${search}%,users.email.ilike.%${search}%`,
      )
    }

    if (status === "online") {
      query = query.eq("is_online", true)
    } else if (status === "offline") {
      query = query.eq("is_online", false)
    }

    // Apply pagination and ordering
    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    const { data: drivers, error, count } = await query

    if (error) {
      console.error("❌ Drivers fetch error:", error)
      return NextResponse.json(createErrorResponse(error, "Failed to fetch drivers"), { status: 500 })
    }

    // Transform data to include computed fields and ensure proper structure
    const transformedDrivers = Array.isArray(drivers)
      ? drivers.map((driver) => ({
          id: driver?.id || "",
          user_id: driver?.user_id || "",
          license_number: driver?.license_number || "",
          license_expiry: driver?.license_expiry || null,
          is_online: driver?.is_online || false,
          status: driver?.status || "offline",
          current_location_lat: driver?.current_location_lat || null,
          current_location_lng: driver?.current_location_lng || null,
          rating: driver?.rating || 0,
          total_rides: driver?.total_rides || 0,
          total_earnings: driver?.total_earnings || 0,
          bio: driver?.bio || null,
          years_experience: driver?.years_experience || 0,
          languages: driver?.languages || [],
          bank_account_number: driver?.bank_account_number || null,
          bank_name: driver?.bank_name || null,
          created_at: driver?.created_at || "",
          updated_at: driver?.updated_at || "",
          vehicle_type:
            Array.isArray(driver?.vehicles) && driver.vehicles.length > 0 ? driver.vehicles[0].vehicle_type : "car",
          users: {
            id: driver?.users?.id || "",
            email: driver?.users?.email || "",
            full_name: driver?.users?.full_name || "",
            phone: driver?.users?.phone || null,
            is_verified: driver?.users?.is_verified || false,
            is_active: driver?.users?.is_active || false,
            profile_image_url: driver?.users?.profile_image_url || null,
            date_of_birth: driver?.users?.date_of_birth || null,
            gender: driver?.users?.gender || null,
            address: driver?.users?.address || null,
            emergency_contact_name: driver?.users?.emergency_contact_name || null,
            emergency_contact_phone: driver?.users?.emergency_contact_phone || null,
            created_at: driver?.users?.created_at || "",
            status: driver?.users?.is_active ? "active" : "inactive",
          },
          vehicles: Array.isArray(driver?.vehicles)
            ? driver.vehicles.map((vehicle) => ({
                id: vehicle?.id || "",
                vehicle_type: vehicle?.vehicle_type || "car",
                make: vehicle?.make || "",
                model: vehicle?.model || "",
                year: vehicle?.year || new Date().getFullYear(),
                color: vehicle?.color || "",
                plate_number: vehicle?.plate_number || "",
                is_active: vehicle?.is_active || false,
                insurance_expiry: vehicle?.insurance_expiry || null,
                last_maintenance: vehicle?.last_maintenance || null,
              }))
            : [],
        }))
      : []

    // Apply vehicle type filter after transformation
    const filteredDrivers = vehicle_type
      ? transformedDrivers.filter((driver) => driver.vehicle_type === vehicle_type)
      : transformedDrivers

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json(
      createSuccessResponse(
        {
          drivers: filteredDrivers,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
        "Drivers fetched successfully",
      ),
    )
  } catch (error) {
    console.error("💥 Admin get drivers error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch drivers"), { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("✏️ Admin update driver API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json(createErrorResponse(new Error("Unauthorized"), "Access denied"), { status: 403 })
    }

    const updateData = await request.json()
    const { id, action, user_id, ...driverData } = updateData

    if (!id || !action) {
      return NextResponse.json(
        createErrorResponse(new Error("Missing required fields"), "Driver ID and action are required"),
        { status: 400 },
      )
    }

    let result = null
    let message = ""

    switch (action) {
      case "toggle_status":
        // Toggle online/offline status
        const { data: updatedDriver, error: statusError } = await supabase
          .from("driver_profiles")
          .update({
            is_online: driverData.is_online,
            status: driverData.is_online ? "online" : "offline",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single()

        if (statusError) {
          console.error("❌ Driver status update error:", statusError)
          return NextResponse.json(createErrorResponse(statusError, "Failed to update driver status"), { status: 500 })
        }

        result = updatedDriver
        message = `Driver status updated to ${driverData.is_online ? "online" : "offline"}`
        break

      case "approve":
        // Approve driver (activate user account)
        if (!user_id) {
          return NextResponse.json(
            createErrorResponse(new Error("Missing user ID"), "User ID is required for approval"),
            { status: 400 },
          )
        }

        const { data: approvedUser, error: approveError } = await supabase
          .from("users")
          .update({
            is_active: true,
            is_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user_id)
          .select()
          .single()

        if (approveError) {
          console.error("❌ Driver approval error:", approveError)
          return NextResponse.json(createErrorResponse(approveError, "Failed to approve driver"), { status: 500 })
        }

        result = approvedUser
        message = "Driver approved successfully"
        break

      case "suspend":
        // Suspend driver (deactivate user account)
        if (!user_id) {
          return NextResponse.json(
            createErrorResponse(new Error("Missing user ID"), "User ID is required for suspension"),
            { status: 400 },
          )
        }

        const { data: suspendedUser, error: suspendError } = await supabase
          .from("users")
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user_id)
          .select()
          .single()

        if (suspendError) {
          console.error("❌ Driver suspension error:", suspendError)
          return NextResponse.json(createErrorResponse(suspendError, "Failed to suspend driver"), { status: 500 })
        }

        // Also set driver offline
        await supabase
          .from("driver_profiles")
          .update({
            is_online: false,
            status: "offline",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)

        result = suspendedUser
        message = "Driver suspended successfully"
        break

      case "update_profile":
        // Update driver profile information
        const { data: updatedProfile, error: updateError } = await supabase
          .from("driver_profiles")
          .update({
            ...driverData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single()

        if (updateError) {
          console.error("❌ Driver profile update error:", updateError)
          return NextResponse.json(createErrorResponse(updateError, "Failed to update driver profile"), { status: 500 })
        }

        result = updatedProfile
        message = "Driver profile updated successfully"
        break

      default:
        return NextResponse.json(createErrorResponse(new Error("Invalid action"), "Invalid action"), { status: 400 })
    }

    return NextResponse.json(createSuccessResponse(result, message))
  } catch (error) {
    console.error("💥 Admin update driver error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update driver"), { status: 500 })
  }
}
