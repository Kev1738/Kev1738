"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Car, MapPin, Clock, DollarSign, Users, Navigation, Phone, Star, Loader2 } from "lucide-react"
import { PassengerLayout } from "@/components/passenger-layout"

export default function PassengerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bookingStep, setBookingStep] = useState(1)
  const [rideType, setRideType] = useState("")
  const [rideSubType, setRideSubType] = useState("")
  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")
  const [currentRide, setCurrentRide] = useState<any>(null)
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

  const handleBookRide = async () => {
    if (!pickup || !destination || !rideType || !rideSubType) return

    try {
      // This would connect to the rides API
      console.log("Booking ride:", { pickup, destination, rideType, rideSubType })

      // Simulate ride booking
      setCurrentRide({
        id: "RIDE" + Date.now(),
        driver: {
          name: "Finding driver...",
          rating: 0,
          car: rideType,
          plate: "---",
          phone: "",
        },
        pickup,
        destination,
        type: rideSubType,
        vehicleType: rideType,
        fare: calculateFare(rideType, rideSubType),
        status: "finding_driver",
        eta: "Finding...",
      })
      setBookingStep(3)
    } catch (error) {
      console.error("Booking error:", error)
      alert("Failed to book ride")
    }
  }

  const calculateFare = (vehicleType: string, rideType: string) => {
    const baseFares = {
      bike: { shared: 8.5, private: 12.0 },
      keke: { shared: 10.0, private: 15.0 },
      car: { shared: 12.5, private: 18.75 },
    }
    return baseFares[vehicleType as keyof typeof baseFares]?.[rideType as keyof typeof baseFares.bike] || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <PassengerLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.full_name}!</h1>
          <p className="text-gray-600">Where would you like to go today?</p>
        </div>

        {/* Current Ride Status */}
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
                  <p className="font-medium">{currentRide.driver.name}</p>
                  <p className="text-sm text-gray-600">
                    {currentRide.driver.car} • {currentRide.driver.plate}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{currentRide.driver.rating}</span>
                  </div>
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
                  Share Location
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Driver
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Interface */}
        {!currentRide && (
          <Card>
            <CardHeader>
              <CardTitle>Book a Ride</CardTitle>
              <CardDescription>Enter your pickup and destination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookingStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="pickup">Pickup Location</Label>
                    <Input
                      id="pickup"
                      placeholder="Enter pickup location"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      placeholder="Enter destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Vehicle Type</Label>
                    <Select value={rideType} onValueChange={setRideType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <div>
                              <p>Car</p>
                              <p className="text-xs text-gray-500">Comfortable 4-seater</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="keke">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <div>
                              <p>Keke (Tricycle)</p>
                              <p className="text-xs text-gray-500">Affordable 3-wheeler</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="bike">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <div>
                              <p>Bike</p>
                              <p className="text-xs text-gray-500">Fast motorcycle ride</p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ride Type</Label>
                    <Select value={rideSubType} onValueChange={setRideSubType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ride type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shared">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <div>
                              <p>Shared Ride</p>
                              <p className="text-xs text-gray-500">Save money, share the ride</p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <div>
                              <p>Private Ride</p>
                              <p className="text-xs text-gray-500">Just for you</p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => setBookingStep(2)}
                    className="w-full"
                    disabled={!pickup || !destination || !rideType}
                  >
                    Find Rides
                  </Button>
                </>
              )}

              {bookingStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Finding nearby drivers...</p>
                  </div>
                  <Button onClick={handleBookRide} className="w-full">
                    Confirm Booking
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Trips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Downtown to Airport</p>
                    <p className="text-sm text-gray-600">Yesterday, 2:30 PM</p>
                  </div>
                  <span className="font-bold">₦2,450</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Home to Office</p>
                    <p className="text-sm text-gray-600">Dec 15, 8:15 AM</p>
                  </div>
                  <span className="font-bold">₦1,275</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment & Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Wallet Balance</span>
                  <span className="font-bold text-green-600">₦5,000.00</span>
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Add Funds
                </Button>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Payment Methods
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PassengerLayout>
  )
}
