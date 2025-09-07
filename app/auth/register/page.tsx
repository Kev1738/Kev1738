"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Eye, EyeOff, AlertCircle, CheckCircle, WifiOff } from "lucide-react"
import { ErrorAlert } from "@/components/error-alert"
import { ErrorBoundary } from "@/components/error-boundary"
import { EnhancedLoading } from "@/components/enhanced-loading"
import { useLoadingState } from "@/hooks/use-loading-state"
import { apiClient } from "@/lib/api-client"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [healthCheckFailed, setHealthCheckFailed] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || ""
  const abortControllerRef = useRef<AbortController>()

  const loadingState = useLoadingState({
    timeout: 45000, // 45 second timeout
    onTimeout: () => {
      console.error("Registration timed out")
      abortControllerRef.current?.abort()
    },
    onError: (error) => {
      console.error("Loading state error:", error)
    },
  })

  useEffect(() => {
    if (defaultRole) {
      setFormData((prev) => ({ ...prev, role: defaultRole }))
    }
    checkSystemHealth()
  }, [defaultRole])

  const checkSystemHealth = async () => {
    try {
      console.log("🔍 Checking system health...")

      const health = await apiClient.get("/api/health", {
        timeout: 8000, // Shorter timeout for health check
        retries: 1, // Only retry once
        onProgress: (progress, stage) => {
          console.log(`Health check: ${progress}% - ${stage}`)
        },
      })

      console.log("✅ Health check successful:", health.status)
      setSystemHealth(health)
      setHealthCheckFailed(false)
    } catch (error) {
      console.warn("⚠️ Health check failed (non-critical):", error)
      setHealthCheckFailed(true)

      // Set a fallback health status
      setSystemHealth({
        status: "unknown",
        error: error instanceof Error ? error.message : "Health check unavailable",
        services: {
          api: "operational", // We know API is working since we're loading the page
          auth: "unknown",
          database: "unknown",
        },
      })
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Full name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address"
      }
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    }

    if (!formData.role) {
      errors.role = "Please select an account type"
    }

    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long"
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Cancel any existing request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    try {
      loadingState.startLoading("Preparing registration...")

      const registrationData = {
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
      }

      console.log("🚀 Starting registration process...")

      const result = await apiClient.post("/api/auth/register", registrationData, {
        timeout: 30000,
        retries: 2,
        signal: abortControllerRef.current.signal,
        onProgress: (progress, stage) => {
          loadingState.updateProgress(progress, stage)
        },
      })

      console.log("✅ Registration successful:", result)

      loadingState.updateProgress(100, "Registration complete! Redirecting...")

      // Brief delay to show success message
      setTimeout(() => {
        loadingState.finishLoading()

        // Redirect based on role
        switch (formData.role) {
          case "admin":
            router.push("/admin/dashboard")
            break
          case "driver":
            router.push("/driver/dashboard")
            break
          default:
            router.push("/passenger/dashboard")
        }
      }, 1500)
    } catch (error) {
      console.error("💥 Registration failed:", error)

      const errorMessage =
        error instanceof Error ? error.message : "Registration failed. Please check your connection and try again."

      loadingState.setError(errorMessage)
    }
  }

  const handleRetry = () => {
    loadingState.reset()
    setValidationErrors({})
  }

  const handleCancel = () => {
    abortControllerRef.current?.abort()
    loadingState.reset()
  }

  const retryHealthCheck = () => {
    setHealthCheckFailed(false)
    setSystemHealth(null)
    checkSystemHealth()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const getSystemStatusIndicator = () => {
    if (healthCheckFailed) {
      return (
        <div className="flex items-center text-orange-600 text-xs">
          <WifiOff className="h-3 w-3 mr-1" />
          <span>System status unknown</span>
          <Button variant="link" size="sm" onClick={retryHealthCheck} className="h-auto p-0 ml-2 text-xs underline">
            Retry
          </Button>
        </div>
      )
    }

    if (!systemHealth) {
      return (
        <div className="flex items-center text-gray-500 text-xs">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400 mr-1" />
          Checking system status...
        </div>
      )
    }

    if (systemHealth.status === "healthy") {
      return (
        <div className="flex items-center text-green-600 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          All systems operational
        </div>
      )
    }

    return (
      <div className="flex items-center text-yellow-600 text-xs">
        <AlertCircle className="h-3 w-3 mr-1" />
        {systemHealth.status === "degraded" ? "Some services degraded" : "System status unknown"}
      </div>
    )
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
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Join our ride-sharing community</CardDescription>

            {/* System Status Indicator */}
            <div className="flex items-center justify-center mt-2">{getSystemStatusIndicator()}</div>
          </CardHeader>
          <CardContent>
            {loadingState.error && (
              <ErrorAlert
                message={loadingState.error}
                onRetry={handleRetry}
                showSupport={!loadingState.error.includes("match") && !loadingState.error.includes("required")}
              />
            )}

            {/* Health Check Warning (non-blocking) */}
            {healthCheckFailed && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                  <p className="text-sm text-orange-700">
                    Unable to verify system status, but registration should still work.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    if (validationErrors.name) {
                      setValidationErrors((prev) => ({ ...prev, name: "" }))
                    }
                  }}
                  disabled={loadingState.isLoading}
                  className={validationErrors.name ? "border-red-500" : ""}
                  required
                />
                {validationErrors.name && <p className="text-sm text-red-600">{validationErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: "" }))
                    }
                  }}
                  disabled={loadingState.isLoading}
                  className={validationErrors.email ? "border-red-500" : ""}
                  required
                />
                {validationErrors.email && <p className="text-sm text-red-600">{validationErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    if (validationErrors.phone) {
                      setValidationErrors((prev) => ({ ...prev, phone: "" }))
                    }
                  }}
                  disabled={loadingState.isLoading}
                  className={validationErrors.phone ? "border-red-500" : ""}
                  required
                />
                {validationErrors.phone && <p className="text-sm text-red-600">{validationErrors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, role: value }))
                    if (validationErrors.role) {
                      setValidationErrors((prev) => ({ ...prev, role: "" }))
                    }
                  }}
                  disabled={loadingState.isLoading}
                >
                  <SelectTrigger className={validationErrors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passenger">Passenger</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.role && <p className="text-sm text-red-600">{validationErrors.role}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 6 characters)"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({ ...prev, password: "" }))
                      }
                    }}
                    disabled={loadingState.isLoading}
                    className={validationErrors.password ? "border-red-500" : ""}
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
                {validationErrors.password && <p className="text-sm text-red-600">{validationErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    if (validationErrors.confirmPassword) {
                      setValidationErrors((prev) => ({ ...prev, confirmPassword: "" }))
                    }
                  }}
                  disabled={loadingState.isLoading}
                  className={validationErrors.confirmPassword ? "border-red-500" : ""}
                  required
                />
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loadingState.isLoading}>
                Create Account
              </Button>
            </form>

            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  Sign in
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
          onCancel={handleCancel}
          showNetworkStatus={true}
          estimatedTime={15000} // 15 seconds estimated time
        />
      </div>
    </ErrorBoundary>
  )
}
