"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Search, Filter, Phone, Navigation, Loader2 } from "lucide-react"
import { PassengerLayout } from "@/components/passenger-layout"

export default function PassengerTripsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState([
    {
      id: "TRIP001",
      status: "in_progress",
      pickup: "Lagos Island, Lagos",
      destination: "Victoria Island, Lagos",
      driver: {
        name: "Ahmed Musa",
        rating: 4.8,
        phone: "+234 801 234 5678",
        vehicle: "Toyota Camry",
        plate: "ABC 123 XY",
      },
      fare: 2500,
      estimatedTime: "12 mins",
      bookingTime: "2024-01-15T14:30:00Z",
    },
    {
      id: "TRIP002",
      status: "scheduled",
      pickup: "Ikeja, Lagos",
      destination: "Lekki, Lagos",
      fare: 3200,
      scheduledTime: "2024-01-15T18:00:00Z",
      bookingTime: "2024-01-15T13:45:00Z",
    },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || trip.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <PassengerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Trips</h1>
          <p className="text-gray-600">View and manage your current and upcoming rides</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by pickup or destination..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trips List */}
        <div className="space-y-4">
          {filteredTrips.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "You don't have any trips yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTrips.map((trip) => (
              <Card key={trip.id} className={trip.status === "in_progress" ? "border-blue-200 bg-blue-50" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Trip {trip.id}</CardTitle>
                    <Badge className={getStatusColor(trip.status)}>{trip.status.replace("_", " ").toUpperCase()}</Badge>
                  </div>
                  <CardDescription>Booked on {formatTime(trip.bookingTime)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Route */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">From:</span>
                      <span className="text-sm">{trip.pickup}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">To:</span>
                      <span className="text-sm">{trip.destination}</span>
                    </div>
                  </div>

                  {/* Driver Info (for in-progress trips) */}
                  {trip.status === "in_progress" && trip.driver && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Driver Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <p className="font-medium">{trip.driver.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{trip.driver.rating}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Vehicle:</span>
                          <p className="font-medium">{trip.driver.vehicle}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Plate:</span>
                          <p className="font-medium">{trip.driver.plate}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trip Details */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">₦{trip.fare.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Fare</p>
                      </div>
                      {trip.status === "in_progress" && trip.estimatedTime && (
                        <div className="text-center">
                          <p className="text-lg font-bold">{trip.estimatedTime}</p>
                          <p className="text-xs text-gray-600">ETA</p>
                        </div>
                      )}
                      {trip.status === "scheduled" && trip.scheduledTime && (
                        <div className="text-center">
                          <p className="text-sm font-medium">{formatTime(trip.scheduledTime)}</p>
                          <p className="text-xs text-gray-600">Scheduled</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {trip.status === "in_progress" && (
                        <>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Driver
                          </Button>
                          <Button size="sm" variant="outline">
                            <Navigation className="h-4 w-4 mr-2" />
                            Track
                          </Button>
                        </>
                      )}
                      {trip.status === "scheduled" && (
                        <>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive">
                            Cancel
                          </Button>
                        </>
                      )}
                      {(trip.status === "completed" || trip.status === "cancelled") && (
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PassengerLayout>
  )
}
