import crypto from "crypto"
import { createSession, getSessionByToken, deleteSession, getUserById } from "./database"

export interface SessionData {
  userId: string
  email: string
  role: string
  token: string
  expiresAt: Date
}

export class SessionManager {
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  static generateToken(): string {
    return crypto.randomBytes(32).toString("hex")
  }

  static async createUserSession(userId: string): Promise<SessionData | null> {
    try {
      console.log("🎫 Creating session for user:", userId)

      const user = await getUserById(userId)
      if (!user) {
        console.error("❌ User not found for session creation")
        return null
      }

      const token = this.generateToken()
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION)

      const session = await createSession(userId, token, expiresAt)
      if (!session) {
        console.error("❌ Failed to create session in database")
        return null
      }

      console.log("✅ Session created successfully")
      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        token,
        expiresAt,
      }
    } catch (error) {
      console.error("💥 Session creation error:", error)
      return null
    }
  }

  static async validateSession(token: string): Promise<SessionData | null> {
    try {
      console.log("🔍 Validating session token")

      const session = await getSessionByToken(token)
      if (!session) {
        console.log("ℹ️ Session not found")
        return null
      }

      // Check if session is expired
      const now = new Date()
      const expiresAt = new Date(session.expires_at)

      if (now > expiresAt) {
        console.log("⏰ Session expired, cleaning up")
        await this.destroySession(token)
        return null
      }

      const user = await getUserById(session.user_id)
      if (!user) {
        console.error("❌ User not found for session")
        await this.destroySession(token)
        return null
      }

      console.log("✅ Session validated successfully")
      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        token,
        expiresAt,
      }
    } catch (error) {
      console.error("💥 Session validation error:", error)
      return null
    }
  }

  static async destroySession(token: string): Promise<boolean> {
    try {
      console.log("🗑️ Destroying session")
      const result = await deleteSession(token)

      if (result) {
        console.log("✅ Session destroyed successfully")
      } else {
        console.error("❌ Failed to destroy session")
      }

      return result
    } catch (error) {
      console.error("💥 Session destruction error:", error)
      return false
    }
  }

  static async refreshSession(token: string): Promise<SessionData | null> {
    try {
      console.log("🔄 Refreshing session")

      const sessionData = await this.validateSession(token)
      if (!sessionData) {
        return null
      }

      // Destroy old session
      await this.destroySession(token)

      // Create new session
      const newSession = await this.createUserSession(sessionData.userId)

      if (newSession) {
        console.log("✅ Session refreshed successfully")
      } else {
        console.error("❌ Failed to refresh session")
      }

      return newSession
    } catch (error) {
      console.error("💥 Session refresh error:", error)
      return null
    }
  }
}
