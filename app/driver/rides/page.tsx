"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, MapPin, Clock, Phone, Navigation, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { DriverLayout } from "@/components/driver-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useSession } from "@/hooks/use-session"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorAlert } from "@/components/error-alert"

export default function DriverRidesPage() {
  const { session } = useSession()
  const [activeRides, setActiveRides] = useState<any[]>([])
  const [rideRequests, setRideRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      loadRides()
      // Set up polling for new ride requests
      const interval = setInterval(loadRides, 10000) // Poll every 10 seconds
      return () => clearInterval(interval)
    }
  }, [session])

  const loadRides = async () => {
    try {
      setError(null)

      const response = await fetch("/api/rides/active", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to load rides")
      }

      const result = await response.json()

      if (result.success) {
        // Separate active rides from pending requests
        const active = result.rides.filter((ride: any) =>
          ["accepted", "driver_arrived", "in_progress"].includes(ride.status),
        )
        const requests = result.rides.filter((ride: any) => ride.status === "pending")

        setActiveRides(active)
        setRideRequests(requests)
      } else {
        throw new Error(result.error || "Failed to load rides")
      }
    } catch (err) {
      console.error("Load rides error:", err)
      setError(err instanceof Error ? err.message : "Failed to load rides")
    } finally {
      setLoading(false)
    }
  }

  const handleRideAction = async (rideId: string, action: string, reason?: string) => {
    try {
      setActionLoading(rideId)

      const response = await fetch(`/api/rides/${rideId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action, reason }),
        credentials: "include",
      })

      const result = await response.json()

      if (result.success) {
        await loadRides() // Refresh the rides list
      } else {
        throw new Error(result.error || `Failed to ${action} ride`)
      }
    } catch (err) {
      console.error(`${action} ride error:`, err)
      alert(err instanceof Error ? err.message : `Failed to ${action} ride`)
    } finally {
      setActionLoading(null)
    }
  }

  const acceptRide = (rideId: string) => handleRideAction(rideId, "accepted")
  const startRide = (rideId: string) => handleRideAction(rideId, "in_progress")
  const completeRide = (rideId: string) => handleRideAction(rideId, "completed")
  const cancelRide = (rideId: string) => {
    const reason = prompt("Please provide a reason for cancellation:")
    if (reason) {
      handleRideAction(rideId, "cancelled", reason)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "driver_arrived":
        return "bg-purple-100 text-purple-800"
      case "in_progress":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!session) return null

  return (
    <AuthGuard requiredRole="driver">
      <DriverLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Active Rides</h1>
            <p className="text-gray-600">Manage your current rides and requests</p>
          </div>

          {/* Error State */}
          {error && <ErrorAlert message={error} onRetry={loadRides} />}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading rides..." />
            </div>
          )}

          {/* Rides Content */}
          {!loading && (
            <Tabs defaultValue="active" className="space-y-4">
              <TabsList>
                <TabsTrigger value="active">Active Rides ({activeRides.length})</TabsTrigger>
                <TabsTrigger value="requests">New Requests ({rideRequests.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {activeRides.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No active rides</h3>
                      <p className="text-gray-600">You don't have any active rides at the moment</p>
                    </CardContent>
                  </Card>
                ) : (
                  activeRides.map((ride) => (
                    <Card key={ride.id} className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-blue-600" />
                            <span>Ride #{ride.id.slice(-8)}</span>
                          </div>
                          <Badge className={getStatusColor(ride.status)}>
                            {ride.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Passenger: {ride.users?.full_name || "Unknown"} • ${ride.fare_amount}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{ride.pickup_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span className="text-sm">{ride.destination_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">Requested at {formatDate(ride.created_at)}</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline">
                            <Navigation className="h-4 w-4 mr-2" />
                            Navigate
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Passenger
                          </Button>

                          {ride.status === "accepted" && (
                            <Button size="sm" onClick={() => startRide(ride.id)} disabled={actionLoading === ride.id}>
                              {actionLoading === ride.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Start Ride
                                </>
                              )}
                            </Button>
                          )}

                          {ride.status === "in_progress" && (
                            <Button
                              size="sm"
                              onClick={() => completeRide(ride.id)}
                              disabled={actionLoading === ride.id}
                            >
                              {actionLoading === ride.id ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete Ride
                                </>
                              )}
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelRide(ride.id)}
                            disabled={actionLoading === ride.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                {rideRequests.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No new requests</h3>
                      <p className="text-gray-600">New ride requests will appear here</p>
                    </CardContent>
                  </Card>
                ) : (
                  rideRequests.map((request) => (
                    <Card key={request.id} className="border-yellow-200 bg-yellow-50">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <span>New Request</span>
                          </div>
                          <Badge className={getStatusColor(request.status)}>PENDING</Badge>
                        </CardTitle>
                        <CardDescription>
                          Passenger: {request.users?.full_name || "Unknown"} • ${request.fare_amount}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{request.pickup_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span className="text-sm">{request.destination_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">Requested {formatDate(request.created_at)}</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => acceptRide(request.id)}
                            disabled={actionLoading === request.id}
                            className="flex-1"
                          >
                            {actionLoading === request.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept Ride
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRideAction(request.id, "cancelled", "Driver declined")}
                            disabled={actionLoading === request.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DriverLayout>
    </AuthGuard>
  )
}
