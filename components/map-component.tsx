"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Navigation, Locate } from "lucide-react"

interface MapComponentProps {
  pickup?: string
  destination?: string
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
}

export function MapComponent({ pickup, destination, onLocationSelect }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Initialize map (placeholder for actual map integration)
    if (mapRef.current) {
      // This would be where you'd initialize Google Maps, Mapbox, etc.
      console.log("Map initialized")
    }
  }, [])

  const getCurrentLocation = () => {
    setIsLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
          setIsLoading(false)

          // Simulate reverse geocoding
          const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          onLocationSelect?.({ lat: latitude, lng: longitude, address })
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLoading(false)
        },
      )
    }
  }

  return (
    <Card className="w-full h-96">
      <CardContent className="p-0 relative">
        {/* Map Container */}
        <div ref={mapRef} className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center relative">
          {/* Placeholder Map */}
          <div className="text-center space-y-4">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-gray-600 font-medium">Interactive Map</p>
              <p className="text-sm text-gray-500">Map integration with Google Maps/Mapbox would be implemented here</p>
            </div>

            {pickup && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs">
                📍 Pickup: {pickup}
              </div>
            )}

            {destination && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs">
                🏁 Destination: {destination}
              </div>
            )}

            {currentLocation && (
              <div className="absolute bottom-4 left-4 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                📍 Current: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-4 right-4 space-y-2">
          <Button
            size="sm"
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="bg-white text-gray-700 hover:bg-gray-50 border shadow-md"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            ) : (
              <Locate className="h-4 w-4" />
            )}
          </Button>

          <Button size="sm" className="bg-white text-gray-700 hover:bg-gray-50 border shadow-md">
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
