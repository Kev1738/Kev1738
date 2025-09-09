import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"
import { query } from "@/lib/database"

export async function PUT() {
  try {
    console.log("✅ Mark all notifications as read API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const updateQuery = `
      UPDATE notifications 
      SET is_read = true, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND is_read = false
      RETURNING COUNT(*) as updated_count
    `

    const result = await query(updateQuery, [user.id])

    return NextResponse.json(
      createSuccessResponse({ updatedCount: result.rowCount }, "All notifications marked as read"),
      { status: 200 },
    )
  } catch (error) {
    console.error("Mark all notifications as read API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to mark all notifications as read"), { status: 500 })
  }
}
