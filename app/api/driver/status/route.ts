import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"
import { supabase } from "@/lib/database"

export async function GET() {
  try {
    console.log("📊 Get driver status API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "driver") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { data: driverProfile, error } = await supabase
      .from("driver_profiles")
      .select("status, is_online, current_latitude, current_longitude")
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("❌ Driver status fetch error:", error)
      return NextResponse.json({ success: false, error: "Driver profile not found" }, { status: 404 })
    }

    return NextResponse.json(createSuccessResponse(driverProfile), { status: 200 })
  } catch (error) {
    console.error("💥 Get driver status API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch driver status"), { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("🔄 Update driver status API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "driver") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { status, latitude, longitude } = await request.json()
    console.log("📝 Status update data:", { status, latitude, longitude })

    const updateData: any = {
      status: status,
      is_online: status === "online",
      updated_at: new Date().toISOString(),
    }

    if (latitude !== undefined) {
      updateData.current_latitude = latitude
    }
    if (longitude !== undefined) {
      updateData.current_longitude = longitude
    }

    const { data: updatedProfile, error } = await supabase
      .from("driver_profiles")
      .update(updateData)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("❌ Driver status update error:", error)
      return NextResponse.json({ success: false, error: "Failed to update driver status" }, { status: 500 })
    }

    console.log("✅ Driver status updated successfully")
    return NextResponse.json(createSuccessResponse(updatedProfile), { status: 200 })
  } catch (error) {
    console.error("💥 Update driver status API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to update driver status"), { status: 500 })
  }
}
