import { sierraLeoneConfig } from "./sierra-leone-config"

export interface Location {
  lat: number
  lng: number
  address?: string
}

export interface PlaceResult {
  place_id: string
  name: string
  formatted_address: string
  geometry: {
    location: Location
  }
  types: string[]
}

export interface RouteResult {
  distance: {
    text: string
    value: number
  }
  duration: {
    text: string
    value: number
  }
  polyline: string
}

// Client-side service that uses API routes instead of direct Google Maps API calls
class GoogleMapsClientService {
  async geocode(address: string): Promise<Location | null> {
    try {
      const response = await fetch("/api/maps/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`)
      }

      const data = await response.json()
      return data.success ? data.location : null
    } catch (error) {
      console.error("Geocoding error:", error)
      return this.getMockLocation(address)
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await fetch("/api/maps/reverse-geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lat, lng }),
      })

      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.status}`)
      }

      const data = await response.json()
      return data.success ? data.address : null
    } catch (error) {
      console.error("Reverse geocoding error:", error)
      return this.getMockReverseGeocode(lat, lng)
    }
  }

  async searchPlaces(query: string, location?: Location): Promise<PlaceResult[]> {
    try {
      const response = await fetch("/api/maps/search-places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, location }),
      })

      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`)
      }

      const data = await response.json()
      return data.success ? data.places : []
    } catch (error) {
      console.error("Place search error:", error)
      return this.getMockPlaces(query)
    }
  }

  async calculateRoute(origin: Location, destination: Location): Promise<RouteResult | null> {
    try {
      const response = await fetch("/api/maps/calculate-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ origin, destination }),
      })

      if (!response.ok) {
        throw new Error(`Route calculation API error: ${response.status}`)
      }

      const data = await response.json()
      return data.success ? data.route : null
    } catch (error) {
      console.error("Route calculation error:", error)
      return this.getMockRoute(origin, destination)
    }
  }

  // Mock data methods for fallback
  private getMockLocation(address: string): Location {
    const mockLocations: { [key: string]: Location } = {
      freetown: { lat: 8.4657, lng: -13.2317, address: "Freetown, Sierra Leone" },
      bo: { lat: 7.9644, lng: -11.7383, address: "Bo, Sierra Leone" },
      kenema: { lat: 7.8767, lng: -11.19, address: "Kenema, Sierra Leone" },
      makeni: { lat: 8.8833, lng: -12.0333, address: "Makeni, Sierra Leone" },
      koidu: { lat: 8.6439, lng: -10.9708, address: "Koidu, Sierra Leone" },
    }

    const key = address.toLowerCase()
    for (const [location, coords] of Object.entries(mockLocations)) {
      if (key.includes(location)) {
        return coords
      }
    }

    return mockLocations["freetown"]
  }

  private getMockReverseGeocode(lat: number, lng: number): string {
    const locations = sierraLeoneConfig.popularDestinations
    let closestLocation = locations[0]
    let minDistance = Number.POSITIVE_INFINITY

    locations.forEach((location) => {
      const distance = Math.sqrt(
        Math.pow(lat - location.coordinates[0], 2) + Math.pow(lng - location.coordinates[1], 2),
      )
      if (distance < minDistance) {
        minDistance = distance
        closestLocation = location
      }
    })

    return `Near ${closestLocation.name}, Sierra Leone`
  }

  private getMockPlaces(query: string): PlaceResult[] {
    const mockPlaces: PlaceResult[] = [
      {
        place_id: "freetown_1",
        name: "Freetown Central",
        formatted_address: "Central Freetown, Sierra Leone",
        geometry: { location: { lat: 8.4657, lng: -13.2317 } },
        types: ["locality", "political"],
      },
      {
        place_id: "cotton_tree",
        name: "Cotton Tree",
        formatted_address: "Cotton Tree, Freetown, Sierra Leone",
        geometry: { location: { lat: 8.484, lng: -13.2299 } },
        types: ["landmark", "point_of_interest"],
      },
    ]

    return mockPlaces.filter(
      (place) =>
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.formatted_address.toLowerCase().includes(query.toLowerCase()),
    )
  }

  private getMockRoute(origin: Location, destination: Location): RouteResult {
    const distance = this.calculateDistance(origin, destination)
    const duration = (distance / 25) * 60 * 1.3

    return {
      distance: {
        text: `${distance.toFixed(1)} km`,
        value: Math.round(distance * 1000),
      },
      duration: {
        text: `${Math.round(duration)} min`,
        value: Math.round(duration * 60),
      },
      polyline: `mock_polyline_${Date.now()}`,
    }
  }

  private calculateDistance(point1: Location, point2: Location): number {
    const R = 6371
    const dLat = this.toRad(point2.lat - point1.lat)
    const dLon = this.toRad(point2.lng - point1.lng)
    const lat1 = this.toRad(point1.lat)
    const lat2 = this.toRad(point2.lat)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180
  }

  calculatePrice(distance: number, vehicleType: string): number {
    const vehicle = sierraLeoneConfig.vehicleTypes.find((v) => v.id === vehicleType)
    if (!vehicle) return 0

    const now = new Date()
    const hour = now.getHours()
    const month = now.getMonth()

    let price = vehicle.basePrice + distance * vehicle.pricePerKm
    let surgeMultiplier = 1

    const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5

    if (isPeakHour && isWeekday) {
      surgeMultiplier = 1.5
    }

    const isRainySeason = month >= 4 && month <= 9
    if (isRainySeason) {
      surgeMultiplier *= 1.2
    }

    if (hour >= 22 || hour <= 6) {
      surgeMultiplier *= 1.3
    }

    price *= surgeMultiplier
    return Math.round(price)
  }

  // Utility methods
  isWithinSierraLeone(lat: number, lng: number): boolean {
    const bounds = {
      north: 10.0,
      south: 6.9,
      east: -10.3,
      west: -13.4,
    }

    return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east
  }

  getDistrictFromCoordinates(lat: number, lng: number): string {
    if (lat >= 8.3 && lat <= 8.6 && lng >= -13.4 && lng <= -13.1) {
      return "Western Area"
    } else if (lat >= 7.8 && lat <= 8.2 && lng >= -12.0 && lng <= -11.5) {
      return "Bo District"
    } else if (lat >= 7.7 && lat <= 8.0 && lng >= -11.4 && lng <= -11.0) {
      return "Kenema District"
    } else if (lat >= 8.7 && lat <= 9.1 && lng >= -12.3 && lng <= -11.8) {
      return "Bombali District"
    } else if (lat >= 8.5 && lat <= 8.8 && lng >= -11.2 && lng <= -10.8) {
      return "Kono District"
    }
    return "Unknown District"
  }

  formatSierraLeoneAddress(location: Location): string {
    const district = this.getDistrictFromCoordinates(location.lat, location.lng)
    return location.address || `${district}, Sierra Leone`
  }

  getPopularDestinations(): Location[] {
    return sierraLeoneConfig.popularDestinations.map((dest) => ({
      lat: dest.coordinates[0],
      lng: dest.coordinates[1],
      address: `${dest.name}, Sierra Leone`,
    }))
  }

  getVehicleTypes() {
    return sierraLeoneConfig.vehicleTypes
  }

  getPaymentMethods() {
    return sierraLeoneConfig.paymentMethods
  }

  formatCurrency(amount: number): string {
    return `Le ${amount.toLocaleString()}`
  }

  getCurrentSurgeMultiplier(): number {
    const now = new Date()
    const hour = now.getHours()
    const month = now.getMonth()
    const dayOfWeek = now.getDay()

    let multiplier = 1

    const isPeakHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5

    if (isPeakHour && isWeekday) {
      multiplier *= 1.5
    }

    const isRainySeason = month >= 4 && month <= 9
    if (isRainySeason) {
      multiplier *= 1.2
    }

    if (hour >= 22 || hour <= 6) {
      multiplier *= 1.3
    }

    return multiplier
  }
}

// Create a singleton instance for client-side use
export const googleMapsService = new GoogleMapsClientService()

// Utility functions
export function isValidSierraLeoneLocation(lat: number, lng: number): boolean {
  return googleMapsService.isWithinSierraLeone(lat, lng)
}

export function calculateFareDistance(origin: Location, destination: Location): number {
  const R = 6371
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180
  const dLng = ((destination.lng - origin.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function getPopularDestinations(): Location[] {
  return googleMapsService.getPopularDestinations()
}

export function getSierraLeoneCenter(): Location {
  return { lat: 8.4657, lng: -13.2317, address: "Freetown, Sierra Leone" }
}

export default googleMapsService
