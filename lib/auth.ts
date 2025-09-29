import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { getUserByEmail, createUser } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  role: "passenger" | "driver" | "admin"
  created_at: string
  updated_at: string
}

export interface AuthResult {
  success: boolean
  user?: User
  token?: string
  error?: string
}

export async function hashPassword(password: string): Promise<string> {
  try {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  } catch (error) {
    console.error("Password hashing error:", error)
    throw new Error("Failed to hash password")
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

export function generateToken(user: User): string {
  try {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
        issuer: "muf-ride-sharing",
        audience: "muf-users",
      },
    )
  } catch (error) {
    console.error("Token generation error:", error)
    throw new Error("Failed to generate token")
  }
}

export function verifyToken(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: "muf-ride-sharing",
      audience: "muf-users",
    })
    return { valid: true, payload }
  } catch (error) {
    console.error("Token verification error:", error)
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: "Token expired" }
    } else if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: "Invalid token" }
    }
    return { valid: false, error: "Token verification failed" }
  }
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Validate input
    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    // Get user from database
    const userResult = await getUserByEmail(email)
    if (!userResult.success || !userResult.data) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = userResult.data

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    // Remove password hash from user object
    const { password_hash, ...userWithoutPassword } = user

    // Generate token
    const token = generateToken(userWithoutPassword)

    return {
      success: true,
      user: userWithoutPassword,
      token,
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Login failed" }
  }
}

export async function registerUser(userData: {
  email: string
  password: string
  full_name: string
  phone: string
  role?: "passenger" | "driver"
}): Promise<AuthResult> {
  try {
    // Validate input
    if (!userData.email || !userData.password || !userData.full_name || !userData.phone) {
      return { success: false, error: "All fields are required" }
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email)
    if (existingUser.success && existingUser.data) {
      return { success: false, error: "User already exists with this email" }
    }

    // Hash password
    const password_hash = await hashPassword(userData.password)

    // Create user
    const createResult = await createUser({
      email: userData.email,
      password_hash,
      full_name: userData.full_name,
      phone: userData.phone,
      role: userData.role || "passenger",
    })

    if (!createResult.success || !createResult.data) {
      return { success: false, error: createResult.error || "Failed to create user" }
    }

    const user = createResult.data

    // Remove password hash from user object
    const { password_hash: _, ...userWithoutPassword } = user

    // Generate token
    const token = generateToken(userWithoutPassword)

    return {
      success: true,
      user: userWithoutPassword,
      token,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Registration failed" }
  }
}

export async function getUserFromToken(token: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const verification = verifyToken(token)
    if (!verification.valid) {
      return { success: false, error: verification.error }
    }

    const userResult = await getUserByEmail(verification.payload.email)
    if (!userResult.success || !userResult.data) {
      return { success: false, error: "User not found" }
    }

    const { password_hash, ...userWithoutPassword } = userResult.data

    return { success: true, user: userWithoutPassword }
  } catch (error) {
    console.error("Get user from token error:", error)
    return { success: false, error: "Failed to get user from token" }
  }
}

export function isAuthorized(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

export function getAuthorizationHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` }
}

export async function refreshToken(oldToken: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const verification = verifyToken(oldToken)
    if (!verification.valid) {
      return { success: false, error: verification.error }
    }

    const userResult = await getUserByEmail(verification.payload.email)
    if (!userResult.success || !userResult.data) {
      return { success: false, error: "User not found" }
    }

    const { password_hash, ...userWithoutPassword } = userResult.data
    const newToken = generateToken(userWithoutPassword)

    return { success: true, token: newToken }
  } catch (error) {
    console.error("Token refresh error:", error)
    return { success: false, error: "Failed to refresh token" }
  }
}

export default {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  loginUser,
  registerUser,
  getUserFromToken,
  isAuthorized,
  getAuthorizationHeader,
  refreshToken,
}
