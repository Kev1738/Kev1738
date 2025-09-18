"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import { MapPin, Clock, DollarSign, Car } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Ride {
  id: string
  pickup_address: string
  destination_address: string
  vehicle_type: "car" | "bike" | "keke"
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled"
  fare: number
  distance_km: number
  duration_minutes: number
  created_at: string
  passenger: {
    full_name: string
    email: string
    phone?: string
  }
  driver?: {
    users: {
      full_name: string
      email: string
    }
    rating: number
  }
  payments?: {
    amount: number
    payment_method: string
    status: string
  }[]
}

export default function AdminRidesPage() {
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchRides = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(statusFilter && { status: statusFilter }),
        ...(vehicleTypeFilter && { vehicle_type: vehicleTypeFilter }),
      })

      const response = await fetch(`/api/admin/rides?${params}`)
      const data = await response.json()

      if (response.ok) {
        setRides(data.rides)
        setTotalPages(data.pagination.totalPages)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch rides",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch rides",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRides()
  }, [page, statusFilter, vehicleTypeFilter])

  const handleUpdateRideStatus = async (rideId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/rides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rideId,
          status: newStatus,
          ...(newStatus === "cancelled" && { cancellation_reason: "Cancelled by admin" }),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: result.message,
        })
        fetchRides()
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ride status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      accepted: "secondary",
      in_progress: "default",
      completed: "default",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>
  }

  const getVehicleTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      car: "default",
      keke: "secondary",
      bike: "outline",
    }
    return <Badge variant={variants[type] || "outline"}>{type.toUpperCase()}</Badge>
  }

  // Calculate stats
  const totalRides = rides.length
  const completedRides = rides.filter((r) => r.status === "completed").length
  const totalRevenue = rides.filter((r) => r.status === "completed").reduce((sum, r) => sum + (r.fare || 0), 0)
  const avgFare = completedRides > 0 ? totalRevenue / completedRides : 0

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Ride Management</h1>
            <p className="text-muted-foreground">Monitor and manage all rides</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRides}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedRides}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Fare</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{avgFare.toFixed(0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Rides Table */}
        <Card>
          <CardHeader>
            <CardTitle>Rides</CardTitle>
            <CardDescription>Monitor all ride activities and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={vehicleTypeFilter || "all"}
                onValueChange={(value) => setVehicleTypeFilter(value === "all" ? "" : value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="keke">Keke</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fare</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading rides...
                      </TableCell>
                    </TableRow>
                  ) : rides.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No rides found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rides.map((ride) => (
                      <TableRow key={ride.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{ride.passenger.full_name}</div>
                            <div className="text-sm text-muted-foreground">{ride.passenger.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {ride.driver ? (
                            <div>
                              <div className="font-medium">{ride.driver.users.full_name}</div>
                              <div className="text-sm text-muted-foreground">
                                Rating: {ride.driver.rating.toFixed(1)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <div className="text-sm font-medium truncate">{ride.pickup_address}</div>
                            <div className="text-sm text-muted-foreground truncate">to {ride.destination_address}</div>
                            {ride.distance_km && (
                              <div className="text-xs text-muted-foreground">
                                {ride.distance_km}km • {ride.duration_minutes}min
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getVehicleTypeBadge(ride.vehicle_type)}</TableCell>
                        <TableCell>{getStatusBadge(ride.status)}</TableCell>
                        <TableCell>{ride.fare ? `₦${ride.fare.toLocaleString()}` : "N/A"}</TableCell>
                        <TableCell>{new Date(ride.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {ride.status === "in_progress" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateRideStatus(ride.id, "completed")}
                              >
                                Complete
                              </Button>
                            )}
                            {["pending", "accepted", "in_progress"].includes(ride.status) && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleUpdateRideStatus(ride.id, "cancelled")}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
