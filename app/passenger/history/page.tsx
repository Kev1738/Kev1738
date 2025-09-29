"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MapPin, Clock, DollarSign, Car, Calendar, RefreshCw } from "lucide-react"

interface Ride {
  id: string
  pickup_address: string
  destination_address: string
  fare_amount: number
  status: string
  vehicle_type: string
  ride_type: string
  distance_km?: number
  created_at: string
  completed_at?: string
  cancelled_at?: string
}

export default function PassengerHistoryPage() {
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadRides()
  }, [])

  const loadRides = async () => {
    try {
      setLoading(true)
      setError("")

      console.log("🔍 Loading ride history...")

      const response = await fetch("/api/rides/history", {
        method: "GET",
        credentials: "include",
      })

      console.log("📡 Rides API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to load rides")
      }

      const data = await response.json()
      console.log("📡 Rides data:", data)

      if (data.success) {
        setRides(data.data.rides || [])
        console.log("✅ Loaded", data.data.rides?.length || 0, "rides")
      } else {
        throw new Error(data.error || "Failed to load rides")
      }
    } catch (err) {
      console.error("❌ Load rides error:", err)
      setError(err instanceof Error ? err.message : "Failed to load ride history")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your ride history...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Ride History</h1>
        <p className="text-muted-foreground">View all your past rides and trips</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          {rides.length > 0 ? `${rides.length} ride${rides.length === 1 ? "" : "s"} found` : "No rides found"}
        </div>
        <Button onClick={loadRides} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {rides.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No rides yet</h3>
            <p className="text-muted-foreground mb-4">You haven't taken any rides yet. Book your first ride!</p>
            <Button>Book a Ride</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <Card key={ride.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {ride.vehicle_type.charAt(0).toUpperCase() + ride.vehicle_type.slice(1)} Ride
                    </CardTitle>
                    <CardDescription className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(ride.created_at)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(ride.status)}>{ride.status.replace("_", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 mt-1 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Pickup</p>
                        <p className="text-sm text-muted-foreground">{ride.pickup_address}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 mt-1 text-red-600" />
                      <div>
                        <p className="text-sm font-medium">Destination</p>
                        <p className="text-sm text-muted-foreground">{ride.destination_address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Fare</p>
                        <p className="text-lg font-bold">{formatCurrency(ride.fare_amount)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Type</p>
                        <p className="text-sm text-muted-foreground">
                          {ride.vehicle_type} • {ride.ride_type}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {ride.distance_km && (
                  <div className="border-t pt-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium">Distance</p>
                        <p className="text-sm text-muted-foreground">{ride.distance_km} km</p>
                      </div>
                    </div>
                  </div>
                )}

                {ride.completed_at && (
                  <div className="border-t pt-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium">Completed</p>
                        <p className="text-sm text-muted-foreground">{formatDate(ride.completed_at)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {ride.cancelled_at && (
                  <div className="border-t pt-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium">Cancelled</p>
                        <p className="text-sm text-muted-foreground">{formatDate(ride.cancelled_at)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
