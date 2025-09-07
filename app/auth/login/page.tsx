"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, Eye, EyeOff } from "lucide-react"
import { ErrorAlert } from "@/components/error-alert"
import { ErrorBoundary } from "@/components/error-boundary"
import { EnhancedLoading } from "@/components/enhanced-loading"
import { useLoadingState } from "@/hooks/use-loading-state"
import { apiClient } from "@/lib/api-client"
import { sessionManager } from "@/lib/session-manager"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const loadingState = useLoadingState({
    timeout: 30000,
    onTimeout: () => {
      console.error("Login timed out")
    },
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      loadingState.setError("Please enter both email and password")
      return
    }

    try {
      loadingState.startLoading("Signing in...")

      const result = await apiClient.post(
        "/api/auth/login",
        { email, password },
        {
          timeout: 20000,
          retries: 2,
          onProgress: (progress, stage) => {
            loadingState.updateProgress(progress, stage)
          },
        },
      )

      console.log("✅ Login successful:", result)

      // Set session in session manager
      sessionManager.setSession(result.data)

      loadingState.updateProgress(100, "Login successful! Redirecting...")

      // Brief delay to show success message
      setTimeout(() => {
        loadingState.finishLoading()

        // Redirect based on role
        switch (result.data.role) {
          case "admin":
            router.push("/admin/dashboard")
            break
          case "driver":
            router.push("/driver/dashboard")
            break
          default:
            router.push("/passenger/dashboard")
        }
      }, 1000)
    } catch (error) {
      console.error("💥 Login failed:", error)

      const errorMessage =
        error instanceof Error ? error.message : "Login failed. Please check your credentials and try again."

      loadingState.setError(errorMessage)
    }
  }

  const handleRetry = () => {
    loadingState.reset()
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">RideShare Pro</span>
            </div>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingState.error && (
              <ErrorAlert
                message={loadingState.error}
                onRetry={handleRetry}
                showSupport={!loadingState.error.includes("credentials")}
              />
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loadingState.isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loadingState.isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loadingState.isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loadingState.isLoading}>
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">Demo accounts:</p>
              <p className="text-xs text-gray-500 mt-1">
                admin@rideshare.com (Admin) • driver@driver.com (Driver) • user@example.com (Passenger)
              </p>
            </div>

            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Loading Overlay */}
        <EnhancedLoading
          isLoading={loadingState.isLoading}
          progress={loadingState.progress}
          stage={loadingState.stage}
          error={loadingState.error}
          timeoutReached={loadingState.timeoutReached}
          onRetry={handleRetry}
          showNetworkStatus={true}
          estimatedTime={10000}
        />
      </div>
    </ErrorBoundary>
  )
}
