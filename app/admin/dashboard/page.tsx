"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Car, MapPin, DollarSign, Activity, Clock, AlertCircle, CheckCircle } from "lucide-react"
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

interface DashboardStats {
  totalUsers: number
  totalDrivers: number
  onlineDrivers: number
  totalRides: number
  completedRides: number
  pendingRides: number
  totalRevenue: number
  todayRevenue: number
  activeRides: number
  cancelledRides: number
}

interface RecentActivity {
  id: string
  type: "ride" | "user" | "driver" | "payment"
  message: string
  timestamp: string
  status: "success" | "warning" | "error" | "info"
}

interface ChartData {
  name: string
  value: number
  rides?: number
  revenue?: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [rideStatusData, setRideStatusData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setError(null)

      // Fetch dashboard stats
      const [statsResponse, activityResponse, analyticsResponse] = await Promise.all([
        fetch("/api/admin/dashboard/stats"),
        fetch("/api/admin/dashboard/activity"),
        fetch("/api/admin/analytics?period=7d"),
      ])

      if (!statsResponse.ok || !activityResponse.ok || !analyticsResponse.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const [statsData, activityData, analyticsData] = await Promise.all([
        statsResponse.json(),
        activityResponse.json(),
        analyticsResponse.json(),
      ])

      if (statsData.success) {
        setStats(statsData.data)
      }

      if (activityData.success) {
        setRecentActivity(activityData.data)
      }

      if (analyticsData.success) {
        setChartData(analyticsData.dailyTrends || [])

        // Transform ride status data for pie chart
        const statusData = Object.entries(analyticsData.ridesByStatus || {}).map(([status, count]) => ({
          name: status.replace("_", " ").toUpperCase(),
          value: count as number,
        }))
        setRideStatusData(statusData)
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error)
      setError(error instanceof Error ? error.message : "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case "ride":
        return <MapPin className="h-4 w-4" />
      case "user":
        return <Users className="h-4 w-4" />
      case "driver":
        return <Car className="h-4 w-4" />
      case "payment":
        return <DollarSign className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-blue-600"
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Error Loading Dashboard</h2>
          <p className="text-muted-foreground text-center max-w-md">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
          </div>
          <Button onClick={fetchDashboardData} variant="outline">
            Refresh Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalDrivers || 0} drivers, {(stats?.totalUsers || 0) - (stats?.totalDrivers || 0)} passengers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.onlineDrivers || 0}</div>
              <p className="text-xs text-muted-foreground">of {stats?.totalDrivers || 0} total drivers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRides || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeRides || 0} active, {stats?.completedRides || 0} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{(stats?.totalRevenue || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">₦{(stats?.todayRevenue || 0).toLocaleString()} today</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rides Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Rides Trend (Last 7 Days)</CardTitle>
              <CardDescription>Daily ride completions and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rides" stroke="#8884d8" name="Rides" />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue (₦)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Ride Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Ride Status Distribution</CardTitle>
              <CardDescription>Current breakdown of ride statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={rideStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {rideStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system activities and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  recentActivity.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`mt-1 ${getActivityColor(activity.status)}`}>
                        {getActivityIcon(activity.type, activity.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                      <Badge variant={activity.status === "error" ? "destructive" : "secondary"}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Completed Rides</span>
                </div>
                <span className="font-semibold">{stats?.completedRides || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">Pending Rides</span>
                </div>
                <span className="font-semibold">{stats?.pendingRides || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Active Rides</span>
                </div>
                <span className="font-semibold">{stats?.activeRides || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">Cancelled Rides</span>
                </div>
                <span className="font-semibold">{stats?.cancelledRides || 0}</span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="font-semibold">
                    {stats?.totalRides ? ((stats.completedRides / stats.totalRides) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
