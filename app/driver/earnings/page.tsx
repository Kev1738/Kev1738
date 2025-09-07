"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, Calendar, Download, Car } from "lucide-react"
import { DriverLayout } from "@/components/driver-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useSession } from "@/hooks/use-session"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorAlert } from "@/components/error-alert"

export default function DriverEarningsPage() {
  const { session } = useSession()
  const [earnings, setEarnings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("week")

  useEffect(() => {
    if (session) {
      loadEarnings()
    }
  }, [session, period])

  const loadEarnings = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/driver/earnings?period=${period}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to load earnings")
      }

      const result = await response.json()

      if (result.success) {
        setEarnings(result.earnings)
      } else {
        throw new Error(result.error || "Failed to load earnings")
      }
    } catch (err) {
      console.error("Load earnings error:", err)
      setError(err instanceof Error ? err.message : "Failed to load earnings")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  if (!session) return null

  return (
    <AuthGuard requiredRole="driver">
      <DriverLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Earnings</h1>
              <p className="text-gray-600">Track your income and performance</p>
            </div>
            <div className="flex gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Error State */}
          {error && <ErrorAlert message={error} onRetry={loadEarnings} />}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading earnings data..." />
            </div>
          )}

          {/* Earnings Content */}
          {!loading && earnings && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(earnings.total)}</div>
                    <p className="text-xs text-muted-foreground">{period === "day" ? "Today" : `This ${period}`}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{earnings.totalRides}</div>
                    <p className="text-xs text-muted-foreground">Completed rides</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average per Ride</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(earnings.totalRides > 0 ? earnings.total / earnings.totalRides : 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Per completed ride</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Best Day</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {earnings.chartData.length > 0
                        ? formatCurrency(Math.max(...earnings.chartData.map((d: any) => d.earnings)))
                        : formatCurrency(0)}
                    </div>
                    <p className="text-xs text-muted-foreground">Highest daily earnings</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed View */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="rides">Recent Rides</TabsTrigger>
                  <TabsTrigger value="daily">Daily Breakdown</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Earnings Chart</CardTitle>
                      <CardDescription>Daily earnings for the selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {earnings.chartData.length > 0 ? (
                        <div className="space-y-4">
                          {earnings.chartData.map((day: any, index: number) => (
                            <div key={day.date} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{formatDate(day.date)}</p>
                                <p className="text-sm text-gray-600">{day.rides} rides</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">{formatCurrency(day.earnings)}</p>
                                <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${(day.earnings / Math.max(...earnings.chartData.map((d: any) => d.earnings))) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">No earnings data for this period</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="rides" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Completed Rides</CardTitle>
                      <CardDescription>Your latest completed rides and earnings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {earnings.rides.length > 0 ? (
                        <div className="space-y-4">
                          {earnings.rides.slice(0, 10).map((ride: any) => (
                            <div key={ride.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium">{ride.pickup_address}</p>
                                <p className="text-sm text-gray-600">to {ride.destination_address}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(ride.completed_at || ride.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">{formatCurrency(ride.fare_amount)}</p>
                                <p className="text-sm text-gray-600">{ride.vehicle_type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">No completed rides for this period</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="daily" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Breakdown</CardTitle>
                      <CardDescription>Detailed daily earnings and ride statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {earnings.chartData.length > 0 ? (
                        <div className="space-y-4">
                          {earnings.chartData.map((day: any) => (
                            <Card key={day.date}>
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">{formatDate(day.date)}</h4>
                                  <span className="font-bold text-lg">{formatCurrency(day.earnings)}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Rides: </span>
                                    <span className="font-medium">{day.rides}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Avg per ride: </span>
                                    <span className="font-medium">
                                      {formatCurrency(day.rides > 0 ? day.earnings / day.rides : 0)}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">No daily data available for this period</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </DriverLayout>
    </AuthGuard>
  )
}
