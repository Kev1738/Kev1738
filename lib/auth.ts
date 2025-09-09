import { supabase } from "./database"
import { AppError } from "./error-handler"
import crypto from "crypto"

export interface LoginResult {
  id: string
  email: string
  full_name: string
  phone?: string
  role: "passenger" | "driver" | "admin"
  is_verified: boolean
  is_active: boolean
  profile_image_url?: string
  created_at: string
  updated_at: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  phone?: string
  role: "passenger" | "driver" | "admin"
}

// Simple MD5 hash function (use bcrypt in production)
function hashPassword(password: string): string {
  return crypto
    .createHash("md5")
    .update(password + "salt")
    .digest("hex")
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  try {
    console.log("🔐 Attempting to login user:", email)

    if (!email || !password) {
      throw new AppError("Email and password are required", "VALIDATION_ERROR", 400)
    }

    // Hash the password to match stored format
    const hashedPassword = hashPassword(password)
    console.log("🔒 Password hashed for comparison")

    // Query user from database
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("password", hashedPassword)
      .limit(1)

    if (error) {
      console.error("❌ Database error during login:", error)
      throw new AppError("Database error during login", "DB_ERROR", 500, error)
    }

    if (!users || users.length === 0) {
      console.error("❌ Invalid credentials for:", email)
      throw new AppError("Invalid email or password", "INVALID_CREDENTIALS", 401)
    }

    const user = users[0]

    // Check if user is active
    if (!user.is_active) {
      console.error("❌ Account is deactivated for:", email)
      throw new AppError("Account is deactivated", "ACCOUNT_INACTIVE", 403)
    }

    console.log("✅ Login successful for user:", user.id)

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as LoginResult
  } catch (error) {
    console.error("💥 Login error:", error)
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError("Login failed", "LOGIN_ERROR", 500, error)
  }
}

export async function registerUser(userData: RegisterData): Promise<LoginResult> {
  try {
    console.log("📝 Attempting to register user:", userData.email)

    const { email, password, full_name, phone, role } = userData

    // Validate input
    if (!email || !password || !full_name || !role) {
      throw new AppError("Email, password, full name, and role are required", "VALIDATION_ERROR", 400)
    }

    if (!["passenger", "driver", "admin"].includes(role)) {
      throw new AppError("Invalid role specified", "VALIDATION_ERROR", 400)
    }

    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters long", "VALIDATION_ERROR", 400)
    }

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .limit(1)

    if (checkError) {
      console.error("❌ Database error checking existing user:", checkError)
      throw new AppError("Database error during registration", "DB_ERROR", 500, checkError)
    }

    if (existingUsers && existingUsers.length > 0) {
      console.error("❌ User already exists:", email)
      throw new AppError("User with this email already exists", "USER_EXISTS", 409)
    }

    // Hash password
    const hashedPassword = hashPassword(password)

    // Create user record
    const newUser = {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      full_name: full_name.trim(),
      phone: phone?.trim() || null,
      role,
      is_verified: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: createdUsers, error: createError } = await supabase.from("users").insert([newUser]).select("*")

    if (createError) {
      console.error("❌ Database error creating user:", createError)
      throw new AppError("Failed to create user account", "DB_ERROR", 500, createError)
    }

    if (!createdUsers || createdUsers.length === 0) {
      throw new AppError("Failed to create user account", "DB_ERROR", 500)
    }

    const user = createdUsers[0]
    console.log("✅ User registration successful:", user.id)

    // Create profile based on role
    if (role === "driver") {
      const { error: profileError } = await supabase.from("driver_profiles").insert([
        {
          user_id: user.id,
          is_online: false,
          status: "offline",
          rating: 5.0,
          total_rides: 0,
          total_earnings: 0.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (profileError) {
        console.warn("⚠️ Failed to create driver profile:", profileError)
      }
    } else if (role === "passenger") {
      const { error: profileError } = await supabase.from("passenger_profiles").insert([
        {
          user_id: user.id,
          preferred_payment_method: "card",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])

      if (profileError) {
        console.warn("⚠️ Failed to create passenger profile:", profileError)
      }
    }

    // Create wallet for user
    const { error: walletError } = await supabase.from("wallets").insert([
      {
        user_id: user.id,
        balance: 0.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    if (walletError) {
      console.warn("⚠️ Failed to create wallet:", walletError)
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as LoginResult
  } catch (error) {
    console.error("💥 Registration error:", error)
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError("Registration failed", "REGISTRATION_ERROR", 500, error)
  }
}

export async function getUserById(userId: string): Promise<LoginResult | null> {
  try {
    const { data: users, error } = await supabase.from("users").select("*").eq("id", userId).limit(1)

    if (error) {
      console.error("❌ Database error fetching user:", error)
      return null
    }

    if (!users || users.length === 0) {
      return null
    }

    const user = users[0]
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as LoginResult
  } catch (error) {
    console.error("💥 Error fetching user:", error)
    return null
  }
}

export async function getCurrentUser(): Promise<LoginResult | null> {
  try {
    // Get user ID from session storage or localStorage
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null

    if (!userId) {
      return null
    }

    // Fetch user data from database
    return await getUserById(userId)
  } catch (error) {
    console.error("💥 Error getting current user:", error)
    return null
  }
}
