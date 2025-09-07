"use server"

import { supabase } from "./database"
import { cookies } from "next/headers"
import { AppError, createErrorResponse, createSuccessResponse } from "./error-handler"
import { checkDatabaseHealth, validateEnvironment } from "./database-health"

// Simple hash function for demo purposes (in production, use bcrypt)
function simpleHash(password: string): string {
  return Buffer.from(password + "salt").toString("base64")
}

function verifyPassword(password: string, hash: string): boolean {
  return Buffer.from(password + "salt").toString("base64") === hash
}

export async function registerUser(userData: {
  email: string
  password: string
  full_name: string
  phone: string
  role: "passenger" | "driver" | "admin"
}) {
  try {
    console.log("🚀 Starting registration process for:", userData.email)

    // Validate environment
    const envCheck = await validateEnvironment()
    if (!envCheck.valid) {
      throw new AppError(envCheck.error!, "ENV_ERROR", 500)
    }

    // Check database health
    const dbHealth = await checkDatabaseHealth()
    if (!dbHealth.healthy) {
      throw new AppError("Database is currently unavailable. Please try again later.", "DB_UNAVAILABLE", 503, dbHealth)
    }

    // Validate input data
    if (!userData.email || !userData.password || !userData.full_name || !userData.phone || !userData.role) {
      throw new AppError("All fields are required", "VALIDATION_ERROR", 400)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      throw new AppError("Please enter a valid email address", "INVALID_EMAIL", 400)
    }

    // Validate password strength
    if (userData.password.length < 6) {
      throw new AppError("Password must be at least 6 characters long", "WEAK_PASSWORD", 400)
    }

    // Validate role
    if (!["passenger", "driver", "admin"].includes(userData.role)) {
      throw new AppError("Invalid account type selected", "INVALID_ROLE", 400)
    }

    // Check if user already exists
    console.log("🔍 Checking if user already exists...")
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", userData.email)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" which is what we want
      console.error("❌ Error checking existing user:", checkError)
      throw new AppError("Unable to verify user information", "DB_ERROR", 500, checkError)
    }

    if (existingUser) {
      throw new AppError("An account with this email already exists", "USER_EXISTS", 409)
    }

    // Hash password
    console.log("🔐 Hashing password...")
    const password_hash = simpleHash(userData.password)

    // Insert user
    console.log("👤 Creating user account...")
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({
        email: userData.email,
        password_hash,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role,
        is_verified: false,
        is_active: true,
      })
      .select()
      .single()

    if (userError) {
      console.error("❌ User creation failed:", userError)
      if (userError.code === "23505") {
        // Unique constraint violation
        throw new AppError("An account with this email already exists", "USER_EXISTS", 409)
      }
      throw new AppError("Failed to create user account", "USER_CREATION_FAILED", 500, userError)
    }

    console.log("✅ User created successfully:", user.id)

    // Create wallet for user
    console.log("💰 Creating user wallet...")
    try {
      const { error: walletError } = await supabase.from("wallets").insert({
        user_id: user.id,
        balance: 0.0,
      })

      if (walletError) {
        console.warn("⚠️ Wallet creation failed (non-critical):", walletError)
      } else {
        console.log("✅ Wallet created successfully")
      }
    } catch (walletErr) {
      console.warn("⚠️ Wallet creation error (non-critical):", walletErr)
    }

    // If driver, create driver profile
    if (userData.role === "driver") {
      console.log("🚗 Creating driver profile...")
      try {
        const { error: driverError } = await supabase.from("driver_profiles").insert({
          user_id: user.id,
          license_number: `DL${Date.now()}`,
          license_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          is_online: false,
          rating: 5.0,
          total_rides: 0,
          total_earnings: 0.0,
        })

        if (driverError) {
          console.warn("⚠️ Driver profile creation failed (non-critical):", driverError)
        } else {
          console.log("✅ Driver profile created successfully")
        }
      } catch (driverErr) {
        console.warn("⚠️ Driver profile creation error (non-critical):", driverErr)
      }
    }

    // Create session token
    console.log("🎫 Creating session token...")
    const token = Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }),
    ).toString("base64")

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    console.log("🎉 Registration completed successfully for:", userData.email)

    return createSuccessResponse(
      {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      "Account created successfully!",
    )
  } catch (error) {
    console.error("💥 Registration failed:", error)
    return createErrorResponse(error, "Registration failed")
  }
}

export async function loginUser(email: string, password: string) {
  try {
    console.log("🔐 Starting login process for:", email)

    // Validate environment
    const envCheck = await validateEnvironment()
    if (!envCheck.valid) {
      throw new AppError(envCheck.error!, "ENV_ERROR", 500)
    }

    // Check database health
    const dbHealth = await checkDatabaseHealth()
    if (!dbHealth.healthy) {
      throw new AppError("Service temporarily unavailable. Please try again later.", "DB_UNAVAILABLE", 503)
    }

    // Validate input
    if (!email || !password) {
      throw new AppError("Email and password are required", "VALIDATION_ERROR", 400)
    }

    // Get user
    console.log("🔍 Looking up user...")
    const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error) {
      console.error("❌ User lookup failed:", error)
      if (error.code === "PGRST116") {
        throw new AppError("Invalid email or password", "INVALID_CREDENTIALS", 401)
      }
      throw new AppError("Login failed", "DB_ERROR", 500, error)
    }

    if (!user.is_active) {
      throw new AppError("Account is deactivated. Please contact support.", "ACCOUNT_DEACTIVATED", 403)
    }

    // Verify password
    console.log("🔐 Verifying password...")
    const isValid = verifyPassword(password, user.password_hash)
    if (!isValid) {
      throw new AppError("Invalid email or password", "INVALID_CREDENTIALS", 401)
    }

    // Create session token
    console.log("🎫 Creating session...")
    const token = Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }),
    ).toString("base64")

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    console.log("✅ Login successful for:", email)

    return createSuccessResponse(
      {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      "Login successful!",
    )
  } catch (error) {
    console.error("💥 Login failed:", error)
    return createErrorResponse(error, "Login failed")
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) return null

    const decoded = JSON.parse(Buffer.from(token, "base64").toString())

    // Check if token is expired
    if (decoded.exp < Date.now()) {
      return null
    }

    const { data: user } = await supabase
      .from("users")
      .select("id, email, full_name, role")
      .eq("id", decoded.userId)
      .single()

    return user
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}
