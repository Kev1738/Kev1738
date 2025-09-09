import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"
import { query } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("✅ Mark notification as read API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const notificationId = params.id

    if (!notificationId) {
      return NextResponse.json({ success: false, error: "Notification ID is required" }, { status: 400 })
    }

    const updateQuery = `
      UPDATE notifications 
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `

    const result = await query(updateQuery, [notificationId, user.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json(createSuccessResponse(result.rows[0], "Notification marked as read"), { status: 200 })
  } catch (error) {
    console.error("Mark notification as read API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to mark notification as read"), { status: 500 })
  }
}
