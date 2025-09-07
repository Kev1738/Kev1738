"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, Star, Search, Filter, Calendar } from "lucide-react"
import { PassengerLayout } from "@/components/passenger-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useSession } from "@/hooks/use-session"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorAlert } from "@/components/error-alert"

export default function PassengerTripsPage() {
  const { session } = useSession()
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (session) {
      loadTrips()
    }
  }, [session, statusFilter])

  const loadTrips = async (loadMore = false) => {
    try {
      setLoading(true)
      setError(null)

      const currentPage = loadMore ? page + 1 : 0
      const params = new URLSearchParams({
        limit: "10",
        offset: (currentPage * 10).toString(),
      })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      const response = await fetch(`/api/rides/history?${params}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to load trips")
      }

      const result = await response.json()

      if (result.success) {
        if (loadMore) {
          setTrips((prev) => [...prev, ...result.rides])
          setPage(currentPage)
        } else {
          setTrips(result.rides)
          setPage(0)
        }
        setHasMore(result.rides.length === 10)
      } else {
        throw new Error(result.error || "Failed to load trips")
      }
    } catch (err) {
      console.error("Load trips error:", err)
      setError(err instanceof Error ? err.message : "Failed to load trips")
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
      case "accepted":
        return "bg-yellow-100 text-yellow-800"
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

  const filteredTrips = trips.filter(
    (trip) =>
      trip.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination_address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (!session) return null

  return (
    <AuthGuard requiredRole="passenger">
      <PassengerLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">My Trips</h1>
            <p className="text-gray-600">View your ride history and trip details</p>
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
                      <SelectItem value="all">All Trips</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error State */}
          {error && <ErrorAlert message={error} onRetry={() => loadTrips()} />}

          {/* Loading State */}
          {loading && trips.length === 0 && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading your trips..." />
            </div>
          )}

          {/* Trips List */}
          {!loading && filteredTrips.length === 0 && !error && (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "You haven't taken any rides yet"}
                </p>
              </CardContent>
            </Card>
          )}

          {filteredTrips.length > 0 && (
            <div className="space-y-4">
              {filteredTrips.map((trip) => (
                <Card key={trip.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(trip.status)}>
                            {trip.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{trip.vehicle_type}</Badge>
                          <Badge variant="outline">{trip.ride_type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(trip.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${trip.fare_amount}</p>
                        {trip.driver_profiles && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{trip.driver_profiles.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Pickup</p>
                          <p className="text-sm text-gray-600">{trip.pickup_address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Destination</p>
                          <p className="text-sm text-gray-600">{trip.destination_address}</p>
                        </div>
                      </div>

                      {trip.driver_profiles && (
                        <div className="flex items-start gap-3">
                          <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-xs font-medium text-blue-600">D</span>
                          </div>
                          <div>
                            <p className="font-medium">Driver</p>
                            <p className="text-sm text-gray-600">
                              {trip.driver_profiles.users?.full_name || "Unknown"}
                            </p>
                          </div>
                        </div>
                      )}

                      {trip.vehicles && (
                        <div className="flex items-start gap-3">
                          <div className="h-5 w-5 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-xs font-medium text-purple-600">V</span>
                          </div>
                          <div>
                            <p className="font-medium">Vehicle</p>
                            <p className="text-sm text-gray-600">
                              {trip.vehicles.color} {trip.vehicles.make} {trip.vehicles.model} •{" "}
                              {trip.vehicles.plate_number}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {trip.status === "completed" && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Completed on {formatDate(trip.completed_at || trip.created_at)}</span>
                          </div>
                          <Button variant="outline" size="sm">
                            Rate Trip
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Load More Button */}
              {hasMore && !loading && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => loadTrips(true)} disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : "Load More Trips"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </PassengerLayout>
    </AuthGuard>
  )
}
