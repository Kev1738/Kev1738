"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/hooks/use-session"
import { EnhancedLoading } from "@/components/enhanced-loading"
import { ErrorAlert } from "@/components/error-alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, RefreshCw, Home } from "lucide-react"
import { sessionManager } from "@/lib/session-manager"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "passenger" | "driver" | "admin"
  fallbackUrl?: string
}

export function AuthGuard({ children, requiredRole, fallbackUrl = "/auth/login" }: AuthGuardProps) {
  const router = useRouter()
  const { session, isLoading, error, timeoutReached, refresh } = useSession({
    timeout: 15000, // 15 second timeout for auth check
  })

  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  useEffect(() => {
    // Update activity when component mounts
    if (session) {
      sessionManager.updateActivity()
    }
  }, [session])

  const handleRetry = async () => {
    if (retryCount < maxRetries) {
      setRetryCount((prev) => prev + 1)
      await refresh()
    } else {
      // Max retries reached, redirect to login
      router.push(fallbackUrl)
    }
  }

  const handleGoHome = () => {
    router.push("/")
  }

  const handleForceLogin = () => {
    // Clear any stale session data
    sessionManager.clearSession()
    router.push(fallbackUrl)
  }

  // Show loading state
  if (isLoading) {
    return (
      <EnhancedLoading
        isLoading={true}
        progress={50}
        stage="Verifying authentication..."
        showNetworkStatus={true}
        estimatedTime={5000}
        onCancel={() => router.push("/")}
      />
    )
  }

  // Show timeout error
  if (timeoutReached) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Authentication Timeout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-gray-600">
              <p>Authentication is taking longer than expected.</p>
              <p className="text-sm mt-2">This might be due to:</p>
              <ul className="text-xs mt-2 list-disc list-inside text-left">
                <li>Slow internet connection</li>
                <li>Server maintenance</li>
                <li>Session expired</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleRetry} className="flex-1" disabled={retryCount >= maxRetries}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryCount >= maxRetries ? "Max Retries" : `Retry (${retryCount}/${maxRetries})`}
              </Button>
              <Button variant="outline" onClick={handleGoHome} className="flex-1 bg-transparent">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </div>

            <Button variant="link" onClick={handleForceLogin} className="w-full text-sm">
              Sign in again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorAlert
              message={error}
              onRetry={retryCount < maxRetries ? handleRetry : undefined}
              showSupport={true}
            />

            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={handleGoHome} className="flex-1 bg-transparent">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button onClick={handleForceLogin} className="flex-1">
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user is authenticated
  if (!session?.isAuthenticated) {
    console.log("🔄 User not authenticated, redirecting to:", fallbackUrl)
    router.push(fallbackUrl)
    return <EnhancedLoading isLoading={true} progress={75} stage="Redirecting to login..." showNetworkStatus={false} />
  }

  // Check role requirements
  if (requiredRole && session.role !== requiredRole) {
    console.log(`🚫 Access denied. Required: ${requiredRole}, User: ${session.role}`)

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500">
              Required role: <span className="font-medium">{requiredRole}</span>
              <br />
              Your role: <span className="font-medium">{session.role}</span>
            </p>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGoHome} className="flex-1 bg-transparent">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button
                onClick={() => {
                  // Redirect to appropriate dashboard
                  const dashboardUrl = `/${session.role}/dashboard`
                  router.push(dashboardUrl)
                }}
                className="flex-1"
              >
                My Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // All checks passed, render children
  return <>{children}</>
}
