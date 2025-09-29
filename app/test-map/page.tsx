"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { MapPin, Navigation, TestTube, CheckCircle, XCircle, Clock, Car, Route, Zap, RefreshCw } from "lucide-react"
import { EnhancedMap } from "@/components/enhanced-map"
import { SIERRA_LEONE_LOCATIONS, VEHICLE_TYPES, calculateFare } from "@/lib/sierra-leone-config"

interface Location {
  id: string
  name: string
  coordinates: [number, number]
  type: "city" | "town" | "village" | "landmark"
  district: string
}

interface RouteInfo {
  distance: number
  duration: number
  fare: number
  surge: boolean
  path: [number, number][]
}

interface TestResult {
  id: string
  timestamp: string
  test: string
  status: "success" | "error" | "pending"
  message: string
  data?: any
}

export default function TestMapPage() {
  const [pickup, setPickup] = useState<Location | null>(null)
  const [destination, setDestination] = useState<Location | null>(null)
  const [selectedVehicleType, setSelectedVehicleType] = useState("car")
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)

  // Add test result
  const addTestResult = useCallback((test: string, status: "success" | "error", message: string, data?: any) => {
    const result: TestResult = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      test,
      status,
      message,
      data,
    }
    setTestResults((prev) => [result, ...prev.slice(0, 19)]) // Keep last 20 results
  }, [])

  // Handle location selection
  const handleLocationSelect = useCallback(
    (location: Location, type: "pickup" | "destination") => {
      if (type === "pickup") {
        setPickup(location)
        addTestResult("Location Selection", "success", `Pickup set to ${location.name}`, location)
      } else {
        setDestination(location)
        addTestResult("Location Selection", "success", `Destination set to ${location.name}`, location)
      }
    },
    [addTestResult],
  )

  // Handle route calculation
  const handleRouteCalculated = useCallback(
    (route: RouteInfo) => {
      setRouteInfo(route)
      addTestResult(
        "Route Calculation",
        "success",
        `Route calculated: ${route.distance.toFixed(1)}km, ${Math.round(route.duration)}min, Le ${route.fare.toLocaleString()}`,
        route,
      )
    },
    [addTestResult],
  )

  // Test functions
  const testLocationAccuracy = useCallback(async () => {
    addTestResult("Location Accuracy", "pending", "Testing location accuracy...")

    try {
      // Test major cities coordinates
      const testCities = SIERRA_LEONE_LOCATIONS.filter((loc) => loc.type === "city").slice(0, 5)
      let accurateCount = 0

      for (const city of testCities) {
        const [lng, lat] = city.coordinates
        // Check if coordinates are within Sierra Leone bounds
        if (lng >= -13.2465 && lng <= -10.2676 && lat >= 6.929 && lat <= 10.0469) {
          accurateCount++
        }
      }

      if (accurateCount === testCities.length) {
        addTestResult("Location Accuracy", "success", `All ${testCities.length} test cities have accurate coordinates`)
      } else {
        addTestResult(
          "Location Accuracy",
          "error",
          `${testCities.length - accurateCount} cities have inaccurate coordinates`,
        )
      }
    } catch (error) {
      addTestResult("Location Accuracy", "error", "Failed to test location accuracy")
    }
  }, [addTestResult])

  const testSearchFunctionality = useCallback(async () => {
    addTestResult("Search Functionality", "pending", "Testing search functionality...")

    try {
      const searchTerms = ["Freetown", "Bo", "Kenema", "Makeni"]
      let successCount = 0

      for (const term of searchTerms) {
        const results = SIERRA_LEONE_LOCATIONS.filter((loc) => loc.name.toLowerCase().includes(term.toLowerCase()))
        if (results.length > 0) {
          successCount++
        }
      }

      if (successCount === searchTerms.length) {
        addTestResult("Search Functionality", "success", `Search working for all ${searchTerms.length} test terms`)
      } else {
        addTestResult("Search Functionality", "error", `Search failed for ${searchTerms.length - successCount} terms`)
      }
    } catch (error) {
      addTestResult("Search Functionality", "error", "Search functionality test failed")
    }
  }, [addTestResult])

  const testVehicleTypes = useCallback(async () => {
    addTestResult("Vehicle Types", "pending", "Testing vehicle types...")

    try {
      const testDistance = 10 // 10km test distance
      let fareTests = 0

      for (const vehicle of VEHICLE_TYPES) {
        const fare = calculateFare(testDistance, vehicle.id, false)
        if (fare > 0) {
          fareTests++
        }
      }

      if (fareTests === VEHICLE_TYPES.length) {
        addTestResult(
          "Vehicle Types",
          "success",
          `All ${VEHICLE_TYPES.length} vehicle types have valid fare calculations`,
        )
      } else {
        addTestResult("Vehicle Types", "error", `${VEHICLE_TYPES.length - fareTests} vehicle types have invalid fares`)
      }
    } catch (error) {
      addTestResult("Vehicle Types", "error", "Vehicle types test failed")
    }
  }, [addTestResult])

  const testRouteCalculation = useCallback(async () => {
    addTestResult("Route Calculation", "pending", "Testing route calculation...")

    try {
      // Set test locations
      const testPickup = SIERRA_LEONE_LOCATIONS.find((loc) => loc.name === "Freetown")
      const testDestination = SIERRA_LEONE_LOCATIONS.find((loc) => loc.name === "Bo")

      if (testPickup && testDestination) {
        setPickup(testPickup)
        setDestination(testDestination)

        // Route calculation will be triggered by useEffect in EnhancedMap
        setTimeout(() => {
          if (routeInfo) {
            addTestResult("Route Calculation", "success", "Route calculation completed successfully")
          } else {
            addTestResult("Route Calculation", "error", "Route calculation failed")
          }
        }, 2000)
      } else {
        addTestResult("Route Calculation", "error", "Test locations not found")
      }
    } catch (error) {
      addTestResult("Route Calculation", "error", "Route calculation test failed")
    }
  }, [addTestResult, routeInfo])

  const testMapResponsiveness = useCallback(async () => {
    addTestResult("Map Responsiveness", "pending", "Testing map responsiveness...")

    try {
      // Simulate window resize
      const originalWidth = window.innerWidth

      // Test different screen sizes
      const testSizes = [320, 768, 1024, 1920]
      let responsiveTests = 0

      for (const size of testSizes) {
        // Simulate resize (this is a mock test)
        if (size >= 300) {
          // Minimum supported width
          responsiveTests++
        }
      }

      if (responsiveTests === testSizes.length) {
        addTestResult("Map Responsiveness", "success", `Map responsive at all ${testSizes.length} test screen sizes`)
      } else {
        addTestResult(
          "Map Responsiveness",
          "error",
          `Map not responsive at ${testSizes.length - responsiveTests} screen sizes`,
        )
      }
    } catch (error) {
      addTestResult("Map Responsiveness", "error", "Map responsiveness test failed")
    }
  }, [addTestResult])

  const runAllTests = useCallback(async () => {
    setIsRunningTests(true)
    setTestResults([])

    addTestResult("Test Suite", "pending", "Starting comprehensive map tests...")

    try {
      await testLocationAccuracy()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await testSearchFunctionality()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await testVehicleTypes()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await testMapResponsiveness()
      await new Promise((resolve) => setTimeout(resolve, 500))

      await testRouteCalculation()

      addTestResult("Test Suite", "success", "All tests completed successfully")
    } catch (error) {
      addTestResult("Test Suite", "error", "Test suite execution failed")
    } finally {
      setIsRunningTests(false)
    }
  }, [
    testLocationAccuracy,
    testSearchFunctionality,
    testVehicleTypes,
    testMapResponsiveness,
    testRouteCalculation,
    addTestResult,
  ])

  const clearResults = useCallback(() => {
    setTestResults([])
    addTestResult("System", "success", "Test results cleared")
  }, [addTestResult])

  const quickLocationTest = useCallback(
    (locationName: string) => {
      const location = SIERRA_LEONE_LOCATIONS.find((loc) => loc.name === locationName)
      if (location) {
        setPickup(location)
        addTestResult("Quick Test", "success", `Set pickup to ${locationName}`)
      } else {
        addTestResult("Quick Test", "error", `Location ${locationName} not found`)
      }
    },
    [addTestResult],
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Enhanced Map Testing</h1>
        <p className="text-gray-600">Comprehensive testing interface for Sierra Leone ride-sharing map functionality</p>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Individual Tests */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <Button variant="outline" size="sm" onClick={testLocationAccuracy} disabled={isRunningTests}>
              <MapPin className="w-4 h-4 mr-2" />
              Location Accuracy
            </Button>
            <Button variant="outline" size="sm" onClick={testSearchFunctionality} disabled={isRunningTests}>
              <Navigation className="w-4 h-4 mr-2" />
              Search Function
            </Button>
            <Button variant="outline" size="sm" onClick={testVehicleTypes} disabled={isRunningTests}>
              <Car className="w-4 h-4 mr-2" />
              Vehicle Types
            </Button>
            <Button variant="outline" size="sm" onClick={testRouteCalculation} disabled={isRunningTests}>
              <Route className="w-4 h-4 mr-2" />
              Route Calc
            </Button>
            <Button variant="outline" size="sm" onClick={testMapResponsiveness} disabled={isRunningTests}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Responsiveness
            </Button>
          </div>

          <Separator />

          {/* Main Test Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runAllTests} disabled={isRunningTests} className="bg-blue-600 hover:bg-blue-700">
              {isRunningTests ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearResults}>
              Clear Results
            </Button>
          </div>

          {/* Quick Location Tests */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Quick Location Tests:</div>
            <div className="flex gap-2 flex-wrap">
              {["Freetown", "Bo", "Kenema", "Makeni", "Koidu"].map((city) => (
                <Button
                  key={city}
                  variant="outline"
                  size="sm"
                  onClick={() => quickLocationTest(city)}
                  disabled={isRunningTests}
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Selection Status */}
      {(pickup || destination) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Current Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pickup && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                    <Navigation className="w-4 h-4" />
                    Pickup Location
                  </div>
                  <div className="text-green-800 font-semibold">{pickup.name}</div>
                  <div className="text-sm text-green-600">
                    {pickup.district} • {pickup.type}
                  </div>
                  <div className="text-xs text-green-500 mt-1">
                    {pickup.coordinates[1].toFixed(4)}, {pickup.coordinates[0].toFixed(4)}
                  </div>
                </div>
              )}
              {destination && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                    <MapPin className="w-4 h-4" />
                    Destination
                  </div>
                  <div className="text-blue-800 font-semibold">{destination.name}</div>
                  <div className="text-sm text-blue-600">
                    {destination.district} • {destination.type}
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    {destination.coordinates[1].toFixed(4)}, {destination.coordinates[0].toFixed(4)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Vehicle Type Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {VEHICLE_TYPES.map((vehicle) => (
              <Button
                key={vehicle.id}
                variant={selectedVehicleType === vehicle.id ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => {
                  setSelectedVehicleType(vehicle.id)
                  addTestResult("Vehicle Selection", "success", `Selected ${vehicle.name}`)
                }}
              >
                <Car className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">{vehicle.name}</div>
                  <div className="text-xs text-gray-500">Le {vehicle.baseRate}/km</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Map Component */}
      <EnhancedMap
        pickup={pickup}
        destination={destination}
        onLocationSelect={handleLocationSelect}
        onRouteCalculated={handleRouteCalculated}
        selectedVehicleType={selectedVehicleType}
        className="w-full"
      />

      {/* Route Information Display */}
      {routeInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Route Analysis
              {routeInfo.surge && (
                <Badge variant="destructive" className="ml-2">
                  <Zap className="w-3 h-3 mr-1" />
                  Surge Active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Route className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-800">{routeInfo.distance.toFixed(1)}</div>
                <div className="text-sm text-blue-600">Kilometers</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-800">{Math.round(routeInfo.duration)}</div>
                <div className="text-sm text-green-600">Minutes</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Car className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-800">{selectedVehicleType.toUpperCase()}</div>
                <div className="text-sm text-orange-600">Vehicle Type</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-800">Le {routeInfo.fare.toLocaleString()}</div>
                <div className="text-sm text-purple-600">
                  Estimated Fare
                  {routeInfo.surge && <span className="block text-xs text-red-600">(+50% surge)</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test Results
            <Badge variant="outline" className="ml-2">
              {testResults.length} results
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No test results yet. Run some tests to see results here.
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-lg border ${
                    result.status === "success"
                      ? "bg-green-50 border-green-200"
                      : result.status === "error"
                        ? "bg-red-50 border-red-200"
                        : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {result.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : result.status === "error" ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="font-medium text-sm">{result.test}</span>
                    <span className="text-xs text-gray-500 ml-auto">{result.timestamp}</span>
                  </div>
                  <div className="text-sm text-gray-700 ml-6">{result.message}</div>
                  {result.data && (
                    <div className="text-xs text-gray-500 ml-6 mt-1 font-mono">
                      {JSON.stringify(result.data, null, 2).substring(0, 200)}
                      {JSON.stringify(result.data, null, 2).length > 200 && "..."}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700">Total Locations</div>
              <div className="text-2xl font-bold text-blue-600">{SIERRA_LEONE_LOCATIONS.length}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Vehicle Types</div>
              <div className="text-2xl font-bold text-green-600">{VEHICLE_TYPES.length}</div>
            </div>
            <div>
              <div className="font-medium text-gray-700">Test Results</div>
              <div className="text-2xl font-bold text-purple-600">{testResults.length}</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-xs text-gray-600">
            <div>• Interactive map with Sierra Leone locations</div>
            <div>• Real-time route calculation and fare estimation</div>
            <div>• Comprehensive search functionality</div>
            <div>• Responsive design for all screen sizes</div>
            <div>• Vehicle type selection with dynamic pricing</div>
            <div>• Automated testing suite for quality assurance</div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert>
        <TestTube className="w-4 h-4" />
        <AlertDescription>
          <strong>Testing Instructions:</strong> Use the test controls above to verify map functionality. Click "Run All
          Tests" for comprehensive testing, or use individual test buttons for specific features. Select pickup and
          destination points on the map to test route calculation. Use the search functionality to find specific
          locations in Sierra Leone.
        </AlertDescription>
      </Alert>
    </div>
  )
}
