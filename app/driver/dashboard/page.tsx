"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Car,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Navigation,
  Phone,
  MessageSquare,
  TrendingUp,
  Wallet,
} from "lucide-react"

interface DriverProfile {
  user_id: string
  email: string
  full_name: string
  phone: string
  profile_image_url: string
  rating: number
  total_rides: number
  total_earnings: number
  is_online: boolean
  status: string
  wallet_balance: number
  vehicles: Array<{
    id: string
    vehicle_type: string
    make: string
    model: string
    color: string
    plate_number: string
  }>
  statistics: {
    today: {
      rides: number
      earnings: number
      avg_duration: number
    }
    week: {
      rides: number
      earnings: number
    }
  }
  active_ride: {
    id: string
    pickup_address: string
    destination_address: string
    fare_amount: number
    status: string
    passenger_name: string
    passenger_phone: string
    special_instructions?: string
  } | null
  available_rides: Array<{
    id: string
    pickup_address: string
    destination_address: string
    fare_amount: number
    distance_km: number
    passenger_name: string
    created_at: string
  }>
  recent_rides: Array<{
    id: string
    pickup_address: string
    destination_address: string
    fare_amount: number
    status: string
    passenger_name: string
    passenger_rating?: number
    completed_at: string
  }>
}

export default function DriverDashboard() {
  const [profile, setProfile] = useState<DriverProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchDriverProfile()
  }, [])

  const fetchDriverProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching driver profile...")

      const response = await fetch("/api/driver/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // Include cookies
      })

      console.log("Driver profile response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Driver profile fetch failed:", response.status, errorText)
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }

      const data = await response.json()
      console.log("Driver profile data:", data)

      if (data.success) {
        setProfile(data.data)
      } else {
        setError(data.error || data.message || "Failed to load profile")
      }
    } catch (err) {
      console.error("Error fetching driver profile:", err)
      setError(err instanceof Error ? err.message : "Failed to load driver profile")
    } finally {
      setLoading(false)
    }
  }

  const toggleOnlineStatus = async () => {
    if (!profile) return

    try {
      setUpdatingStatus(true)

      const response = await fetch("/api/driver/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          is_online: !profile.is_online,
        }),
      })

      if (response.ok) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                is_online: !prev.is_online,
                status: !prev.is_online ? "online" : "offline",
              }
            : null,
        )
      }
    } catch (err) {
      console.error("Error updating online status:", err)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const acceptRide = async (rideId: string) => {
    try {
      const response = await fetch(`/api/rides/${rideId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      })

      if (response.ok) {
        // Refresh profile to get updated ride data
        fetchDriverProfile()
      }
    } catch (err) {
      console.error("Error accepting ride:", err)
    }
  }

  const updateRideStatus = async (rideId: string, status: string) => {
    try {
      const response = await fetch(`/api/rides/${rideId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Refresh profile to get updated ride data
        fetchDriverProfile()
      }
    } catch (err) {
      console.error("Error updating ride status:", err)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading driver dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <Button onClick={fetchDriverProfile} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p>Driver profile not found</p>
              <Button onClick={fetchDriverProfile} className="mt-4">
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "break":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRideStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "accepted":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Profile and Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.profile_image_url || "/placeholder.svg"} />
            <AvatarFallback>
              {profile.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(profile.status)}`} />
              <span className="text-sm text-gray-600 capitalize">{profile.status}</span>
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{profile.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Offline</span>
            <Switch checked={profile.is_online} onCheckedChange={toggleOnlineStatus} disabled={updatingStatus} />
            <span className="text-sm">Online</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Rides</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.statistics.today.rides}</div>
            <p className="text-xs text-muted-foreground">
              {profile.statistics.today.avg_duration > 0 &&
                `Avg ${Math.round(profile.statistics.today.avg_duration)} min`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{profile.statistics.today.earnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">After platform fee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.statistics.week.rides}</div>
            <p className="text-xs text-muted-foreground">₦{profile.statistics.week.earnings.toLocaleString()} earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{profile.wallet_balance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Ride */}
      {profile.active_ride && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Active Ride
              <Badge className={getRideStatusColor(profile.active_ride.status)}>
                {profile.active_ride.status.replace("_", " ")}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Pickup</p>
                <p className="font-medium">{profile.active_ride.pickup_address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Destination</p>
                <p className="font-medium">{profile.active_ride.destination_address}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Passenger</p>
                <p className="font-medium">{profile.active_ride.passenger_name}</p>
                <p className="text-sm text-gray-500">{profile.active_ride.passenger_phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Fare</p>
                <p className="text-xl font-bold">₦{profile.active_ride.fare_amount.toLocaleString()}</p>
              </div>
            </div>

            {profile.active_ride.special_instructions && (
              <div>
                <p className="text-sm text-gray-600">Special Instructions</p>
                <p className="text-sm bg-yellow-50 p-2 rounded">{profile.active_ride.special_instructions}</p>
              </div>
            )}

            <div className="flex gap-2">
              {profile.active_ride.status === "accepted" && (
                <Button onClick={() => updateRideStatus(profile.active_ride!.id, "driver_arrived")} className="flex-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  I've Arrived
                </Button>
              )}
              {profile.active_ride.status === "driver_arrived" && (
                <Button onClick={() => updateRideStatus(profile.active_ride!.id, "in_progress")} className="flex-1">
                  <Car className="h-4 w-4 mr-2" />
                  Start Trip
                </Button>
              )}
              {profile.active_ride.status === "in_progress" && (
                <Button onClick={() => updateRideStatus(profile.active_ride!.id, "completed")} className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Complete Trip
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Rides */}
        <Card>
          <CardHeader>
            <CardTitle>Available Rides</CardTitle>
            <CardDescription>{profile.available_rides.length} rides waiting for drivers</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.available_rides.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No available rides at the moment</p>
            ) : (
              <div className="space-y-4">
                {profile.available_rides.slice(0, 3).map((ride) => (
                  <div key={ride.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{ride.passenger_name}</p>
                        <p className="text-sm text-gray-600">{ride.pickup_address}</p>
                        <p className="text-sm text-gray-600">→ {ride.destination_address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₦{ride.fare_amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{ride.distance_km}km</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">{new Date(ride.created_at).toLocaleTimeString()}</p>
                      <Button size="sm" onClick={() => acceptRide(ride.id)} disabled={!profile.is_online}>
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Rides */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Rides</CardTitle>
            <CardDescription>Your last completed rides</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.recent_rides.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No recent rides</p>
            ) : (
              <div className="space-y-4">
                {profile.recent_rides.slice(0, 5).map((ride) => (
                  <div key={ride.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium">{ride.passenger_name}</p>
                      <p className="text-sm text-gray-600">
                        {ride.pickup_address} → {ride.destination_address}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRideStatusColor(ride.status)}>{ride.status}</Badge>
                        {ride.passenger_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">{ride.passenger_rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₦{ride.fare_amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{new Date(ride.completed_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Information */}
      {profile.vehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="h-5 w-5" />
                    <span className="font-medium capitalize">{vehicle.vehicle_type}</span>
                  </div>
                  <p className="font-medium">
                    {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-gray-600">{vehicle.color}</p>
                  <p className="text-sm font-mono">{vehicle.plate_number}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
