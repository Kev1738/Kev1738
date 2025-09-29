"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle, Database, Users, Car, MapPin, Activity } from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "running" | "success" | "error"
  message: string
  duration?: number
  details?: any
}

interface DatabaseStats {
  users_count: number
  drivers_count: number
  rides_count: number
  tables: string[]
  connection_info: {
    url: string
    status: string
    auth_status: string
  }
}

export default function TestSupabasePage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Database Connection", status: "pending", message: "Not started" },
    { name: "User Operations", status: "pending", message: "Not started" },
    { name: "Driver Operations", status: "pending", message: "Not started" },
    { name: "Ride Operations", status: "pending", message: "Not started" },
    { name: "Database Statistics", status: "pending", message: "Not started" },
    { name: "Realtime Features", status: "pending", message: "Not started" },
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState<DatabaseStats | null>(null)

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests((prev) => prev.map((test) => (test.name === name ? { ...test, ...updates } : test)))
  }

  const runTest = async (testName: string, endpoint: string) => {
    const startTime = Date.now()
    updateTest(testName, { status: "running", message: "Running..." })

    try {
      const response = await fetch(endpoint)
      const result = await response.json()
      const duration = Date.now() - startTime

      if (result.success) {
        updateTest(testName, {
          status: "success",
          message: result.message || "Test passed",
          duration,
          details: result.data,
        })
      } else {
        updateTest(testName, {
          status: "error",
          message: result.error || "Test failed",
          duration,
          details: result.details,
        })
      }
    } catch (error) {
      const duration = Date.now() - startTime
      updateTest(testName, {
        status: "error",
        message: `Network error: ${error}`,
        duration,
      })
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setProgress(0)

    const testEndpoints = [
      { name: "Database Connection", endpoint: "/api/test-supabase/connection" },
      { name: "User Operations", endpoint: "/api/test-supabase/users" },
      { name: "Driver Operations", endpoint: "/api/test-supabase/drivers" },
      { name: "Ride Operations", endpoint: "/api/test-supabase/rides" },
      { name: "Database Statistics", endpoint: "/api/test-supabase/stats" },
      { name: "Realtime Features", endpoint: "/api/test-supabase/realtime" },
    ]

    for (let i = 0; i < testEndpoints.length; i++) {
      const { name, endpoint } = testEndpoints[i]
      await runTest(name, endpoint)
      setProgress(((i + 1) / testEndpoints.length) * 100)

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Load database statistics
    try {
      const statsResponse = await fetch("/api/test-supabase/stats")
      const statsResult = await statsResponse.json()
      if (statsResult.success) {
        setStats(statsResult.data)
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "running":
        return <Activity className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <Badge variant="success">Passed</Badge>
      case "error":
        return <Badge variant="destructive">Failed</Badge>
      case "running":
        return <Badge variant="info">Running</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  useEffect(() => {
    // Load initial stats
    fetch("/api/test-supabase/stats")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setStats(result.data)
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-blue-600">Supabase Connection Test</h1>
        <p className="text-gray-600">Comprehensive testing of database operations and connectivity</p>
      </div>

      {/* Connection Information */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Connection Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Database URL</p>
                <p className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded">{stats.connection_info.url}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Connection Status</p>
                <Badge variant={stats.connection_info.status === "connected" ? "success" : "destructive"}>
                  {stats.connection_info.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Auth Status</p>
                <Badge variant={stats.connection_info.auth_status === "configured" ? "success" : "warning"}>
                  {stats.connection_info.auth_status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Database Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Database Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <Users className="h-8 w-8 mx-auto text-blue-500" />
                <div className="text-2xl font-bold">{stats.users_count}</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
              <div className="text-center space-y-2">
                <Car className="h-8 w-8 mx-auto text-green-500" />
                <div className="text-2xl font-bold">{stats.drivers_count}</div>
                <div className="text-sm text-gray-600">Drivers</div>
              </div>
              <div className="text-center space-y-2">
                <MapPin className="h-8 w-8 mx-auto text-purple-500" />
                <div className="text-2xl font-bold">{stats.rides_count}</div>
                <div className="text-sm text-gray-600">Rides</div>
              </div>
              <div className="text-center space-y-2">
                <Database className="h-8 w-8 mx-auto text-orange-500" />
                <div className="text-2xl font-bold">{stats.tables.length}</div>
                <div className="text-sm text-gray-600">Tables</div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Available Tables:</p>
              <div className="flex flex-wrap gap-2">
                {stats.tables.map((table) => (
                  <Badge key={table} variant="outline">
                    {table}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
          <CardDescription>Run comprehensive tests to verify database functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runAllTests} disabled={isRunning} className="flex-1">
              {isRunning ? "Running Tests..." : "Run All Tests"}
            </Button>
          </div>
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Detailed results for each test category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {tests.map((test, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <h3 className="font-medium">{test.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {test.duration && <span className="text-xs text-gray-500">{test.duration}ms</span>}
                  {getStatusBadge(test.status)}
                </div>
              </div>

              <p className="text-sm text-gray-600">{test.message}</p>

              {test.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View Details</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Test Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {tests.filter((t) => t.status === "success").length}
              </div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-red-600">{tests.filter((t) => t.status === "error").length}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {tests.filter((t) => t.status === "running").length}
              </div>
              <div className="text-sm text-gray-600">Running</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-600">
                {tests.filter((t) => t.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Information */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This test suite verifies your Supabase connection and database operations. If any tests fail, check your
          environment variables and database schema. Make sure to run the SQL scripts in the scripts folder to set up
          the required tables and functions.
        </AlertDescription>
      </Alert>
    </div>
  )
}
