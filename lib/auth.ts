import crypto from "crypto"
import { getUserByEmail, createUser, createDriverProfile, createPassengerProfile, createWallet } from "./database"
import { SessionManager } from "./session-manager"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  phone?: string
  role: "passenger" | "driver" | "admin"
}

export interface AuthResult {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    role: string
    fullName?: string
  }
  token?: string
}

export class AuthService {
  private static hashPassword(password: string): string {
    return crypto.createHash("md5").update(password).digest("hex")
  }

  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      console.log("🔐 Attempting login for:", credentials.email)

      // Validate input
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          message: "Email and password are required",
        }
      }

      // Get user from database
      const user = await getUserByEmail(credentials.email.toLowerCase().trim())
      if (!user) {
        console.log("❌ User not found:", credentials.email)
        return {
          success: false,
          message: "Invalid email or password",
        }
      }

      // Verify password
      const hashedPassword = this.hashPassword(credentials.password)
      if (user.password !== hashedPassword) {
        console.log("❌ Invalid password for user:", credentials.email)
        return {
          success: false,
          message: "Invalid email or password",
        }
      }

      // Check if user is active
      if (!user.is_active) {
        console.log("❌ User account is inactive:", credentials.email)
        return {
          success: false,
          message: "Account is inactive. Please contact support.",
        }
      }

      // Create session
      const session = await SessionManager.createUserSession(user.id)
      if (!session) {
        console.error("❌ Failed to create session for user:", credentials.email)
        return {
          success: false,
          message: "Failed to create session. Please try again.",
        }
      }

      console.log("✅ Login successful for:", credentials.email)
      return {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
        },
        token: session.token,
      }
    } catch (error) {
      console.error("💥 Login error:", error)
      return {
        success: false,
        message: "An error occurred during login. Please try again.",
      }
    }
  }

  static async register(data: RegisterData): Promise<AuthResult> {
    try {
      console.log("📝 Attempting registration for:", data.email)

      // Validate input
      if (!data.email || !data.password || !data.fullName || !data.role) {
        return {
          success: false,
          message: "All required fields must be provided",
        }
      }

      // Check if user already exists
      const existingUser = await getUserByEmail(data.email.toLowerCase().trim())
      if (existingUser) {
        console.log("❌ User already exists:", data.email)
        return {
          success: false,
          message: "An account with this email already exists",
        }
      }

      // Hash password
      const hashedPassword = this.hashPassword(data.password)

      // Create user
      const user = await createUser({
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        full_name: data.fullName,
        phone: data.phone,
        role: data.role,
      })

      if (!user) {
        console.error("❌ Failed to create user:", data.email)
        return {
          success: false,
          message: "Failed to create account. Please try again.",
        }
      }

      // Create role-specific profile
      if (data.role === "driver") {
        await createDriverProfile(user.id)
      } else if (data.role === "passenger") {
        await createPassengerProfile(user.id)
      }

      // Create wallet for all users
      await createWallet(user.id)

      // Create session
      const session = await SessionManager.createUserSession(user.id)
      if (!session) {
        console.error("❌ Failed to create session for new user:", data.email)
        return {
          success: false,
          message: "Account created but failed to log in. Please try logging in manually.",
        }
      }

      console.log("✅ Registration successful for:", data.email)
      return {
        success: true,
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
        },
        token: session.token,
      }
    } catch (error) {
      console.error("💥 Registration error:", error)
      return {
        success: false,
        message: "An error occurred during registration. Please try again.",
      }
    }
  }

  static async verifyToken(token: string): Promise<AuthResult> {
    try {
      console.log("🔍 Verifying token")

      if (!token) {
        return {
          success: false,
          message: "No token provided",
        }
      }

      const session = await SessionManager.validateSession(token)
      if (!session) {
        console.log("❌ Invalid or expired token")
        return {
          success: false,
          message: "Invalid or expired session",
        }
      }

      console.log("✅ Token verified successfully")
      return {
        success: true,
        message: "Token is valid",
        user: {
          id: session.userId,
          email: session.email,
          role: session.role,
        },
        token: session.token,
      }
    } catch (error) {
      console.error("💥 Token verification error:", error)
      return {
        success: false,
        message: "An error occurred during token verification",
      }
    }
  }

  static async logout(token: string): Promise<AuthResult> {
    try {
      console.log("👋 Attempting logout")

      if (!token) {
        return {
          success: true,
          message: "Already logged out",
        }
      }

      const result = await SessionManager.destroySession(token)

      if (result) {
        console.log("✅ Logout successful")
        return {
          success: true,
          message: "Logged out successfully",
        }
      } else {
        console.error("❌ Failed to destroy session during logout")
        return {
          success: true, // Still return success as user intent is to logout
          message: "Logged out (session cleanup failed)",
        }
      }
    } catch (error) {
      console.error("💥 Logout error:", error)
      return {
        success: true, // Still return success as user intent is to logout
        message: "Logged out (with errors)",
      }
    }
  }
}
