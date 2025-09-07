"use client"

import { useState, useEffect } from "react"
import { sessionManager } from "@/lib/session-manager"

interface UseSessionOptions {
  redirectTo?: string
  redirectIfFound?: boolean
  timeout?: number
}

export function useSession(options: UseSessionOptions = {}) {
  const { redirectTo, redirectIfFound = false, timeout = 10000 } = options

  const [session, setSession] = useState(sessionManager.getSession())
  const [isLoading, setIsLoading] = useState(!session)
  const [error, setError] = useState<string | null>(null)
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    // Set timeout for session loading
    if (isLoading) {
      timeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn("⏰ Session loading timeout reached")
          setTimeoutReached(true)
          setIsLoading(false)
          setError("Session loading timed out. Please try refreshing the page.")
        }
      }, timeout)
    }

    // Subscribe to session changes
    const unsubscribe = sessionManager.subscribe((newSession) => {
      console.log("📡 Session update received:", newSession?.email || "null")

      setSession(newSession)
      setIsLoading(false)
      setError(null)
      setTimeoutReached(false)

      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    })

    return () => {
      unsubscribe()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isLoading, timeout])

  useEffect(() => {
    if (!isLoading && redirectTo) {
      if (!session && !redirectIfFound) {
        console.log("🔄 Redirecting to login:", redirectTo)
        window.location.href = redirectTo
      } else if (session && redirectIfFound) {
        console.log("🔄 Redirecting authenticated user:", redirectTo)
        window.location.href = redirectTo
      }
    }
  }, [session, isLoading, redirectTo, redirectIfFound])

  const refresh = async () => {
    setIsLoading(true)
    setError(null)
    setTimeoutReached(false)

    try {
      await sessionManager.verifySession()
    } catch (error) {
      setError("Failed to refresh session")
    }
  }

  return {
    session,
    isLoading,
    error,
    timeoutReached,
    isAuthenticated: session?.isAuthenticated ?? false,
    user: session,
    refresh,
  }
}
