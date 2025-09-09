import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("🔔 Get notifications API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unread_only") === "true"
    const offset = (page - 1) * limit

    let whereClause = "WHERE user_id = $1"
    const queryParams = [user.id]

    if (unreadOnly) {
      whereClause += " AND is_read = false"
    }

    // Get notifications
    const notificationsQuery = `
      SELECT 
        id,
        user_id,
        type,
        title,
        message,
        data,
        is_read,
        created_at,
        updated_at
      FROM notifications 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `

    queryParams.push(limit.toString(), offset.toString())

    const result = await query(notificationsQuery, queryParams)

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM notifications 
      ${whereClause}
    `

    const countResult = await query(countQuery, [user.id])
    const total = Number.parseInt(countResult.rows[0].total)

    // Get unread count
    const unreadCountQuery = `
      SELECT COUNT(*) as unread_count
      FROM notifications 
      WHERE user_id = $1 AND is_read = false
    `

    const unreadResult = await query(unreadCountQuery, [user.id])
    const unreadCount = Number.parseInt(unreadResult.rows[0].unread_count)

    return NextResponse.json(
      createSuccessResponse({
        notifications: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      }),
      { status: 200 },
    )
  } catch (error) {
    console.error("Get notifications API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch notifications"), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("📨 Create notification API called")

    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { userId, type, title, message, data } = await request.json()

    if (!userId || !type || !title || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const insertQuery = `
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `

    const result = await query(insertQuery, [userId, type, title, message, JSON.stringify(data || {})])

    return NextResponse.json(createSuccessResponse(result.rows[0], "Notification created successfully"), {
      status: 201,
    })
  } catch (error) {
    console.error("Create notification API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to create notification"), { status: 500 })
  }
}
