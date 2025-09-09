"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthGuard } from "@/components/auth-guard"
import { MobileHeader } from "@/components/mobile-header"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { MobileQuickActions } from "@/components/mobile-quick-actions"
import { MobileRideCard } from "@/components/mobile-ride-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorAlert } from "@/components/error-alert"
import { useSession } from "@/hooks/use-session"
import { Car, Clock, DollarSign, Star } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PassengerDashboardPage() {
  const { session } = useSession()
  const router = useRouter()
  const [activeRides, setActiveRides] = useState([])
  const [recentRides, setRecentRides] = useState([])
  const [stats, setStats] = useState({
    activeRides: 0,
    completedRides: 0,
    totalSpent: 0,
    averageRating: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      loadDashboardData()
    }
  }, [session])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load active rides
      const activeRidesResponse = await fetch("/api/rides/active")
      const activeRidesResult = await activeRidesResponse.json()
      if (activeRidesResponse.ok && activeRidesResult.success) {
        setActiveRides(activeRidesResult.data)
      }

      // Load recent rides
      const recentRidesResponse = await fetch("/api/rides/history?limit=3")
      const recentRidesResult = await recentRidesResponse.json()
      if (recentRidesResponse.ok && recentRidesResult.success) {
        setRecentRides(recentRidesResult.data.rides)

        // Calculate stats
        const totalRides = recentRidesResult.data.total || 0
        const totalSpent = recentRidesResult.data.rides.reduce((sum: number, ride: any) => sum + ride.fare, 0)

        setStats({
          activeRides: activeRidesResult.data?.length || 0,
          completedRides: totalRides,
          totalSpent,
          averageRating: 4.8, // This would come from ratings API
        })
      }
    } catch (err) {
      console.error("Load dashboard data error:", err)
      setError(err instanceof Error ? err.message : "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case "book_ride":
        router.push("/passenger/book-ride")
        break
      case "track_ride":
        router.push("/passenger/trips")
        break
      case "payment":
        router.push("/passenger/payment")
        break
      case "history":
        router.push("/passenger/history")
        break
      default:
        console.log("Unknown action:", actionId)
    }
  }

  const handleRideAction = (action: string, rideId: string) => {
    switch (action) {
      case "track":
        router.push(`/passenger/trips/${rideId}`)
        break
      case "call":
        // Implement call functionality
        console.log("Call driver for ride:", rideId)
        break
      case "message":
        // Implement messaging functionality
        console.log("Message driver for ride:", rideId)
        break
      default:
        console.log("Unknown ride action:", action)
    }
  }

  if (!session) return null

  return (
    <AuthGuard requiredRole="passenger">
      <div className="min-h-screen bg-gray-50 pb-20">
        <MobileHeader title="Dashboard" subtitle={`Welcome back, ${session.full_name?.split(" ")[0]}`} />

        <div className="p-4 space-y-6">
          {/* Error State */}
          {error && <ErrorAlert message={error} onRetry={loadDashboardData} />}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
          )}

          {/* Dashboard Content */}
          {!loading && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <Car className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeRides}</p>
                        <p className="text-sm text-gray-500">Active Rides</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.completedRides}</p>
                        <p className="text-sm text-gray-500">Total Trips</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(0)}</p>
                        <p className="text-sm text-gray-500">Total Spent</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-500 p-2 rounded-lg">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                        <p className="text-sm text-gray-500">Your Rating</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
                <MobileQuickActions userRole="passenger" stats={stats} onAction={handleQuickAction} />
              </div>

              {/* Active Rides */}
              {activeRides.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">Active Rides</h2>
                    <Badge variant="secondary">{activeRides.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {activeRides.map((ride: any) => (
                      <MobileRideCard key={ride.id} ride={ride} userRole="passenger" onAction={handleRideAction} />
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Rides */}
              {recentRides.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Rides</h2>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/passenger/history")}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {recentRides.map((ride: any) => (
                      <MobileRideCard key={ride.id} ride={ride} userRole="passenger" compact={true} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {activeRides.length === 0 && recentRides.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No rides yet</h3>
                    <p className="text-gray-500 mb-4">Book your first ride to get started!</p>
                    <Button onClick={() => router.push("/passenger/book-ride")}>Book a Ride</Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <MobileBottomNav userRole="passenger" />
      </div>
    </AuthGuard>
  )
}
