"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Loader2, Database, Users, Car, MapPin, Plus, Edit, Trash2, TestTube } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface TestResult {
  operation: string
  status: "success" | "error" | "pending"
  message: string
  data?: any
}

export default function DatabaseTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testUser, setTestUser] = useState({
    email: `test.user.${Date.now()}@example.com`,
    password: "testpassword123",
    full_name: "Test User",
    phone: "+1234567890",
    role: "passenger",
  })

  const addTestResult = (result: TestResult) => {
    setTestResults((prev) => [...prev, { ...result, timestamp: new Date().toISOString() }])
  }

  const updateTestResult = (index: number, updates: Partial<TestResult>) => {
    setTestResults((prev) => prev.map((result, i) => (i === index ? { ...result, ...updates } : result)))
  }

  // Test User CRUD Operations
  const testUserOperations = async () => {
    let createdUserId: string | null = null

    try {
      // 1. CREATE USER
      addTestResult({
        operation: "Create User",
        status: "pending",
        message: "Creating new test user...",
      })

      const createResponse = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      })

      const createResult = await createResponse.json()

      if (createResponse.ok && createResult.success) {
        createdUserId = createResult.data.id
        updateTestResult(testResults.length, {
          status: "success",
          message: `User created successfully with ID: ${createdUserId}`,
          data: createResult.data,
        })
      } else {
        updateTestResult(testResults.length, {
          status: "error",
          message: `Failed to create user: ${createResult.error || "Unknown error"}`,
        })
        return
      }

      // 2. READ USER
      addTestResult({
        operation: "Read User",
        status: "pending",
        message: "Fetching created user...",
      })

      const readResponse = await fetch(`/api/admin/users/${createdUserId}`)
      const readResult = await readResponse.json()

      if (readResponse.ok) {
        updateTestResult(testResults.length, {
          status: "success",
          message: "User fetched successfully",
          data: readResult,
        })
      } else {
        updateTestResult(testResults.length, {
          status: "error",
          message: `Failed to read user: ${readResult.error || "Unknown error"}`,
        })
      }

      // 3. UPDATE USER
      addTestResult({
        operation: "Update User",
        status: "pending",
        message: "Updating user information...",
      })

      const updateData = {
        full_name: "Updated Test User",
        phone: "+9876543210",
      }

      const updateResponse = await fetch(`/api/admin/users/${createdUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      const updateResult = await updateResponse.json()

      if (updateResponse.ok && updateResult.success) {
        updateTestResult(testResults.length, {
          status: "success",
          message: "User updated successfully",
          data: updateResult.data,
        })
      } else {
        updateTestResult(testResults.length, {
          status: "error",
          message: `Failed to update user: ${updateResult.error || "Unknown error"}`,
        })
      }

      // 4. LIST USERS
      addTestResult({
        operation: "List Users",
        status: "pending",
        message: "Fetching users list...",
      })

      const listResponse = await fetch("/api/admin/users?limit=5")
      const listResult = await listResponse.json()

      if (listResponse.ok) {
        updateTestResult(testResults.length, {
          status: "success",
          message: `Fetched ${listResult.users?.length || 0} users`,
          data: { count: listResult.users?.length, pagination: listResult.pagination },
        })
      } else {
        updateTestResult(testResults.length, {
          status: "error",
          message: `Failed to list users: ${listResult.error || "Unknown error"}`,
        })
      }

      // 5. DELETE USER (Soft delete)
      addTestResult({
        operation: "Delete User",
        status: "pending",
        message: "Deleting test user...",
      })

      const deleteResponse = await fetch(`/api/admin/users/${createdUserId}`, {
        method: "DELETE",
      })

      const deleteResult = await deleteResponse.json()

      if (deleteResponse.ok && deleteResult.success) {
        updateTestResult(testResults.length, {
          status: "success",
          message: "User deleted (deactivated) successfully",
          data: deleteResult.data,
        })
      } else {
        updateTestResult(testResults.length, {
          status: "error",
          message: `Failed to delete user: ${deleteResult.error || "Unknown error"}`,
        })
      }
    } catch (error) {
      addTestResult({
        operation: "User Operations Error",
        status: "error",
        message: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  // Test Driver Operations
  const testDriverOperations = async () => {
    try {
      // 1. LIST DRIVERS
      addTestResult({
        operation: "List Drivers",
        status: "pending",
        message: "Fetching drivers list...",
      })

      const driversResponse = await fetch("/api/admin/drivers?limit=5")
      const driversResult = await driversResponse.json()

      if (driversResponse.ok) {
        updateTestResult(testResults.length, {
          status: "success",
          message: `Fetched ${driversResult.drivers?.length || 0} drivers`,
          data: { count: driversResult.drivers?.length, drivers: driversResult.drivers },
        })

        // 2. UPDATE DRIVER STATUS (if drivers exist)
        if (driversResult.drivers && driversResult.drivers.length > 0) {
          const firstDriver = driversResult.drivers[0]

          addTestResult({
            operation: "Update Driver Status",
            status: "pending",
            message: `Toggling status for driver: ${firstDriver.users?.full_name}`,
          })

          const statusResponse = await fetch("/api/admin/drivers", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: firstDriver.id,
              action: "toggle_status",
              is_online: !firstDriver.is_online,
            }),
          })

          const statusResult = await statusResponse.json()

          if (statusResponse.ok) {
            updateTestResult(testResults.length, {
              status: "success",
              message: `Driver status updated to ${!firstDriver.is_online ? "online" : "offline"}`,
              data: statusResult,
            })
          } else {
            updateTestResult(testResults.length, {
              status: "error",
              message: `Failed to update driver status: ${statusResult.error || "Unknown error"}`,
            })
          }
        }
      } else {
        updateTestResult(testResults.length, {
          status: "error",
          message: `Failed to list drivers: ${driversResult.error || "Unknown error"}`,
        })
      }
    } catch (error) {
      addTestResult({
        operation: "Driver Operations Error",
        status: "error",
        message: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  // Test Ride Operations
  const testRideOperations = async () => {
    try {
      // 1. LIST RIDES
      addTestResult({
        operation: "List Rides",
        status: "pending",
        message: "Fetching rides list...",
      })

      const ridesResponse = await fetch("/api/admin/rides?limit=5")
      const ridesResult = await ridesResponse.json()

      if (ridesResponse.ok) {
        updateTestResult(testResults.length, {
          status: "success",
          message: `Fetched ${ridesResult.rides?.length || 0} rides`,
          data: { count: ridesResult.rides?.length, rides: ridesResult.rides },
        })

        // 2. UPDATE RIDE STATUS (if rides exist)
        if (ridesResult.rides && ridesResult.rides.length > 0) {
          const firstRide = ridesResult.rides.find((r) => r.status === "in_progress" || r.status === "accepted")

          if (firstRide) {
            addTestResult({
              operation: "Update Ride Status",
              status: "pending",
              message: `Updating status for ride: ${firstRide.id}`,
            })

            const newStatus = firstRide.status === "in_progress" ? "completed" : "in_progress"
            const statusResponse = await fetch("/api/admin/rides", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: firstRide.id,
                status: newStatus,
              }),
            })

            const statusResult = await statusResponse.json()

            if (statusResponse.ok) {
              updateTestResult(testResults.length, {
                status: "success",
                message: `Ride status updated to ${newStatus}`,
                data: statusResult,
              })
            } else {
              updateTestResult(testResults.length, {
                status: "error",
                message: `Failed to update ride status: ${statusResult.error || "Unknown error"}`,
              })
            }
          }
        }
      } else {
        updateTestResult(testResults.length, {
          status: "error",
          message: `Failed to list rides: ${ridesResult.error || "Unknown error"}`,
        })
      }
    } catch (error) {
      addTestResult({
        operation: "Ride Operations Error",
        status: "error",
        message: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  // Test Database Health
  const testDatabaseHealth = async () => {
    try {
      addTestResult({
        operation: "Database Health Check",
        status: "pending",
        message: "Checking database connectivity...",
      })

      const healthResponse = await fetch("/api/health")
      const healthResult = await healthResponse.json()

      if (healthResponse.ok && healthResult.database?.status === "connected") {
        updateTestResult(testResults.length, {
          status: "success",
          message: "Database is healthy and connected",
          data: healthResult,
        })
      } else {
        updateTestResult(testResults.length, {
          status: "error",
          message: `Database health check failed: ${healthResult.error || "Unknown error"}`,
          data: healthResult,
        })
      }
    } catch (error) {
      updateTestResult(testResults.length, {
        status: "error",
        message: `Database health check error: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    }
  }

  // Run All Tests
  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])

    try {
      await testDatabaseHealth()
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Small delay for better UX

      await testUserOperations()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await testDriverOperations()
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await testRideOperations()

      toast({
        title: "Tests Completed",
        description: "All database integration tests have been executed",
      })
    } catch (error) {
      toast({
        title: "Test Error",
        description: "An error occurred while running tests",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      success: "default",
      error: "destructive",
      pending: "secondary",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  const successCount = testResults.filter((r) => r.status === "success").length
  const errorCount = testResults.filter((r) => r.status === "error").length
  const pendingCount = testResults.filter((r) => r.status === "pending").length

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database Integration Tests
          </h1>
          <p className="text-muted-foreground">
            Comprehensive testing of all CRUD operations and database connectivity
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={clearResults} variant="outline" disabled={isRunning}>
            Clear Results
          </Button>
          <Button onClick={runAllTests} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Test Summary */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testResults.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="config">Test Configuration</TabsTrigger>
          <TabsTrigger value="individual">Individual Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Real-time results of database integration tests</CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tests run yet</h3>
                  <p className="text-gray-600">Click "Run All Tests" to start testing database operations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-0.5">{getStatusIcon(result.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{result.operation}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer">View Data</summary>
                            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test User Configuration</CardTitle>
              <CardDescription>Configure the test user data for CRUD operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={testUser.email}
                    onChange={(e) => setTestUser({ ...testUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={testUser.full_name}
                    onChange={(e) => setTestUser({ ...testUser, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={testUser.phone}
                    onChange={(e) => setTestUser({ ...testUser, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={testUser.role}
                    onChange={(e) => setTestUser({ ...testUser, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="passenger">Passenger</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <Button
                onClick={() =>
                  setTestUser({
                    ...testUser,
                    email: `test.user.${Date.now()}@example.com`,
                  })
                }
                variant="outline"
              >
                Generate New Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Health Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={testDatabaseHealth} className="w-full" disabled={isRunning}>
                  Test Database
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User CRUD
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={testUserOperations} className="w-full" disabled={isRunning}>
                  Test Users
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Driver Ops
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={testDriverOperations} className="w-full" disabled={isRunning}>
                  Test Drivers
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ride Ops
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={testRideOperations} className="w-full" disabled={isRunning}>
                  Test Rides
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Coverage</CardTitle>
          <CardDescription>This test suite covers the following database operations:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Operations
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create new users</li>
                <li>• Auto-create driver profiles</li>
                <li>• Initialize user wallets</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Update Operations
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Update user information</li>
                <li>• Toggle driver status</li>
                <li>• Change ride status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Operations
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Soft delete users</li>
                <li>• Deactivate accounts</li>
                <li>• Cancel rides</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
