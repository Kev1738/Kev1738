"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle, XCircle } from "lucide-react"

interface EnvCheckResult {
  success: boolean
  message: string
  variables: {
    [key: string]: {
      exists: boolean
      value: string
    }
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [envCheck, setEnvCheck] = useState<EnvCheckResult | null>(null)
  const router = useRouter()

  // Check environment variables on component mount
  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  const checkEnvironmentVariables = async () => {
    try {
      const response = await fetch("/api/env-check")
      const data = await response.json()
      setEnvCheck(data)

      if (!data.success) {
        setError("Environment configuration issue detected. Please check console for details.")
        console.error("Environment variables check failed:", data)
      }
    } catch (error) {
      console.error("Failed to check environment variables:", error)
      setError("Failed to verify system configuration")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("🔐 Attempting login...")

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("📡 Login response status:", response.status)
      console.log("📡 Login response headers:", Object.fromEntries(response.headers.entries()))

      let data
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
        console.log("📦 Login response data:", data)
      } else {
        const text = await response.text()
        console.error("❌ Non-JSON response:", text)
        throw new Error("Server returned invalid response format")
      }

      if (data.success) {
        console.log("✅ Login successful")
        setSuccess("Login successful! Redirecting...")

        // Store user data in localStorage for client-side access
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user))
        }

        // Redirect based on user role
        setTimeout(() => {
          const role = data.user?.role
          switch (role) {
            case "admin":
              router.push("/admin/dashboard")
              break
            case "driver":
              router.push("/driver/dashboard")
              break
            case "passenger":
              router.push("/passenger/dashboard")
              break
            default:
              router.push("/dashboard")
          }
        }, 1000)
      } else {
        console.log("❌ Login failed:", data.message)
        setError(data.message || "Login failed")
      }
    } catch (error) {
      console.error("💥 Login error:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError("")
    setSuccess("")

    // Auto-submit after setting values
    setTimeout(() => {
      const form = document.getElementById("login-form") as HTMLFormElement
      if (form) {
        form.requestSubmit()
      }
    }, 100)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Environment Status */}
        {envCheck && (
          <Card
            className={`border-2 ${envCheck.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {envCheck.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`text-sm font-medium ${envCheck.success ? "text-green-800" : "text-red-800"}`}>
                  {envCheck.message}
                </span>
              </div>
              {!envCheck.success && (
                <div className="mt-2 text-xs text-red-700">
                  <p>Missing environment variables:</p>
                  <ul className="list-disc list-inside mt-1">
                    {!envCheck.variables.NEXT_PUBLIC_SUPABASE_URL?.exists && <li>NEXT_PUBLIC_SUPABASE_URL</li>}
                    {!envCheck.variables.SUPABASE_SERVICE_ROLE_KEY?.exists && <li>SUPABASE_SERVICE_ROLE_KEY</li>}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Login Form */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">Sign in to your RideShare account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !envCheck?.success}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm text-gray-600 text-center">Demo Accounts (Password: 123456)</p>
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("admin@rideshare.com", "123456")}
                  disabled={isLoading || !envCheck?.success}
                  className="text-xs"
                >
                  👑 Admin Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("driver@driver.com", "123456")}
                  disabled={isLoading || !envCheck?.success}
                  className="text-xs"
                >
                  🚗 Driver Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin("user@example.com", "123456")}
                  disabled={isLoading || !envCheck?.success}
                  className="text-xs"
                >
                  👤 Passenger Demo
                </Button>
              </div>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => router.push("/auth/register")}
                disabled={isLoading}
                className="text-sm"
              >
                Don't have an account? Sign up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
