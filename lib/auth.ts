import { cookies } from "next/headers"
import { supabase } from "./database"

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: "passenger" | "driver" | "admin"
  phone?: string
  profile_image_url?: string
  is_verified: boolean
}

export async function createSession(user: AuthUser) {
  try {
    // Generate a simple session token
    const token = `session_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    // Store session in database
    const { error } = await supabase.from("sessions").insert({
      user_id: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      console.error("Session creation error:", error)
      return { success: false, error: error.message }
    }

    // Set HTTP-only cookie
    const cookieStore = cookies()
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return { success: true, token }
  } catch (error) {
    console.error("Create session error:", error)
    return { success: false, error: "Failed to create session" }
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return null
    }

    // Check if session exists and is valid
    const { data: session, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !session) {
      return null
    }

    // Get current user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user_id)
      .eq("is_active", true)
      .single()

    if (userError || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
      profile_image_url: user.profile_image_url,
      is_verified: user.is_verified,
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function destroySession() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (token) {
      // Remove session from database
      await supabase.from("sessions").delete().eq("token", token)
    }

    // Clear cookie
    cookieStore.delete("auth_token")

    return { success: true }
  } catch (error) {
    console.error("Destroy session error:", error)
    return { success: false, error: "Failed to destroy session" }
  }
}
