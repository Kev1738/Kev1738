"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Clock, Car, History, CreditCard, Settings, LogOut } from "lucide-react"

export default function PassengerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (!userData || !token) {
      router.push("/auth/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "passenger") {
        router.push("/auth/login")
        return
      }
      setUser(parsedUser)
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/auth/login")
      return
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Car className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Car className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-semibold">Muf</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user.profile_image_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {user.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-gray-500">Passenger</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.full_name?.split(" ")[0]}!</h2>
          <p className="text-gray-600">Where would you like to go today?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push("/passenger/book-ride")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Car className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle className="text-lg">Book a Ride</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>Request a ride to your destination</CardDescription>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push("/passenger/history")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <History className="h-5 w-5 text-green-600 mr-2" />
                <CardTitle className="text-lg">Ride History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>View your past rides and trips</CardDescription>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push("/passenger/payment")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
                <CardTitle className="text-lg">Payment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>Manage payment methods</CardDescription>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push("/passenger/profile")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-gray-600 mr-2" />
                <CardTitle className="text-lg">Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>Update your profile settings</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Current Ride Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Current Ride Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No active rides</p>
              <Button className="mt-4" onClick={() => router.push("/passenger/book-ride")}>
                Book Your First Ride
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No recent activity</p>
              <p className="text-sm text-gray-500 mt-2">Your ride history will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
