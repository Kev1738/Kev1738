"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Clock, Star, Search, Filter, Calendar, Download } from "lucide-react"
import { PassengerLayout } from "@/components/passenger-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useSession } from "@/hooks/use-session"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorAlert } from "@/components/error-alert"

export default function PassengerHistoryPage() {
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
      ride.destination_address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate summary stats
  const completedRides = rides.filter((ride) => ride.status === "completed")
  const totalSpent = completedRides.reduce((sum, ride) => sum + (ride.fare_amount || 0), 0)
  const cancelledRides = rides.filter((ride) => ride.status === "cancelled").length

  if (!session) return null

  return (
    <AuthGuard requiredRole="passenger">
      <PassengerLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Trip History</h1>
              <p className="text-gray-600">View all your past rides and receipts</p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div>
                    <p className="text-2xl font-bold">{rides.length}</p>
                    <p className="text-xs text-muted-foreground">Total Trips</p>
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
                    <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
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

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Trips</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
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
                  <LoadingSpinner size="lg" text="Loading trip history..." />
                </div>
              )}

              {/* Rides List */}
              {!loading && filteredRides.length === 0 && !error && (
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
                            {ride.driver_profiles && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{ride.driver_profiles.rating}</span>
                              </div>
                            )}
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

                          {ride.driver_profiles && (
                            <div className="flex items-start gap-3">
                              <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                <span className="text-xs font-medium text-blue-600">D</span>
                              </div>
                              <div>
                                <p className="font-medium">Driver</p>
                                <p className="text-sm text-gray-600">
                                  {ride.driver_profiles.users?.full_name || "Unknown"}
                                </p>
                              </div>
                            </div>
                          )}

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
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  Rate Driver
                                </Button>
                                <Button variant="outline" size="sm">
                                  Receipt
                                </Button>
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
                        {loading ? <LoadingSpinner size="sm" /> : "Load More Trips"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              <div className="text-center py-8 text-gray-500">
                Filter functionality for completed trips - same as above but filtered
              </div>
            </TabsContent>

            <TabsContent value="cancelled">
              <div className="text-center py-8 text-gray-500">
                Filter functionality for cancelled trips - same as above but filtered
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PassengerLayout>
    </AuthGuard>
  )
}
