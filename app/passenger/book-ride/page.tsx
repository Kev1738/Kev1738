"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, Users, CreditCard, Navigation } from "lucide-react"
import { EnhancedMap } from "@/components/enhanced-map"
import { SIERRA_LEONE_CONFIG, formatCurrency, calculateFare } from "@/lib/sierra-leone-config"
import { useSession } from "@/hooks/use-session"
import { useRouter } from "next/navigation"

export default function BookRidePage() {
  const { user, loading } = useSession()
  const router = useRouter()
  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState("okada")
  const [paymentMethod, setPaymentMethod] = useState("orange_money")
  const [estimatedFare, setEstimatedFare] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [isBooking, setIsBooking] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          // Default to Freetown center
          setCurrentLocation({ lat: 8.4657, lng: -13.2317 })
        },
      )
    }
  }, [])

  useEffect(() => {
    // Calculate estimated fare when inputs change
    if (pickup && destination) {
      // Simulate distance calculation (in a real app, you'd use Google Maps API)
      const estimatedDistance = Math.random() * 10 + 2 // 2-12 km
      const fare = calculateFare(selectedVehicle, estimatedDistance, 0)
      setEstimatedFare(fare)
      setEstimatedTime(Math.round(estimatedDistance * 3 + 5)) // Rough time estimate
    }
  }, [pickup, destination, selectedVehicle])

  const handleBookRide = async () => {
    if (!pickup || !destination || !selectedVehicle) {
      alert("Please fill in all required fields")
      return
    }

    setIsBooking(true)
    try {
      const response = await fetch("/api/rides/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          pickup_location: pickup,
          destination: destination,
          vehicle_type: selectedVehicle,
          payment_method: paymentMethod,
          estimated_fare: estimatedFare,
        }),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/passenger/ride-tracking/${data.ride.id}`)
      } else {
        alert(data.error || "Failed to book ride")
      }
    } catch (error) {
      console.error("Booking error:", error)
      alert("Failed to book ride. Please try again.")
    } finally {
      setIsBooking(false)
    }
  }

  const popularLocations = [
    "Freetown City Center",
    "Aberdeen Beach",
    "Lumley Beach",
    "Murray Town",
    "Congo Cross",
    "Kissy Street",
    "Wellington",
    "Waterloo",
  ]

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book a Ride</h1>
          <p className="text-gray-600">Get around Sierra Leone safely and affordably</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Form */}
          <div className="space-y-6">
            {/* Location Inputs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Where to?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pickup">Pickup Location</Label>
                  <Input
                    id="pickup"
                    placeholder="Enter pickup location"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {popularLocations.slice(0, 4).map((location) => (
                      <Button
                        key={location}
                        variant="outline"
                        size="sm"
                        onClick={() => setPickup(location)}
                        className="text-xs"
                      >
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    placeholder="Where are you going?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {popularLocations.slice(4, 8).map((location) => (
                      <Button
                        key={location}
                        variant="outline"
                        size="sm"
                        onClick={() => setDestination(location)}
                        className="text-xs"
                      >
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Ride</CardTitle>
                <CardDescription>Select the vehicle type that suits your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {SIERRA_LEONE_CONFIG.vehicleTypes.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedVehicle === vehicle.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedVehicle(vehicle.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{vehicle.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{vehicle.name}</h3>
                              {vehicle.popular && (
                                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{vehicle.description}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {vehicle.capacity} passenger{vehicle.capacity > 1 ? "s" : ""}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                2-5 min away
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{formatCurrency(vehicle.baseFare)}</div>
                          <div className="text-xs text-gray-500">Base fare</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIERRA_LEONE_CONFIG.paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center gap-2">
                          <span>{method.icon}</span>
                          <span>{method.name}</span>
                          {method.primary && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Fare Estimate */}
            {estimatedFare > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Trip Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Estimated Fare:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(estimatedFare)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Time:</span>
                      <span>{estimatedTime} minutes</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Vehicle:</span>
                      <span>{SIERRA_LEONE_CONFIG.vehicleTypes.find((v) => v.id === selectedVehicle)?.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Book Button */}
            <Button
              onClick={handleBookRide}
              disabled={!pickup || !destination || isBooking}
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
            >
              {isBooking ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Booking Ride...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Book Ride - {formatCurrency(estimatedFare)}
                </div>
              )}
            </Button>
          </div>

          {/* Map */}
          <div className="lg:sticky lg:top-4">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                <EnhancedMap
                  center={currentLocation || { lat: 8.4657, lng: -13.2317 }}
                  zoom={12}
                  pickup={pickup}
                  destination={destination}
                  onLocationSelect={(location, type) => {
                    if (type === "pickup") {
                      setPickup(location)
                    } else {
                      setDestination(location)
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
