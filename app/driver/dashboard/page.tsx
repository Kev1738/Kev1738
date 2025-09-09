"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Car, MapPin, Clock, DollarSign, Star, Navigation, Phone, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { DriverLayout } from "@/components/driver-layout"

export default function DriverDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)
  const [currentRide, setCurrentRide] = useState<any>(null)
  const [rideRequests, setRideRequests] = useState([
    {
      id: "REQ001",
      passenger: "Sarah Johnson",
      pickup: "123 Main St, Lagos Island",
      destination: "456 Oak Ave, Victoria Island",
      distance: "2.5 km",
      fare: 1875,
      type: "private",
    },
    {
      id: "REQ002",
      passenger: "Mike Chen",
      pickup: "789 Pine St, Ikeja",
      destination: "321 Elm St, Lekki",
      distance: "1.8 km",
      fare: 1250,
      type: "shared",
    },
  ])
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing user data:", error)
        router.push("/auth/login")
      }
    } else {
      router.push("/auth/login")
    }
    setLoading(false)
  }, [router])

  const acceptRide = (request: any) => {
    setCurrentRide({
      ...request,
      status: "accepted",
      eta: "8 mins",
    })
    setRideRequests((prev) => prev.filter((r) => r.id !== request.id))
  }

  const completeRide = () => {
    setCurrentRide(null)
    // Add to earnings/history
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <DriverLayout>
      <div className="space-y-6">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Driver Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.full_name}!</p>
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
              <span className="font-medium">{isOnline ? "You're online and ready for rides" : "You're offline"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Current Ride */}
        {currentRide && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                Current Ride - {currentRide.id}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{currentRide.passenger}</p>
                  <p className="text-sm text-gray-600">{currentRide.type} ride</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary">ETA: {currentRide.eta}</Badge>
                  <p className="text-lg font-bold mt-1">₦{currentRide.fare}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{currentRide.pickup}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
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
                <Button size="sm" onClick={completeRide}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Ride
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ride Requests */}
        {isOnline && !currentRide && rideRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ride Requests</CardTitle>
              <CardDescription>New ride requests in your area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rideRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{request.passenger}</p>
                      <Badge variant="outline">{request.type}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₦{request.fare}</p>
                      <p className="text-sm text-gray-600">{request.distance}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{request.pickup}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="text-sm">{request.destination}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => acceptRide(request)} className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRideRequests((prev) => prev.filter((r) => r.id !== request.id))}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Today's Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₦12,750</p>
              <p className="text-sm text-gray-600">8 rides completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-gray-600">Based on 156 rides</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Online Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">6h 23m</p>
              <p className="text-sm text-gray-600">Today</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DriverLayout>
  )
}
