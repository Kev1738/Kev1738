"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import { Search, Car, Users, UserCheck, Star, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Driver {
  id: string
  license_number: string
  vehicle_type: "car" | "bike" | "keke"
  is_online: boolean
  rating: number
  total_rides: number
  total_earnings: number
  created_at: string
  users: {
    id: string
    full_name: string
    email: string
    phone?: string
    status: string
    is_active: boolean
  }
  vehicles?: {
    make: string
    model: string
    year: number
    color: string
    plate_number: string
  }[]
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchDrivers = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(vehicleTypeFilter && { vehicle_type: vehicleTypeFilter }),
      })

      const response = await fetch(`/api/admin/drivers?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setDrivers(Array.isArray(data.data?.drivers) ? data.data.drivers : [])
        setTotalPages(data.data?.pagination?.totalPages || 1)
      } else {
        throw new Error(data.error || "Failed to fetch drivers")
      }
    } catch (error) {
      console.error("Fetch drivers error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch drivers"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setDrivers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [page, search, statusFilter, vehicleTypeFilter])

  const handleToggleStatus = async (driverId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/drivers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: driverId,
          action: "toggle_status",
          is_online: !currentStatus,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: result.message || "Driver status updated successfully",
        })
        fetchDrivers()
      } else {
        throw new Error(result.error || "Failed to update driver status")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update driver status"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleApproveDriver = async (driverId: string, userId: string) => {
    try {
      const response = await fetch("/api/admin/drivers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: driverId,
          action: "approve",
          user_id: userId,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: result.message || "Driver approved successfully",
        })
        fetchDrivers()
      } else {
        throw new Error(result.error || "Failed to approve driver")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to approve driver"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (isOnline: boolean) => {
    return <Badge variant={isOnline ? "default" : "secondary"}>{isOnline ? "Online" : "Offline"}</Badge>
  }

  const getVehicleTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      car: "default",
      keke: "secondary",
      bike: "outline",
    }
    return <Badge variant={variants[type] || "outline"}>{type.toUpperCase()}</Badge>
  }

  // Calculate stats safely
  const totalDrivers = Array.isArray(drivers) ? drivers.length : 0
  const onlineDrivers = Array.isArray(drivers) ? drivers.filter((d) => d?.is_online).length : 0
  const avgRating =
    Array.isArray(drivers) && drivers.length > 0
      ? (drivers.reduce((sum, d) => sum + (d?.rating || 0), 0) / drivers.length).toFixed(1)
      : "0"

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Error Loading Drivers</h2>
          <p className="text-muted-foreground text-center max-w-md">{error}</p>
          <Button onClick={fetchDrivers}>Try Again</Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Driver Management</h1>
            <p className="text-muted-foreground">Manage drivers, vehicles, and performance</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDrivers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Now</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onlineDrivers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRating}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Array.isArray(drivers)
                  ? drivers.filter((d) => d?.vehicles && Array.isArray(d.vehicles) && d.vehicles.length > 0).length
                  : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drivers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Drivers</CardTitle>
            <CardDescription>Manage driver profiles and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search drivers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
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
                    <TableHead>Driver</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Rides</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading drivers...
                      </TableCell>
                    </TableRow>
                  ) : !Array.isArray(drivers) || drivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No drivers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    drivers.map((driver) => (
                      <TableRow key={driver?.id || Math.random()}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{driver?.users?.full_name || "Unknown"}</div>
                            <div className="text-sm text-muted-foreground">{driver?.users?.email || "No email"}</div>
                          </div>
                        </TableCell>
                        <TableCell>{driver?.license_number || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getVehicleTypeBadge(driver?.vehicle_type || "car")}
                            {driver?.vehicles && Array.isArray(driver.vehicles) && driver.vehicles[0] && (
                              <div className="text-xs text-muted-foreground">
                                {driver.vehicles[0].make} {driver.vehicles[0].model}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(driver?.is_online || false)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {(driver?.rating || 0).toFixed(1)}
                          </div>
                        </TableCell>
                        <TableCell>{driver?.total_rides || 0}</TableCell>
                        <TableCell>₦{(driver?.total_earnings || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(driver?.id, driver?.is_online || false)}
                              disabled={!driver?.id}
                            >
                              {driver?.is_online ? "Set Offline" : "Set Online"}
                            </Button>
                            {driver?.users && !driver.users.is_active && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApproveDriver(driver?.id, driver?.users?.id)}
                                disabled={!driver?.id || !driver?.users?.id}
                              >
                                Approve
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
