"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Car, Mail, Lock, User, Truck } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("") // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await performLogin(formData.email, formData.password)
  }

  const performLogin = async (email: string, password: string) => {
    setLoading(true)
    setError("")

    try {
      console.log("Attempting login for:", email)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("Login response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Login failed with status:", response.status, "Response:", errorText)
        throw new Error(`Login failed: ${response.status}`)
      }

      const data = await response.json()
      console.log("Login response data:", data)

      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(data.data.user))
        localStorage.setItem("auth_token", data.data.token)

        console.log("Login successful, redirecting to:", data.data.user.role)

        // Redirect based on role
        if (data.data.user.role === "admin") {
          router.push("/admin/dashboard")
        } else if (data.data.user.role === "driver") {
          router.push("/driver/dashboard")
        } else {
          router.push("/passenger/dashboard")
        }
      } else {
        setError(data.error || data.message || "Login failed")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (email: string, password: string) => {
    setFormData({ email, password })
    await performLogin(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Car className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold">Muf</h1>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Lock className="h-4 w-4 mr-1" />
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or try demo accounts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              onClick={() => handleDemoLogin("admin@muf.com", "admin123")}
              disabled={loading}
              className="w-full"
            >
              <User className="mr-2 h-4 w-4" />
              Demo Admin
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin("driver@muf.com", "driver123")}
              disabled={loading}
              className="w-full"
            >
              <Truck className="mr-2 h-4 w-4" />
              Demo Driver
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin("passenger@muf.com", "passenger123")}
              disabled={loading}
              className="w-full"
            >
              <User className="mr-2 h-4 w-4" />
              Demo Passenger
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/auth/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
