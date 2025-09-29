"use client"

import { useState, useEffect, useRef } from "react"
import { realtimeManager } from "@/lib/supabase-realtime"

interface LocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  heading: number | null
  speed: number | null
  timestamp: number | null
}

interface LocationError {
  code: number
  message: string
}

interface UseLocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  updateInterval?: number
  autoUpdate?: boolean
  driverId?: string // For automatic driver location updates
}

export function useLocation(options: UseLocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    updateInterval = 5000,
    autoUpdate = false,
    driverId,
  } = options

  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
  })

  const [error, setError] = useState<LocationError | null>(null)
  const [loading, setLoading] = useState(false)
  const [watching, setWatching] = useState(false)

  const watchIdRef = useRef<number | null>(null)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const geolocationOptions: PositionOptions = {
    enableHighAccuracy,
    timeout,
    maximumAge,
  }

  const handleSuccess = async (position: GeolocationPosition) => {
    const newLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
    }

    setLocation(newLocation)
    setError(null)
    setLoading(false)

    // Auto-update driver location in database if driverId is provided
    if (driverId && newLocation.latitude && newLocation.longitude) {
      try {
        await realtimeManager.updateDriverLocation(
          driverId,
          newLocation.latitude,
          newLocation.longitude,
          newLocation.heading || undefined,
        )
      } catch (err) {
        console.error("Failed to update driver location:", err)
      }
    }
  }

  const handleError = (err: GeolocationPositionError) => {
    const locationError: LocationError = {
      code: err.code,
      message: err.message,
    }

    setError(locationError)
    setLoading(false)

    console.error("Geolocation error:", locationError)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: "Geolocation is not supported by this browser",
      })
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geolocationOptions)
  }

  const startWatching = () => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: "Geolocation is not supported by this browser",
      })
      return
    }

    if (watchIdRef.current !== null) {
      return // Already watching
    }

    setWatching(true)
    setError(null)

    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, geolocationOptions)

    // Set up periodic updates if specified
    if (updateInterval > 0) {
      updateIntervalRef.current = setInterval(() => {
        getCurrentLocation()
      }, updateInterval)
    }
  }

  const stopWatching = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current)
      updateIntervalRef.current = null
    }

    setWatching(false)
  }

  // Auto-start watching if enabled
  useEffect(() => {
    if (autoUpdate) {
      startWatching()
    }

    return () => {
      stopWatching()
    }
  }, [autoUpdate, driverId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching()
    }
  }, [])

  return {
    location,
    error,
    loading,
    watching,
    getCurrentLocation,
    startWatching,
    stopWatching,
    isSupported: !!navigator.geolocation,
  }
}
