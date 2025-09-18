import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/database"
import { createSession } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login API called")

    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(createErrorResponse(null, "Email and password are required"), { status: 400 })
    }

    console.log("Attempting login for:", email)

    // Get user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("is_active", true)
      .single()

    if (error || !user) {
      console.log("❌ User not found:", email, error?.message)
      return NextResponse.json(createErrorResponse(null, "Invalid email or password"), { status: 401 })
    }

    // Verify password (in production, use bcrypt.compare)
    if (user.password !== password) {
      console.log("❌ Invalid password for user:", email)
      return NextResponse.json(createErrorResponse(null, "Invalid email or password"), { status: 401 })
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(createErrorResponse(null, "Account is deactivated"), { status: 403 })
    }

    console.log("✅ User authenticated:", user.email, "Role:", user.role)

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
      return NextResponse.json(createErrorResponse(sessionResult.error, "Login failed"), { status: 500 })
    }

    console.log("✅ Login successful for user:", user.email)

    return NextResponse.json(
      createSuccessResponse(
        {
          user: authUser,
          token: sessionResult.token,
        },
        "Login successful",
      ),
    )
  } catch (error) {
    console.error("💥 Login error:", error)
    return NextResponse.json(createErrorResponse(error, "Login failed"), { status: 500 })
  }
}
