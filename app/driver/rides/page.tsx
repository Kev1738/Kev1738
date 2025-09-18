"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { MapPin, Clock, Star, Phone, Navigation, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { DriverLayout } from "@/components/driver-layout"

export default function DriverRidesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)
  const [currentRide, setCurrentRide] = useState<any>(null)
  const [rideRequests, setRideRequests] = useState([
    {
      id: "REQ001",
      passenger: {
        name: "Sarah Johnson",
        rating: 4.9,
        phone: "+234 801 234 5678",
      },
      pickup: "123 Main St, Lagos Island",
      destination: "456 Oak Ave, Victoria Island",
      distance: "2.5 km",
      fare: 1875,
      type: "private",
      estimatedDuration: "15 mins",
      requestTime: "2024-01-15T14:30:00Z",
    },
    {
      id: "REQ002",
      passenger: {
        name: "Mike Chen",
        rating: 4.7,
        phone: "+234 802 345 6789",
      },
      pickup: "789 Pine St, Ikeja",
      destination: "321 Elm St, Lekki",
      distance: "1.8 km",
      fare: 1250,
      type: "shared",
      estimatedDuration: "12 mins",
      requestTime: "2024-01-15T14:32:00Z",
    },
  ])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const acceptRide = (request: any) => {
    setCurrentRide({
      ...request,
      status: "accepted",
      eta: "8 mins",
      acceptedAt: new Date().toISOString(),
    })
    setRideRequests((prev) => prev.filter((r) => r.id !== request.id))
  }

  const declineRide = (requestId: string) => {
    setRideRequests((prev) => prev.filter((r) => r.id !== requestId))
  }

  const updateRideStatus = (status: string) => {
    if (currentRide) {
      setCurrentRide({
        ...currentRide,
        status,
        updatedAt: new Date().toISOString(),
      })
    }
  }

  const completeRide = () => {
    setCurrentRide(null)
    // In real app, this would update earnings and history
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <DriverLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Active Rides</h1>
            <p className="text-gray-600">Manage your current rides and requests</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{isOnline ? "Online" : "Offline"}</span>
            <Switch checked={isOnline} onCheckedChange={setIsOnline} />
          </div>
        </div>

        {/* Online Status */}
        <Card className={isOnline ? "border-green-200 bg-green-50" : "border-gray-200"}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="font-medium">
                {isOnline ? "You're online and ready for rides" : "You're offline - Turn on to receive ride requests"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Current Ride */}
        {currentRide && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                Current Ride - {currentRide.id}
              </CardTitle>
              <CardDescription>Accepted at {formatTime(currentRide.acceptedAt)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{currentRide.passenger.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{currentRide.passenger.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {currentRide.type} ride • {currentRide.distance}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">
                    {currentRide.status === "accepted" ? `ETA: ${currentRide.eta}` : currentRide.status.toUpperCase()}
                  </Badge>
                  <p className="text-lg font-bold mt-1">₦{currentRide.fare}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Pickup:</span>
                  <span className="text-sm">{currentRide.pickup}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Destination:</span>
                  <span className="text-sm">{currentRide.destination}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Passenger
                </Button>

                {currentRide.status === "accepted" && (
                  <Button size="sm" onClick={() => updateRideStatus("en_route")}>
                    Start Trip
                  </Button>
                )}

                {currentRide.status === "en_route" && (
                  <Button size="sm" onClick={() => updateRideStatus("arrived")}>
                    Arrived
                  </Button>
                )}

                {currentRide.status === "arrived" && (
                  <Button size="sm" onClick={() => updateRideStatus("in_progress")}>
                    Start Ride
                  </Button>
                )}

                {currentRide.status === "in_progress" && (
                  <Button size="sm" onClick={completeRide}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Ride
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ride Requests */}
        {isOnline && !currentRide && (
          <Card>
            <CardHeader>
              <CardTitle>Ride Requests</CardTitle>
              <CardDescription>
                {rideRequests.length > 0
                  ? `${rideRequests.length} new ride request${rideRequests.length > 1 ? "s" : ""} in your area`
                  : "No ride requests at the moment"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rideRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Waiting for ride requests...</p>
                  <p className="text-sm mt-2">Stay online to receive requests from passengers</p>
                </div>
              ) : (
                rideRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{request.passenger.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{request.passenger.rating}</span>
                          </div>
                          <Badge variant="outline">{request.type}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">₦{request.fare}</p>
                        <p className="text-sm text-gray-600">
                          {request.distance} • {request.estimatedDuration}
                        </p>
                        <p className="text-xs text-gray-500">Requested {formatTime(request.requestTime)}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Pickup:</span>
                        <span className="text-sm">{request.pickup}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Destination:</span>
                        <span className="text-sm">{request.destination}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => acceptRide(request)} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept Ride
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => declineRide(request.id)}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Offline Message */}
        {!isOnline && (
          <Card>
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">You're currently offline</h3>
              <p className="text-gray-600 mb-4">
                Turn on your online status to start receiving ride requests from passengers in your area.
              </p>
              <Button onClick={() => setIsOnline(true)}>Go Online</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DriverLayout>
  )
}
