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

class GoogleMapsServerService {
  private apiKey: string

  constructor() {
    // Server-side only - API key is not exposed to client
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || ""
  }

  async geocode(address: string): Promise<Location | null> {
    try {
      if (!this.apiKey) {
        console.warn("Google Maps API key not configured, using mock data")
        return this.getMockLocation(address)
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}&region=sl&bounds=6.9,-13.4|10.0,-10.3`,
      )

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0]
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          address: result.formatted_address,
        }
      }

      // Fallback to mock data if no results
      return this.getMockLocation(address)
    } catch (error) {
      console.error("Geocoding error:", error)
      return this.getMockLocation(address)
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      if (!this.apiKey) {
        return this.getMockReverseGeocode(lat, lng)
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}&region=sl`,
      )

      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address
      }

      return this.getMockReverseGeocode(lat, lng)
    } catch (error) {
      console.error("Reverse geocoding error:", error)
      return this.getMockReverseGeocode(lat, lng)
    }
  }

  async searchPlaces(query: string, location?: Location): Promise<PlaceResult[]> {
    try {
      if (!this.apiKey) {
        return this.getMockPlaces(query)
      }

      const locationBias = location
        ? `&location=${location.lat},${location.lng}&radius=50000`
        : "&location=8.4657,-13.2317&radius=100000"

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${this.apiKey}&region=sl${locationBias}`,
      )

      if (!response.ok) {
        throw new Error(`Places API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === "OK") {
        return data.results.map((place: any) => ({
          place_id: place.place_id,
          name: place.name,
          formatted_address: place.formatted_address,
          geometry: {
            location: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            },
          },
          types: place.types,
        }))
      }

      return this.getMockPlaces(query)
    } catch (error) {
      console.error("Place search error:", error)
      return this.getMockPlaces(query)
    }
  }

  async calculateRoute(origin: Location, destination: Location): Promise<RouteResult | null> {
    try {
      if (!this.apiKey) {
        return this.getMockRoute(origin, destination)
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${this.apiKey}&region=sl&units=metric`,
      )

      if (!response.ok) {
        throw new Error(`Directions API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === "OK" && data.routes.length > 0) {
        const route = data.routes[0].legs[0]
        return {
          distance: route.distance,
          duration: route.duration,
          polyline: data.routes[0].overview_polyline.points,
        }
      }

      return this.getMockRoute(origin, destination)
    } catch (error) {
      console.error("Route calculation error:", error)
      return this.getMockRoute(origin, destination)
    }
  }

  // Mock data methods for fallback when API key is not available
  private getMockLocation(address: string): Location {
    const mockLocations: { [key: string]: Location } = {
      freetown: { lat: 8.4657, lng: -13.2317, address: "Freetown, Sierra Leone" },
      bo: { lat: 7.9644, lng: -11.7383, address: "Bo, Sierra Leone" },
      kenema: { lat: 7.8767, lng: -11.19, address: "Kenema, Sierra Leone" },
      makeni: { lat: 8.8833, lng: -12.0333, address: "Makeni, Sierra Leone" },
      koidu: { lat: 8.6439, lng: -10.9708, address: "Koidu, Sierra Leone" },
      "cotton tree": { lat: 8.484, lng: -13.2299, address: "Cotton Tree, Freetown, Sierra Leone" },
      "lumley beach": { lat: 8.4219, lng: -13.2846, address: "Lumley Beach, Freetown, Sierra Leone" },
      aberdeen: { lat: 8.4167, lng: -13.2667, address: "Aberdeen, Freetown, Sierra Leone" },
      "lungi airport": { lat: 8.6164, lng: -13.1955, address: "Lungi International Airport, Sierra Leone" },
      "big market": { lat: 8.48, lng: -13.235, address: "Big Market, Freetown, Sierra Leone" },
    }

    const key = address.toLowerCase()
    for (const [location, coords] of Object.entries(mockLocations)) {
      if (key.includes(location)) {
        return coords
      }
    }

    return mockLocations["freetown"] // Default to Freetown
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
      {
        place_id: "lungi_airport",
        name: "Lungi International Airport",
        formatted_address: "Lungi, Sierra Leone",
        geometry: { location: { lat: 8.6164, lng: -13.1955 } },
        types: ["airport", "establishment"],
      },
      {
        place_id: "lumley_beach",
        name: "Lumley Beach",
        formatted_address: "Lumley, Freetown, Sierra Leone",
        geometry: { location: { lat: 8.4219, lng: -13.2846 } },
        types: ["natural_feature", "establishment"],
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
    const duration = (distance / 25) * 60 * 1.3 // 25 km/h average with 30% buffer

    return {
      distance: {
        text: `${distance.toFixed(1)} km`,
        value: Math.round(distance * 1000),
      },
      duration: {
        text: `${Math.round(duration)} min`,
        value: Math.round(duration * 60),
      },
      polyline: this.generateMockPolyline(origin, destination),
    }
  }

  private calculateDistance(point1: Location, point2: Location): number {
    const R = 6371 // Earth's radius in km
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

  private generateMockPolyline(origin: Location, destination: Location): string {
    return `polyline_${origin.lat.toFixed(4)}_${origin.lng.toFixed(4)}_to_${destination.lat.toFixed(4)}_${destination.lng.toFixed(4)}`
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
}

// Create a singleton instance for server-side use
export const googleMapsServerService = new GoogleMapsServerService()
export default googleMapsServerService
