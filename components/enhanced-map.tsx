"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Navigation, Search, Car, Bike, Truck, Clock, DollarSign, Route, Zap, X, Loader2 } from "lucide-react"
import { SIERRA_LEONE_LOCATIONS, VEHICLE_TYPES, calculateFare } from "@/lib/sierra-leone-config"

interface Location {
  id: string
  name: string
  coordinates: [number, number] // [longitude, latitude]
  type: "city" | "town" | "village" | "landmark"
  district: string
}

interface EnhancedMapProps {
  pickup?: Location | null
  destination?: Location | null
  onLocationSelect?: (location: Location, type: "pickup" | "destination") => void
  onRouteCalculated?: (route: RouteInfo) => void
  selectedVehicleType?: string
  className?: string
}

interface RouteInfo {
  distance: number
  duration: number
  fare: number
  surge: boolean
  path: [number, number][]
}

const MAP_CONFIG = {
  center: [8.4606, -11.7799] as [number, number], // Freetown coordinates
  bounds: {
    north: 10.0469,
    south: 6.929,
    east: -10.2676,
    west: -13.2465,
  },
  zoom: 8,
}

export function EnhancedMap({
  pickup,
  destination,
  onLocationSelect,
  onRouteCalculated,
  selectedVehicleType = "car",
  className = "",
}: EnhancedMapProps) {
  const [mapSize, setMapSize] = useState({ width: 800, height: 600 })
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [selectionMode, setSelectionMode] = useState<"pickup" | "destination" | null>(null)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Convert coordinates to pixel position
  const coordsToPixels = useCallback(
    (coords: [number, number]): [number, number] => {
      const [lng, lat] = coords
      const { bounds } = MAP_CONFIG

      // Normalize coordinates to 0-1 range
      const x = (lng - bounds.west) / (bounds.east - bounds.west)
      const y = 1 - (lat - bounds.south) / (bounds.north - bounds.south) // Flip Y axis

      return [
        Math.max(0, Math.min(mapSize.width, x * mapSize.width)),
        Math.max(0, Math.min(mapSize.height, y * mapSize.height)),
      ]
    },
    [mapSize],
  )

  // Convert pixel position to coordinates
  const pixelsToCoords = useCallback(
    (pixels: [number, number]): [number, number] => {
      const [x, y] = pixels
      const { bounds } = MAP_CONFIG

      const lng = bounds.west + (x / mapSize.width) * (bounds.east - bounds.west)
      const lat = bounds.south + ((mapSize.height - y) / mapSize.height) * (bounds.north - bounds.south)

      return [lng, lat]
    },
    [mapSize],
  )

  // Handle map resize
  useEffect(() => {
    const updateMapSize = () => {
      if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect()
        setMapSize({
          width: Math.max(300, rect.width),
          height: Math.max(200, Math.min(600, rect.width * 0.75)),
        })
      }
    }

    updateMapSize()
    window.addEventListener("resize", updateMapSize)
    return () => window.removeEventListener("resize", updateMapSize)
  }, [])

  // Search locations
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const results = SIERRA_LEONE_LOCATIONS.filter(
      (location) =>
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.district.toLowerCase().includes(query.toLowerCase()) ||
        location.type.toLowerCase().includes(query.toLowerCase()),
    ).slice(0, 10)

    setSearchResults(results)
  }, [])

  // Handle location selection
  const handleLocationSelect = useCallback(
    (location: Location) => {
      if (selectionMode && onLocationSelect) {
        onLocationSelect(location, selectionMode)
        setSelectionMode(null)
      }
      setSelectedLocation(location)
      setSearchQuery("")
      setSearchResults([])
    },
    [selectionMode, onLocationSelect],
  )

  // Handle map click
  const handleMapClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!selectionMode) return

      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const coords = pixelsToCoords([x, y])

      // Find nearest location within reasonable distance
      let nearestLocation: Location | null = null
      let minDistance = Number.POSITIVE_INFINITY

      SIERRA_LEONE_LOCATIONS.forEach((location) => {
        const [locX, locY] = coordsToPixels(location.coordinates)
        const distance = Math.sqrt(Math.pow(x - locX, 2) + Math.pow(y - locY, 2))

        if (distance < 30 && distance < minDistance) {
          // 30px threshold
          minDistance = distance
          nearestLocation = location
        }
      })

      if (nearestLocation) {
        handleLocationSelect(nearestLocation)
      } else {
        // Create a custom location for the clicked point
        const customLocation: Location = {
          id: `custom-${Date.now()}`,
          name: `Custom Location (${coords[1].toFixed(4)}, ${coords[0].toFixed(4)})`,
          coordinates: coords,
          type: "landmark",
          district: "Custom",
        }
        handleLocationSelect(customLocation)
      }
    },
    [selectionMode, coordsToPixels, pixelsToCoords, handleLocationSelect],
  )

  // Calculate route
  useEffect(() => {
    if (pickup && destination && pickup.id !== destination.id) {
      setIsCalculating(true)
      setError(null)

      // Simulate route calculation
      setTimeout(() => {
        try {
          const distance = calculateDistance(pickup.coordinates, destination.coordinates)
          const duration = Math.max(15, distance * 2) // Rough estimate: 2 minutes per km
          const fare = calculateFare(distance, selectedVehicleType, false)
          const surge = Math.random() > 0.7 // 30% chance of surge pricing

          const routeInfo: RouteInfo = {
            distance,
            duration,
            fare: surge ? fare * 1.5 : fare,
            surge,
            path: [pickup.coordinates, destination.coordinates],
          }

          setRouteInfo(routeInfo)
          onRouteCalculated?.(routeInfo)
        } catch (err) {
          setError("Failed to calculate route")
        } finally {
          setIsCalculating(false)
        }
      }, 1000)
    } else {
      setRouteInfo(null)
    }
  }, [pickup, destination, selectedVehicleType, onRouteCalculated])

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
    const [lng1, lat1] = coord1
    const [lng2, lat2] = coord2

    const R = 6371 // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Get vehicle icon
  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "bike":
        return <Bike className="w-4 h-4" />
      case "car":
        return <Car className="w-4 h-4" />
      case "suv":
        return <Truck className="w-4 h-4" />
      default:
        return <Car className="w-4 h-4" />
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Sierra Leone Interactive Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search locations in Sierra Leone..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                {searchResults.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-gray-500">
                      {location.district} • {location.type}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selection Mode Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectionMode === "pickup" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectionMode(selectionMode === "pickup" ? null : "pickup")}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Set Pickup
            </Button>
            <Button
              variant={selectionMode === "destination" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectionMode(selectionMode === "destination" ? null : "destination")}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Set Destination
            </Button>
            {(pickup || destination) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedLocation(null)
                  setRouteInfo(null)
                  setSelectionMode(null)
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Current Selection Info */}
          {(pickup || destination) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pickup && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <Navigation className="w-4 h-4" />
                    Pickup
                  </div>
                  <div className="text-sm text-green-600 mt-1">{pickup.name}</div>
                </div>
              )}
              {destination && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 font-medium">
                    <MapPin className="w-4 h-4" />
                    Destination
                  </div>
                  <div className="text-sm text-blue-600 mt-1">{destination.name}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Display */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={mapRef}
            className="relative w-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden"
            style={{ height: mapSize.height }}
          >
            <svg
              ref={svgRef}
              width={mapSize.width}
              height={mapSize.height}
              className="absolute inset-0 cursor-crosshair"
              onClick={handleMapClick}
            >
              {/* Background */}
              <rect width="100%" height="100%" fill="url(#mapGradient)" />

              {/* Gradient Definition */}
              <defs>
                <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dcfce7" />
                  <stop offset="50%" stopColor="#dbeafe" />
                  <stop offset="100%" stopColor="#e0f2fe" />
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* Route Path */}
              {routeInfo && pickup && destination && (
                <line
                  x1={coordsToPixels(pickup.coordinates)[0]}
                  y1={coordsToPixels(pickup.coordinates)[1]}
                  x2={coordsToPixels(destination.coordinates)[0]}
                  y2={coordsToPixels(destination.coordinates)[1]}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  opacity="0.8"
                />
              )}

              {/* Location Markers */}
              {SIERRA_LEONE_LOCATIONS.map((location) => {
                const [x, y] = coordsToPixels(location.coordinates)
                const isPickup = pickup?.id === location.id
                const isDestination = destination?.id === location.id
                const isSelected = selectedLocation?.id === location.id

                let color = "#6b7280" // Default gray
                let size = 6

                if (isPickup) {
                  color = "#10b981" // Green for pickup
                  size = 10
                } else if (isDestination) {
                  color = "#3b82f6" // Blue for destination
                  size = 10
                } else if (isSelected) {
                  color = "#f59e0b" // Orange for selected
                  size = 8
                } else if (location.type === "city") {
                  size = 8
                  color = "#374151"
                }

                return (
                  <g key={location.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r={size}
                      fill={color}
                      stroke="white"
                      strokeWidth="2"
                      filter="url(#shadow)"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLocationSelect(location)
                      }}
                    />
                    {(isPickup || isDestination || isSelected || location.type === "city") && (
                      <text
                        x={x}
                        y={y - size - 5}
                        textAnchor="middle"
                        className="text-xs font-medium fill-gray-700 pointer-events-none"
                        style={{ fontSize: "10px" }}
                      >
                        {location.name}
                      </text>
                    )}
                  </g>
                )
              })}

              {/* Selection Mode Indicator */}
              {selectionMode && (
                <text x={mapSize.width / 2} y={30} textAnchor="middle" className="text-sm font-medium fill-blue-600">
                  Click on the map to select {selectionMode} location
                </text>
              )}
            </svg>

            {/* Loading Overlay */}
            {isCalculating && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calculating route...
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Route Information */}
      {routeInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Route Information
              {routeInfo.surge && (
                <Badge variant="destructive" className="ml-2">
                  <Zap className="w-3 h-3 mr-1" />
                  Surge Pricing
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-500">Distance</div>
                  <div className="font-medium">{routeInfo.distance.toFixed(1)} km</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="font-medium">{Math.round(routeInfo.duration)} min</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="text-sm text-gray-500">Estimated Fare</div>
                  <div className="font-medium">
                    Le {routeInfo.fare.toLocaleString()}
                    {routeInfo.surge && <span className="text-xs text-red-600 ml-1">(+50%)</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Type Selection */}
            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-2">Vehicle Type</div>
              <div className="flex gap-2 flex-wrap">
                {VEHICLE_TYPES.map((vehicle) => (
                  <Badge
                    key={vehicle.id}
                    variant={selectedVehicleType === vehicle.id ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    {getVehicleIcon(vehicle.id)}
                    <span className="ml-1">{vehicle.name}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Map Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium mb-3">Map Legend</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
              <span>Pickup Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
              <span>Destination</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-700 border-2 border-white"></div>
              <span>Major Cities</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white"></div>
              <span>Towns & Villages</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
