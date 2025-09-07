"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { MapComponent } from "@/components/map-component"
import { PassengerLayout } from "@/components/passenger-layout"
import { MapPin, Users, Car, Clock, DollarSign, Bike, Truck } from "lucide-react"

export default function BookRidePage() {
  const [step, setStep] = useState(1)
  const [rideDetails, setRideDetails] = useState({
    pickup: "",
    destination: "",
    vehicleType: "",
    rideType: "",
    scheduledTime: "",
  })

  const vehicleOptions = [
    {
      id: "bike",
      name: "Bike",
      description: "Fast motorcycle ride",
      basePrice: 8.5,
      eta: "3-5 min",
      icon: Bike,
      features: ["Quick arrival", "Beat traffic", "Affordable"],
    },
    {
      id: "keke",
      name: "Keke (Tricycle)",
      description: "Affordable 3-wheeler",
      basePrice: 10.0,
      eta: "5-8 min",
      icon: Truck,
      features: ["Budget friendly", "Local favorite", "Compact"],
    },
    {
      id: "car",
      name: "Car",
      description: "Comfortable 4-seater",
      basePrice: 12.5,
      eta: "5-10 min",
      icon: Car,
      features: ["Air conditioning", "Comfortable", "Safe"],
    },
  ]

  const rideTypeOptions = [
    {
      id: "shared",
      name: "Shared Ride",
      description: "Share with others, save money",
      discount: 0,
      icon: Users,
    },
    {
      id: "private",
      name: "Private Ride",
      description: "Just for you",
      discount: 0.5, // 50% more expensive
      icon: Car,
    },
  ]

  const calculateFare = () => {
    const vehicle = vehicleOptions.find((v) => v.id === rideDetails.vehicleType)
    const rideType = rideTypeOptions.find((r) => r.id === rideDetails.rideType)

    if (!vehicle || !rideType) return 0

    const basePrice = vehicle.basePrice
    const multiplier = rideDetails.rideType === "private" ? 1.5 : 1

    return (basePrice * multiplier).toFixed(2)
  }

  const handleLocationSelect = (location: any) => {
    console.log("Location selected:", location)
  }

  const proceedToNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBookRide = async () => {
    try {
      const response = await fetch("/api/rides/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ride_type: rideDetails.rideType,
          vehicle_type: rideDetails.vehicleType,
          pickup_address: rideDetails.pickup,
          pickup_latitude: 40.7128,
          pickup_longitude: -74.006,
          destination_address: rideDetails.destination,
          destination_latitude: 40.7589,
          destination_longitude: -73.9851,
          fare_amount: Number.parseFloat(calculateFare()),
          scheduled_time: rideDetails.scheduledTime !== "now" ? rideDetails.scheduledTime : null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert("Ride booked successfully!")
        // Redirect to ride tracking page
      } else {
        alert(result.error || "Failed to book ride")
      }
    } catch (error) {
      console.error("Booking error:", error)
      alert("Failed to book ride")
    }
  }

  return (
    <PassengerLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 4 && <div className={`w-16 h-1 mx-2 ${step > stepNum ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Location Selection */}
        {step === 1 && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Where to?</CardTitle>
                <CardDescription>Enter your pickup and destination</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup">Pickup Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                    <Input
                      id="pickup"
                      placeholder="Enter pickup location"
                      className="pl-10"
                      value={rideDetails.pickup}
                      onChange={(e) => setRideDetails((prev) => ({ ...prev, pickup: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-red-600" />
                    <Input
                      id="destination"
                      placeholder="Enter destination"
                      className="pl-10"
                      value={rideDetails.destination}
                      onChange={(e) => setRideDetails((prev) => ({ ...prev, destination: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Schedule (Optional)</Label>
                  <Select
                    value={rideDetails.scheduledTime}
                    onValueChange={(value) => setRideDetails((prev) => ({ ...prev, scheduledTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ride now or schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Ride Now</SelectItem>
                      <SelectItem value="15min">In 15 minutes</SelectItem>
                      <SelectItem value="30min">In 30 minutes</SelectItem>
                      <SelectItem value="1hour">In 1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={proceedToNext}
                  className="w-full"
                  disabled={!rideDetails.pickup || !rideDetails.destination}
                >
                  Continue
                </Button>
              </CardContent>
            </Card>

            <MapComponent
              pickup={rideDetails.pickup}
              destination={rideDetails.destination}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        )}

        {/* Step 2: Vehicle Type Selection */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose your vehicle</CardTitle>
              <CardDescription>Select the type of vehicle for your ride</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {vehicleOptions.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    rideDetails.vehicleType === vehicle.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setRideDetails((prev) => ({ ...prev, vehicleType: vehicle.id }))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <vehicle.icon className="h-8 w-8 text-gray-600" />
                      <div>
                        <h3 className="font-medium">{vehicle.name}</h3>
                        <p className="text-sm text-gray-600">{vehicle.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {vehicle.eta}
                          </span>
                          <div className="flex gap-1">
                            {vehicle.features.map((feature, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">From ${vehicle.basePrice}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={proceedToNext} className="flex-1" disabled={!rideDetails.vehicleType}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Ride Type Selection */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose ride type</CardTitle>
              <CardDescription>Select shared or private ride</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rideTypeOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    rideDetails.rideType === option.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setRideDetails((prev) => ({ ...prev, rideType: option.id }))}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <option.icon className="h-6 w-6 text-gray-600" />
                      <div>
                        <h3 className="font-medium">{option.name}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                    {option.id === "shared" && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Save Money
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={proceedToNext} className="flex-1" disabled={!rideDetails.rideType}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm your ride</CardTitle>
              <CardDescription>Review your ride details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Pickup</p>
                    <p className="text-sm text-gray-600">{rideDetails.pickup}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Destination</p>
                    <p className="text-sm text-gray-600">{rideDetails.destination}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {vehicleOptions.find((v) => v.id === rideDetails.vehicleType)?.icon && (
                    <div className="h-5 w-5 text-blue-600">
                      {vehicleOptions.find((v) => v.id === rideDetails.vehicleType)!.icon}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">Vehicle & Ride Type</p>
                    <p className="text-sm text-gray-600">
                      {vehicleOptions.find((v) => v.id === rideDetails.vehicleType)?.name} •{" "}
                      {rideTypeOptions.find((r) => r.id === rideDetails.rideType)?.name}
                    </p>
                  </div>
                </div>

                {rideDetails.scheduledTime && rideDetails.scheduledTime !== "now" && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Scheduled</p>
                      <p className="text-sm text-gray-600">{rideDetails.scheduledTime}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Fare</span>
                <span className="text-2xl font-bold">${calculateFare()}</span>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleBookRide} className="flex-1">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Book Ride
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PassengerLayout>
  )
}
