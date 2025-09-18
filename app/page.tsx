"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Users, MapPin, Shield, Star, ArrowRight, CheckCircle } from "lucide-react"

export default function HomePage() {
  const [systemStatus, setSystemStatus] = useState<"loading" | "healthy" | "error">("loading")
  const router = useRouter()

  useEffect(() => {
    checkSystemHealth()
  }, [])

  const checkSystemHealth = async () => {
    try {
      const response = await fetch("/api/health")
      const health = await response.json()
      setSystemStatus(health.status === "healthy" ? "healthy" : "error")
    } catch (error) {
      console.error("Health check failed:", error)
      setSystemStatus("error")
    }
  }

  const handleDemoLogin = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Store user data
        localStorage.setItem("user", JSON.stringify(data.user))
        if (data.driver) {
          localStorage.setItem("driver", JSON.stringify(data.driver))
        }

        // Redirect based on role
        if (data.user.role === "admin") {
          router.push("/admin/dashboard")
        } else if (data.user.role === "driver") {
          router.push("/driver/dashboard")
        } else {
          router.push("/passenger/dashboard")
        }
      } else {
        alert(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Muf</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant={
                  systemStatus === "healthy" ? "default" : systemStatus === "error" ? "destructive" : "secondary"
                }
              >
                {systemStatus === "loading"
                  ? "Checking..."
                  : systemStatus === "healthy"
                    ? "System Online"
                    : "System Issues"}
              </Badge>
              <Button variant="outline" onClick={() => router.push("/auth/login")}>
                Sign In
              </Button>
              <Button onClick={() => router.push("/auth/register")}>Get Started</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Ride, <span className="text-blue-600">Your Way</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience seamless transportation with Muf. Whether you're a passenger looking for a ride or a driver ready
            to earn, we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push("/auth/register")}>
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/auth/login")}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Muf?</h3>
            <p className="text-lg text-gray-600">Built for modern transportation needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Safe & Secure</CardTitle>
                <CardDescription>All drivers are verified and vehicles are inspected for your safety</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <MapPin className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Real-time Tracking</CardTitle>
                <CardDescription>Track your ride in real-time and share your trip with loved ones</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Quality Service</CardTitle>
                <CardDescription>Rated drivers and quality vehicles ensure a premium experience</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Try the Demo</h3>
            <p className="text-lg text-gray-600">Experience Muf with our demo accounts</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>Manage the entire platform, users, and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => handleDemoLogin("admin@uberclone.com", "admin123")}>
                  Demo Admin
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Car className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Driver Dashboard</CardTitle>
                <CardDescription>Accept rides, track earnings, and manage your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => handleDemoLogin("driver1@uberclone.com", "driver123")}>
                  Demo Driver
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <MapPin className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Passenger App</CardTitle>
                <CardDescription>Book rides, track trips, and manage payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => handleDemoLogin("passenger1@uberclone.com", "passenger123")}>
                  Demo Passenger
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust Muf for their transportation needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => router.push("/auth/register")}>
              Create Account
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              onClick={() => router.push("/auth/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Car className="h-8 w-8 text-blue-400 mr-3" />
              <span className="text-2xl font-bold">Muf</span>
            </div>
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-gray-300">Secure & Reliable Transportation</span>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Muf. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
