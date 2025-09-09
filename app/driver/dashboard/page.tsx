"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorAlert } from "@/components/error-alert"
import { MobileHeader } from "@/components/mobile-header"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { MobileRideCard } from "@/components/mobile-ride-card"
import { MobileQuickActions } from "@/components/mobile-quick-actions"
import { Car, DollarSign, Star, Clock, MapPin, Users } from "lucide-react"

interface DashboardData {
  profile: {
    status: string
    rating: number
    total_rides: number
    total_earnings: number
    is_online: boolean
  }
  activeRides: any[]
  todayEarnings: number
  todayRides: number
}

export default function DriverDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(false)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load driver profile
      const profileResponse = await fetch("/api/driver/profile")
      if (!profileResponse.ok) {
        throw new Error("Failed to load profile")
      }
      const profileData = await profileResponse.json()

      if (!profileData.success) {
        throw new Error(profileData.message || "Failed to load profile")
      }

      // Load active rides
      const ridesResponse = await fetch("/api/rides/active")
      const ridesData = await ridesResponse.json()

      // Load earnings
      const earningsResponse = await fetch("/api/driver/earnings")
      const earningsData = await earningsResponse.json()

      setData({
        profile: profileData.profile || {
          status: "offline",
          rating: 5.0,
          total_rides: 0,
          total_earnings: 0,
          is_online: false,
        },
        activeRides: ridesData.success ? ridesData.rides || [] : [],
        todayEarnings: earningsData.success ? earningsData.today || 0 : 0,
        todayRides: earningsData.success ? earningsData.rides_today || 0 : 0,
      })

      setIsOnline(profileData.profile?.is_online || false)
    } catch (err: any) {
      console.error("Load dashboard data error:", err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const toggleOnlineStatus = async () => {
    try {
      const response = await fetch("/api/driver/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_online: !isOnline }),
      })

      const result = await response.json()
      if (result.success) {
        setIsOnline(!isOnline)
        // Reload dashboard data
        loadDashboardData()
      }
    } catch (err) {
      console.error("Toggle status error:", err)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="Driver Dashboard" />
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
        <MobileBottomNav activeTab="dashboard" userRole="driver" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileHeader title="Driver Dashboard" />
        <div className="p-4">
          <ErrorAlert message={error} onRetry={loadDashboardData} />
        </div>
        <MobileBottomNav activeTab="dashboard" userRole="driver" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader title="Driver Dashboard" />

      <div className="p-4 space-y-4 pb-20">
        {/* Status Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Driver Status</CardTitle>
              <Badge variant={isOnline ? "default" : "secondary"}>{isOnline ? "Online" : "Offline"}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Car className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">
                  {isOnline ? "Ready for rides" : "Go online to receive rides"}
                </span>
              </div>
              <Button onClick={toggleOnlineStatus} variant={isOnline ? "outline" : "default"} size="sm">
                {isOnline ? "Go Offline" : "Go Online"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Today's Earnings</p>
                  <p className="text-lg font-bold">${data?.todayEarnings?.toFixed(2) || "0.00"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Today's Rides</p>
                  <p className="text-lg font-bold">{data?.todayRides || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-lg font-bold">{data?.profile?.rating?.toFixed(1) || "5.0"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Rides</p>
                  <p className="text-lg font-bold">{data?.profile?.total_rides || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <MobileQuickActions userRole="driver" />

        {/* Active Rides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Rides</CardTitle>
            <CardDescription>Your current and pending rides</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.activeRides && data.activeRides.length > 0 ? (
              <div className="space-y-3">
                {data.activeRides.map((ride) => (
                  <MobileRideCard key={ride.id} ride={ride} userRole="driver" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active rides</p>
                <p className="text-sm text-gray-400">
                  {isOnline ? "Waiting for ride requests..." : "Go online to receive rides"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <MobileBottomNav activeTab="dashboard" userRole="driver" />
    </div>
  )
}
