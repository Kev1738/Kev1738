"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Car, AlertCircle, CheckCircle } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Check environment variables
  const envCheck = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const envMissing = !envCheck.supabaseUrl || !envCheck.supabaseKey

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("🔐 Attempting login...")

      async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const form = new FormData(e.currentTarget);
    const payload = {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };

    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const ctype = r.headers.get("content-type") || "";
    if (!ctype.includes("application/json")) {
      const text = await r.text(); // show what the server said
      throw new Error(`Server returned non-JSON response (${r.status}). ${text}`);
    }

    const data = await r.json();
    if (!r.ok || !data?.success) {
      throw new Error(data?.message || "Login failed");
    }

    // success: redirect based on role
    const role = data.data?.role;
    if (role === "admin") location.href = "/admin/dashboard";
    else if (role === "driver") location.href = "/driver/dashboard";
    else location.href = "/passenger/dashboard";
  } catch (err: any) {
    setError(err.message || "Login error");
  } finally {
    setLoading(false);
  }
}


      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Response is not JSON, content-type:", contentType)
        const responseText = await response.text()
        console.error("❌ Response text:", responseText)
        throw new Error("Server returned non-JSON response. Please check server logs.")
      }

      const data = await response.json()
      console.log("📦 Response data:", data)

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.message || "Login failed")
      }

      // Store user data
      localStorage.setItem("user", JSON.stringify(data.data.user))
      localStorage.setItem("token", data.data.token)

      setSuccess("Login successful! Redirecting...")

      // Redirect based on user role
      const user = data.data.user
      setTimeout(() => {
        if (user.role === "admin") {
          router.push("/admin/dashboard")
        } else if (user.role === "driver") {
          router.push("/driver/dashboard")
        } else {
          router.push("/passenger/dashboard")
        }
      }, 1000)
    } catch (error) {
      console.error("💥 Login error:", error)
      setError(error instanceof Error ? error.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (email: string, password = "123456") => {
    setFormData({ email, password })
    setError("")
    setSuccess("")

    // Trigger form submission
    setTimeout(() => {
      const form = document.querySelector("form")
      if (form) {
        form.requestSubmit()
      }
    }, 100)
  }

  if (envMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Car className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">RideShare Pro</CardTitle>
            <CardDescription>Missing Environment Variables</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please configure the following environment variables:
                <ul className="mt-2 list-disc list-inside">
                  {!envCheck.supabaseUrl && <li>NEXT_PUBLIC_SUPABASE_URL</li>}
                  {!envCheck.supabaseKey && <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>}
                </ul>
                <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                  <p className="font-medium">To fix this:</p>
                  <ol className="mt-1 list-decimal list-inside space-y-1">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to Settings → API</li>
                    <li>Copy the Project URL and anon public key</li>
                    <li>Add them to your environment variables</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Car className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">RideShare Pro</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Demo Accounts</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => handleDemoLogin("admin@rideshare.com")}
                disabled={isLoading}
              >
                Demo Admin Login
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => handleDemoLogin("driver@driver.com")}
                disabled={isLoading}
              >
                Demo Driver Login
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => handleDemoLogin("user@example.com")}
                disabled={isLoading}
              >
                Demo Passenger Login
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
