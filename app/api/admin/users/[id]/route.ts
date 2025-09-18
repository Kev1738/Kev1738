import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("👤 Admin get user API called for:", params.id)

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error } = await supabase
      .from("users")
      .select(`
        *,
        driver_profiles (*)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("❌ User fetch error:", error)
      return NextResponse.json(createErrorResponse(error, "User not found"), { status: 404 })
    }

    return NextResponse.json(createSuccessResponse(userData))
  } catch (error) {
    console.error("💥 Admin get user error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch user"), { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("✏️ Admin update user API called for:", params.id)

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const updateData = await request.json()
    const { driver_profile, ...userData } = updateData

    // Update user
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("❌ User update error:", error)
      return NextResponse.json(createErrorResponse(error, "Failed to update user"), { status: 500 })
    }

    // Update driver profile if provided
    if (driver_profile && updatedUser.role === "driver") {
      const { error: driverError } = await supabase
        .from("driver_profiles")
        .update({
          ...driver_profile,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", params.id)

      if (driverError) {
        console.error("❌ Driver profile update error:", driverError)
      }
    }

    return NextResponse.json(createSuccessResponse(updatedUser, "User updated successfully"))
  } catch (error) {
    console.error("💥 Admin update user error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update user"), { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("🗑️ Admin delete user API called for:", params.id)

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // Soft delete by deactivating the user
    const { data: deletedUser, error } = await supabase
      .from("users")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("❌ User delete error:", error)
      return NextResponse.json(createErrorResponse(error, "Failed to delete user"), { status: 500 })
    }

    return NextResponse.json(createSuccessResponse(deletedUser, "User deleted successfully"))
  } catch (error) {
    console.error("💥 Admin delete user error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to delete user"), { status: 500 })
  }
}
