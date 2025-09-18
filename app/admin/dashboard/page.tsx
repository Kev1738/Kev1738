"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, Car, DollarSign, TrendingUp, Activity, AlertCircle, RefreshCw } from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalDrivers: number
  activeDrivers: number
  totalRides: number
  completedRides: number
  totalRevenue: number
  monthlyRevenue: number
  completionRate: number
}

interface ChartData {
  name: string
  rides: number
  revenue: number
}

interface ActivityItem {
  id: string
  type: string
  description: string
  timestamp: string
  status: "success" | "warning" | "error"
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch stats
      const statsResponse = await fetch("/api/admin/dashboard/stats")
      if (!statsResponse.ok) throw new Error("Failed to fetch stats")
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Fetch chart data
      const chartResponse = await fetch("/api/admin/dashboard/chart")
      if (!chartResponse.ok) throw new Error("Failed to fetch chart data")
      const chartData = await chartResponse.json()
      setChartData(chartData)

      // Fetch activities
      const activitiesResponse = await fetch("/api/admin/dashboard/activity")
      if (!activitiesResponse.ok) throw new Error("Failed to fetch activities")
      const activitiesData = await activitiesResponse.json()
      setActivities(activitiesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const pieData = stats
    ? [
        { name: "Completed", value: stats.completedRides, color: "#10b981" },
        { name: "Pending", value: stats.totalRides - stats.completedRides, color: "#f59e0b" },
      ]
    : []

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Error Loading Dashboard</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchDashboardData} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your admin dashboard. Here's what's happening today.</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeDrivers || 0}</div>
            <p className="text-xs text-muted-foreground">of {stats?.totalDrivers || 0} total drivers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">${stats?.monthlyRevenue?.toLocaleString() || 0} this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completionRate?.toFixed(1) || 0}%</div>
            <Progress value={stats?.completionRate || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Rides and revenue over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Tabs defaultValue="rides" className="w-full">
              <TabsList>
                <TabsTrigger value="rides">Rides</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
              </TabsList>
              <TabsContent value="rides" className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="rides" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="revenue" className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ride Status</CardTitle>
            <CardDescription>Distribution of ride statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>Latest system activities and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        activity.status === "success"
                          ? "default"
                          : activity.status === "warning"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {activity.type}
                    </Badge>
                    <span className="text-sm">{activity.description}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No recent activities</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
