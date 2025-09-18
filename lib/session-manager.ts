"use client"

interface UserSession {
  id: string
  email: string
  full_name: string
  role: "passenger" | "driver" | "admin"
  isAuthenticated: boolean
  lastActivity: number
}

class SessionManager {
  private static instance: SessionManager
  private session: UserSession | null = null
  private listeners: Set<(session: UserSession | null) => void> = new Set()
  private refreshTimer: NodeJS.Timeout | null = null

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  private constructor() {
    this.initializeSession()
  }

  private async initializeSession() {
    try {
      console.log("🔐 Initializing session...")

      // Check if we have user data in localStorage (from successful login)
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          console.log("📱 Found stored user data:", userData.email)

          this.session = {
            ...userData,
            isAuthenticated: true,
            lastActivity: Date.now(),
          }

          this.notifyListeners()
          this.startRefreshTimer()
          return
        } catch (error) {
          console.error("❌ Invalid stored user data:", error)
          localStorage.removeItem("user")
        }
      }

      // Verify session with server
      await this.verifySession()
    } catch (error) {
      console.error("💥 Session initialization failed:", error)
      this.clearSession()
    }
  }

  private async verifySession(): Promise<boolean> {
    try {
      console.log("🔍 Verifying session with server...")

      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      })

      // A 401/403 simply means "not signed in" – not an error scenario here.
      if (response.status === 401 || response.status === 403) {
        console.log("ℹ️ No active session")
        this.clearSession() // ensure we're clean
        return false
      }

      if (!response.ok) {
        const txt = await response.text()
        console.warn(`⚠️ Session verify failed (${response.status}):`, txt)
        this.clearSession()
        return false
      }

      const { data: userData } = await response.json()
      console.log("✅ Session verified:", userData.email)

      this.session = {
        ...userData,
        isAuthenticated: true,
        lastActivity: Date.now(),
      }
      localStorage.setItem("user", JSON.stringify(userData))
      this.notifyListeners()
      this.startRefreshTimer()
      return true
    } catch (error) {
      console.error("💥 Session verification error:", error)
      this.clearSession()
      return false
    }
  }

  private startRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }

    // Refresh session every 5 minutes
    this.refreshTimer = setInterval(
      () => {
        if (this.session) {
          this.verifySession()
        }
      },
      5 * 60 * 1000,
    )
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.session)
      } catch (error) {
        console.error("Session listener error:", error)
      }
    })
  }

  getSession(): UserSession | null {
    return this.session
  }

  isAuthenticated(): boolean {
    return this.session?.isAuthenticated ?? false
  }

  setSession(userData: any) {
    console.log("📝 Setting session for:", userData.email)

    this.session = {
      ...userData,
      isAuthenticated: true,
      lastActivity: Date.now(),
    }

    localStorage.setItem("user", JSON.stringify(userData))
    this.notifyListeners()
    this.startRefreshTimer()
  }

  clearSession() {
    console.log("🗑️ Clearing session")

    this.session = null
    localStorage.removeItem("user")
    localStorage.removeItem("userId")
    localStorage.removeItem("token")

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }

    this.notifyListeners()
  }

  subscribe(listener: (session: UserSession | null) => void): () => void {
    this.listeners.add(listener)

    // Immediately call with current session
    listener(this.session)

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  updateActivity() {
    if (this.session) {
      this.session.lastActivity = Date.now()
    }
  }
}

export const sessionManager = SessionManager.getInstance()
