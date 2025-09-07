"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, Star, Search, Filter, Calendar, DollarSign } from "lucide-react"
import { DriverLayout } from "@/components/driver-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useSession } from "@/hooks/use-session"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorAlert } from "@/components/error-alert"

export default function DriverHistoryPage() {
  const { session } = useSession()
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (session) {
      loadRides()
    }
  }, [session, statusFilter])

  const loadRides = async (loadMore = false) => {
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
        throw new Error("Failed to load ride history")
      }

      const result = await response.json()

      if (result.success) {
        if (loadMore) {
          setRides((prev) => [...prev, ...result.rides])
          setPage(currentPage)
        } else {
          setRides(result.rides)
          setPage(0)
        }
        setHasMore(result.rides.length === 10)
      } else {
        throw new Error(result.error || "Failed to load ride history")
      }
    } catch (err) {
      console.error("Load rides error:", err)
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const filteredRides = rides.filter(
    (ride) =>
      ride.pickup_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.destination_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate summary stats
  const completedRides = rides.filter((ride) => ride.status === "completed")
  const totalEarnings = completedRides.reduce((sum, ride) => sum + (ride.fare_amount || 0), 0)
  const cancelledRides = rides.filter((ride) => ride.status === "cancelled").length

  if (!session) return null

  return (
    <AuthGuard requiredRole="driver">
      <DriverLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Ride History</h1>
            <p className="text-gray-600">View your completed rides and earnings</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div>
                    <p className="text-2xl font-bold">{rides.length}</p>
                    <p className="text-xs text-muted-foreground">Total Rides</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div>
                    <p className="text-2xl font-bold">{completedRides.length}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div>
                    <p className="text-2xl font-bold">{cancelledRides}</p>
                    <p className="text-xs text-muted-foreground">Cancelled</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by pickup, destination, or passenger..."
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
                      <SelectItem value="all">All Rides</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error State */}
          {error && <ErrorAlert message={error} onRetry={() => loadRides()} />}

          {/* Loading State */}
          {loading && rides.length === 0 && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading ride history..." />
            </div>
          )}

          {/* Rides List */}
          {!loading && filteredRides.length === 0 && !error && (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "You haven't completed any rides yet"}
                </p>
              </CardContent>
            </Card>
          )}

          {filteredRides.length > 0 && (
            <div className="space-y-4">
              {filteredRides.map((ride) => (
                <Card key={ride.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(ride.status)}>
                            {ride.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{ride.vehicle_type}</Badge>
                          <Badge variant="outline">{ride.ride_type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(ride.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatCurrency(ride.fare_amount)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Earned</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Pickup</p>
                          <p className="text-sm text-gray-600">{ride.pickup_address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Destination</p>
                          <p className="text-sm text-gray-600">{ride.destination_address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-medium text-blue-600">P</span>
                        </div>
                        <div>
                          <p className="font-medium">Passenger</p>
                          <p className="text-sm text-gray-600">{ride.users?.full_name || "Unknown"}</p>
                        </div>
                      </div>

                      {ride.vehicles && (
                        <div className="flex items-start gap-3">
                          <div className="h-5 w-5 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-xs font-medium text-purple-600">V</span>
                          </div>
                          <div>
                            <p className="font-medium">Vehicle</p>
                            <p className="text-sm text-gray-600">
                              {ride.vehicles.color} {ride.vehicles.make} {ride.vehicles.model} •{" "}
                              {ride.vehicles.plate_number}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {ride.status === "completed" && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Completed on {formatDate(ride.completed_at || ride.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">Rate Passenger</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {ride.status === "cancelled" && ride.cancellation_reason && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-red-600">
                          <strong>Cancellation reason:</strong> {ride.cancellation_reason}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Load More Button */}
              {hasMore && !loading && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => loadRides(true)} disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : "Load More Rides"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DriverLayout>
    </AuthGuard>
  )
}
